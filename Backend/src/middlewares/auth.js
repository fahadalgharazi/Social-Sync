// Backend/src/middlewares/auth.js
import { supabaseAnon } from '../config/supabase.js';

export default async function authGuard(req, res, next) {
  try {
    const token = req.cookies?.sb_at;
    if (!token) return res.status(401).json({ error: 'Unauthenticated' });

    // Verify the user token with Supabase
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid session' });

    req.user = { id: data.user.id, email: data.user.email, token };
    next();
  } catch (e) {
    next({ status: 401, message: 'Auth check failed' });
  }
}
