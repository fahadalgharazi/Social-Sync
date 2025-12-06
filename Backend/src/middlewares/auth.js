// Backend/src/middlewares/auth.js
import { supabaseAnon } from '../config/supabase.js';

export default async function authGuard(req, res, next) {
  try {
    const token = req.cookies?.sb_at;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify the user token with Supabase
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    req.user = { id: data.user.id, email: data.user.email, token };
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}
