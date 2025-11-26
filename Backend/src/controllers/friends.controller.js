import * as FriendsService from '../services/friends.service.js';
import { sendError, ok, created } from '../utils/errorResponse.js';

/**
 * Send a friend request
 * POST /api/friends/request
 */
export async function sendRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    const request = await FriendsService.sendFriendRequest(userId, friendId);

    return created(res, { request }, 'Friend request sent successfully');
  } catch (error) {
    if (error.message.includes('already friends') || error.message.includes('already pending')) {
      return sendError(res, 409, error.message);
    }
    if (error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    if (error.message.includes('yourself')) {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
}

/**
 * Get all friends (accepted)
 * GET /api/friends
 */
export async function getFriends(req, res, next) {
  try {
    const userId = req.user.id;

    const friends = await FriendsService.getFriends(userId);

    return ok(res, { friends, count: friends.length }, 'Friends retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get pending friend requests (received)
 * GET /api/friends/requests/pending
 */
export async function getPendingRequests(req, res, next) {
  try {
    const userId = req.user.id;

    const requests = await FriendsService.getPendingRequests(userId);

    return ok(res, { requests, count: requests.length }, 'Pending requests retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get sent friend requests
 * GET /api/friends/requests/sent
 */
export async function getSentRequests(req, res, next) {
  try {
    const userId = req.user.id;

    const requests = await FriendsService.getSentRequests(userId);

    return ok(res, { requests, count: requests.length }, 'Sent requests retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Accept or reject a friend request
 * POST /api/friends/requests/:requestId/respond
 */
export async function respondToRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body;

    if (action === 'accept') {
      const friendship = await FriendsService.acceptFriendRequest(userId, requestId);
      return ok(res, { friendship }, 'Friend request accepted');
    } else {
      await FriendsService.rejectFriendRequest(userId, requestId);
      return ok(res, null, 'Friend request rejected');
    }
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
}

/**
 * Unfriend a user
 * DELETE /api/friends/:friendId
 */
export async function unfriend(req, res, next) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    await FriendsService.unfriend(userId, friendId);

    return ok(res, null, 'Friend removed successfully');
  } catch (error) {
    next(error);
  }
}
