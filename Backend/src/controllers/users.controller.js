import * as UsersService from '../services/users.service.js';
import { ok } from '../utils/errorResponse.js';

/**
 * Search for users
 * GET /api/users/search?q=john
 */
export async function searchUsers(req, res, next) {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const users = await UsersService.searchUsers(q, currentUserId, limit);

    return ok(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get user profile by ID
 * GET /api/users/:userId
 */
export async function getUserProfile(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await UsersService.getUserProfile(userId);

    return ok(res, user, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
}
