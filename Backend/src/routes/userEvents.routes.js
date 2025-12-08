import { Router } from 'express';
import * as UserEventsController from '../controllers/userEvents.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { addUserEventSchema, updateUserEventSchema } from '../validators/userEvents.validator.js';

const router = Router();

// Add an event to user's list
router.post('/', validate(addUserEventSchema), asyncHandler(UserEventsController.addEvent));

// Get user's events (with optional status filter)
router.get('/', asyncHandler(UserEventsController.getEvents));

// Update event status
router.patch('/:eventId', validate(updateUserEventSchema), asyncHandler(UserEventsController.updateEventStatus));

// Remove an event
router.delete('/:eventId', asyncHandler(UserEventsController.removeEvent));

// Get events a friend is attending
router.get('/friends/:friendId', asyncHandler(UserEventsController.getFriendEvents));

// Get friends attending a specific event
router.get('/event/:eventId/friends', asyncHandler(UserEventsController.getFriendsAttendingEvent));

export default router;
