import * as UserEventsService from '../services/userEvents.service.js';
import { sendError, ok, created } from '../utils/errorResponse.js';

/**
 * Add an event to user's list
 * POST /api/user-events
 */
export async function addEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const eventData = req.body;

    const userEvent = await UserEventsService.addUserEvent(userId, eventData);

    return created(res, { event: userEvent }, 'Event added successfully');
  } catch (error) {
    if (error.message.includes('already added')) {
      return sendError(res, 409, error.message);
    }
    next(error);
  }
}

/**
 * Get user's events
 * GET /api/user-events?status=going
 */
export async function getEvents(req, res, next) {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const events = await UserEventsService.getUserEvents(userId, status);

    return ok(res, events, 'Events retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Update event status
 * PATCH /api/user-events/:eventId
 */
export async function updateEventStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const { status } = req.body;

    const updatedEvent = await UserEventsService.updateUserEventStatus(userId, eventId, status);

    return ok(res, { event: updatedEvent }, 'Event status updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Remove an event from user's list
 * DELETE /api/user-events/:eventId
 */
export async function removeEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    await UserEventsService.removeUserEvent(userId, eventId);

    return ok(res, null, 'Event removed successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get events a friend is attending
 * GET /api/user-events/friends/:friendId
 */
export async function getFriendEvents(req, res, next) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const events = await UserEventsService.getFriendEvents(userId, friendId);

    return ok(res, { events, count: events.length }, 'Friend events retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get friends attending a specific event
 * GET /api/user-events/event/:eventId/friends
 */
export async function getFriendsAttendingEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const friends = await UserEventsService.getFriendsAttendingEvent(userId, eventId);

    return ok(res, friends, 'Attendees retrieved successfully');
  } catch (error) {
    next(error);
  }
}
