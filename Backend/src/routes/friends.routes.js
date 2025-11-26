import { Router } from 'express';
import * as FriendsController from '../controllers/friends.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { sendFriendRequestSchema, respondToRequestSchema } from '../validators/friends.validator.js';

const router = Router();

// Send a friend request
router.post('/request', validate(sendFriendRequestSchema), asyncHandler(FriendsController.sendRequest));

// Get all friends
router.get('/', asyncHandler(FriendsController.getFriends));

// Get pending requests (received)
router.get('/requests/pending', asyncHandler(FriendsController.getPendingRequests));

// Get sent requests
router.get('/requests/sent', asyncHandler(FriendsController.getSentRequests));

// Respond to a friend request (accept/reject)
router.post('/requests/:requestId/respond', validate(respondToRequestSchema), asyncHandler(FriendsController.respondToRequest));

// Unfriend a user
router.delete('/:friendId', asyncHandler(FriendsController.unfriend));

export default router;
