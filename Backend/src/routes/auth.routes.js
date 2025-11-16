// Backend/src/routes/auth.routes.js
import { Router } from 'express';
import { supabaseAnon, supabaseAdmin } from '../config/supabase.js';
import fetch from 'node-fetch';
import ngeohash from 'ngeohash';

const router = Router();

// Helper: ZIP -> lat/lng/city/state
async function zipToLatLng(zip) {
  const r = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!r.ok) throw new Error('Invalid ZIP');
  const j = await r.json();
  const p = j.places?.[0];
  const lat = Number(p?.latitude),
    lng = Number(p?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('ZIP missing coords');
  return { lat, lng, city: p['place name'], state: p['state abbreviation'] };
}

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, gender, bio, interests, zip } = req.body || {};

    console.log(req.body);
    if (!email || !password || !firstName || !lastName || !zip) {
      return next({ status: 400, message: 'Missing required fields' });
    }
    const emailNorm = String(email).trim().toLowerCase();
    const zipNorm = String(zip).trim();
    if (!/^\d{5}(-\d{4})?$/.test(zipNorm)) {
      return next({ status: 400, message: 'Invalid ZIP format' });
    }

    // 1) Supabase auth user
    const { data: auth, error: aerr } = await supabaseAnon.auth.signUp({
      email: emailNorm,
      password,
    });
    if (aerr) {
      console.error('[SIGNUP] supabase signUp error:', aerr);
      return next({ status: 400, message: aerr.message || 'Sign up failed' });
    }
    const user = auth.user;
    if (!user?.id) return next({ status: 500, message: 'No user returned from auth' });

    //ZIP -> coords + geohash
    let lat, lng, city, state, geohash;
    try {
      const r = await fetch(`https://api.zippopotam.us/us/${zipNorm}`);
      if (!r.ok) {
        console.error('[SIGNUP] zippopotam non-200:', r.status);
        return next({ status: 400, message: 'ZIP not found' });
      }
      const j = await r.json();
      const p = j.places?.[0];
      lat = Number(p?.latitude);
      lng = Number(p?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return next({ status: 400, message: 'ZIP missing coordinates' });
      }
      city = p['place name'];
      state = p['state abbreviation'];
      geohash = ngeohash.encode(lat, lng, 6);
    } catch (e) {
      console.error('[SIGNUP] zippopotam fetch error:', e);
      return next({ status: 400, message: 'Failed to resolve ZIP' });
    }

    // 3) Insert rows (service role)
    const interestsArr =
      typeof interests === 'string'
        ? interests
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(interests)
          ? interests
          : [];
    const now = new Date().toISOString();

    const { error: uerr } = await supabaseAdmin.from('users').insert([
      {
        id: user.id,
        email: emailNorm,
        created_at: now,
      },
    ]);
    if (uerr) {
      console.error('[SIGNUP] insert users error:', uerr);
      return next({ status: 400, message: uerr.message || 'Could not save user' });
    }

    const { error: derr } = await supabaseAdmin.from('user_data').upsert(
      [
        {
          id: user.id,
          first_name: String(firstName).trim(),
          last_name: String(lastName).trim(),
          gender: gender || null,
          bio: bio || null,
          city,
          state,
          zipcode: zipNorm,
          latitude: lat,
          longitude: lng,
          geohash,
          interests: interestsArr,
          created_at: now,
        },
      ],
      { onConflict: 'id' },
    );
    if (derr) {
      console.error('[SIGNUP] upsert user_data error:', derr);
      return next({ status: 400, message: derr.message || 'Could not save profile' });
    }

    return res.status(201).json({ ok: true, user: { id: user.id, email: emailNorm } });
  } catch (e) {
    console.error('[SIGNUP] unexpected error:', e);
    return next({ status: 400, message: e.message || 'Signup failed' });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res, next) => {
  try {
    console.log('[LOGIN] body:', { email: req.body?.email, hasPwd: !!req.body?.password });

    const { email, password } = req.body;
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
    if (error) return next({ status: 401, message: 'Invalid credentials' });

    const { access_token, refresh_token, user } = data.session;

    // ✅ Dynamic cookie options based on environment
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOpts = {
      httpOnly: true,
      secure: isProduction, // true in prod (HTTPS), false in dev
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in prod
      path: '/',
      maxAge: 3600000, // 1 hour (optional but recommended)
    };

    res.cookie('sb_at', access_token, cookieOpts);
    res.cookie('sb_rt', refresh_token, cookieOpts);

    res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (e) {
    next({ status: 401, message: e.message || 'Login failed' });
  }
});

// --- LOGOUT ---
router.post('/logout', (req, res) => {
  res.clearCookie('sb_at', { path: '/' });
  res.clearCookie('sb_rt', { path: '/' });
  res.json({ ok: true });
});

// --- ME ---
router.get('/me', async (req, res) => {
  const token = req.cookies?.sb_at;
  if (!token) return res.status(401).json({ error: 'Unauthenticated' });
  const { data, error } = await supabaseAnon.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'Invalid session' });
  res.json({ user: { id: data.user.id, email: data.user.email } });
});

export default router;
