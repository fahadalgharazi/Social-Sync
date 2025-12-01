import * as ProfileService from '../services/profile.service.js';
import { ok } from '../utils/errorResponse.js';

/**
 * Update user profile
 * PATCH /api/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const profile = await ProfileService.updateProfile(userId, updates);

    return ok(res, profile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}
