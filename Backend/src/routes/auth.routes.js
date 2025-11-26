// Backend/src/routes/auth.routes.js
import { Router } from 'express';
import { supabaseAnon, supabaseAdmin } from '../config/supabase.js';
import fetch from 'node-fetch';
import ngeohash from 'ngeohash';
import { validate } from '../middlewares/validate.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';
import { sanitizeBio, sanitizeInterests, sanitizeUsername } from '../utils/sanitize.js';

const router = Router();
async function resolveZipCode(zip) {
  const response = await fetch(`https://api.zippopotam.us/us/${zip}`);

  if (!response.ok) {
    throw new Error('ZIP code not found in database');
  }

  const data = await response.json();
  const place = data.places?.[0];

  if (!place) {
    throw new Error('No location data found for ZIP code');
  }

  const lat = Number(place.latitude);
  const lng = Number(place.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Invalid coordinates for ZIP code');
  }

  return {
    lat,
    lng,
    city: place['place name'],
    state: place['state abbreviation'],
    geohash: ngeohash.encode(lat, lng, 6)
  };
}


router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    // normalized and validated
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      zip,
      gender,
      bio,
      interests
    } = req.body;

    // 1. Check if username already exists
    const { data: existingUsername } = await supabaseAdmin
      .from('user_data')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
        errors: { username: 'This username is already in use' }
      });
    }

    // 2. Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email,
      password
    });

    if (authError) {
      console.error('[SIGNUP] Supabase auth error:', authError);
      return res.status(400).json({
        success: false,
        message: authError.message || 'Failed to create account'
      });
    }

    const user = authData.user;
    if (!user?.id) {
      return res.status(500).json({
        success: false,
        message: 'Account created but user ID not returned'
      });
    }

    // 3. Resolve ZIP code to geographic data
    let geoData;
    try {
      geoData = await resolveZipCode(zip);
    } catch (geoError) {
      console.error('[SIGNUP] ZIP resolution error:', geoError);
      return res.status(400).json({
        success: false,
        message: geoError.message
      });
    }

    // 4. Create user record in custom users table
    const { error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: user.id,
        email: email,
        created_at: new Date().toISOString()
      }]);

    if (userInsertError) {
      console.error('[SIGNUP] User insert error:', userInsertError);
      return res.status(400).json({
        success: false,
        message: 'Failed to save user record'
      });
    }

    // 5. Create user profile data (with sanitization)
    const { error: profileError } = await supabaseAdmin
      .from('user_data')
      .upsert([{
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        username: sanitizeUsername(username),
        gender: gender || null,
        bio: bio ? sanitizeBio(bio) : null,
        city: geoData.city,
        state: geoData.state,
        zipcode: zip,
        latitude: geoData.lat,
        longitude: geoData.lng,
        geohash: geoData.geohash,
        interests: interests ? sanitizeInterests(interests) : null,
        created_at: new Date().toISOString()
      }], { onConflict: 'id' });

    if (profileError) {
      console.error('[SIGNUP] Profile insert error:', profileError);
      return res.status(400).json({
        success: false,
        message: 'Failed to save user profile'
      });
    }

    // 6. Return success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: email,
        username: username
      }
    });

  } catch (error) {
    console.error('[SIGNUP] Unexpected error:', error);
    return next(error);
  }
});



router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // auth supabase
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const { access_token, refresh_token, user } = data.session;
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 3600000 //hour
    };

    // Set auth cookies
    res.cookie('sb_at', access_token, cookieOptions);
    res.cookie('sb_rt', refresh_token, cookieOptions);

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('[LOGIN] Unexpected error:', error);
    return next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('sb_at', { path: '/' });
  res.clearCookie('sb_rt', { path: '/' });

  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});


router.get('/me', async (req, res) => {
  const token = req.cookies?.sb_at;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const { data, error } = await supabaseAnon.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session'
    });
  }

  return res.json({
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  });
});

export default router;