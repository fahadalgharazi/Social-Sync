import * as GroupsService from '../services/groups.service.js';
import { sendError, ok, created } from '../utils/errorResponse.js';

/**
 * Create a new group
 * POST /api/groups
 */
export async function createGroup(req, res, next) {
  try {
    const userId = req.user.id;
    const groupData = req.body;

    const group = await GroupsService.createGroup(userId, groupData);

    return created(res, { group }, 'Group created successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's groups
 * GET /api/groups
 */
export async function getUserGroups(req, res, next) {
  try {
    const userId = req.user.id;

    const groups = await GroupsService.getUserGroups(userId);

    return ok(res, groups, 'Groups retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get group details
 * GET /api/groups/:groupId
 */
export async function getGroup(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    const group = await GroupsService.getGroup(groupId, userId);

    return ok(res, group, 'Group retrieved successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    if (error.message.includes('access')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}

/**
 * Update group
 * PATCH /api/groups/:groupId
 */
export async function updateGroup(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;
    const updates = req.body;

    const group = await GroupsService.updateGroup(groupId, userId, updates);

    return ok(res, { group }, 'Group updated successfully');
  } catch (error) {
    if (error.message.includes('admin')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}

/**
 * Delete group
 * DELETE /api/groups/:groupId
 */
export async function deleteGroup(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    await GroupsService.deleteGroup(groupId, userId);

    return ok(res, null, 'Group deleted successfully');
  } catch (error) {
    if (error.message.includes('creator')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}

/**
 * Get group members
 * GET /api/groups/:groupId/members
 */
export async function getGroupMembers(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    const members = await GroupsService.getGroupMembers(groupId, userId);

    return ok(res, members, 'Members retrieved successfully');
  } catch (error) {
    if (error.message.includes('denied')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}

/**
 * Add member to group
 * POST /api/groups/:groupId/members
 */
export async function addMember(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;
    const { user_id: newUserId, role } = req.body;

    const membership = await GroupsService.addMember(groupId, userId, newUserId, role);

    return created(res, membership, 'Member added successfully');
  } catch (error) {
    if (error.message.includes('already a member')) {
      return sendError(res, 409, error.message);
    }
    if (error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    if (error.message.includes('admin')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}

/**
 * Remove member from group
 * DELETE /api/groups/:groupId/members/:userId
 */
export async function removeMember(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId, userId: memberIdToRemove } = req.params;

    await GroupsService.removeMember(groupId, userId, memberIdToRemove);

    return ok(res, null, 'Member removed successfully');
  } catch (error) {
    if (error.message.includes('admin')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}

/**
 * Get group events
 * GET /api/groups/:groupId/events
 */
export async function getGroupEvents(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    const events = await GroupsService.getGroupEvents(groupId, userId);

    return ok(res, { events, count: events.length }, 'Group events retrieved successfully');
  } catch (error) {
    if (error.message.includes('denied')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}

/**
 * Add event to group
 * POST /api/groups/:groupId/events
 */
export async function addGroupEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;
    const eventData = req.body;

    const groupEvent = await GroupsService.addGroupEvent(groupId, userId, eventData);

    return created(res, { event: groupEvent }, 'Event added to group successfully');
  } catch (error) {
    if (error.message.includes('already added')) {
      return sendError(res, 409, error.message);
    }
    if (error.message.includes('members')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}

/**
 * Remove event from group
 * DELETE /api/groups/:groupId/events/:eventId
 */
export async function removeGroupEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { groupId, eventId } = req.params;

    await GroupsService.removeGroupEvent(groupId, userId, eventId);

    return ok(res, null, 'Event removed from group successfully');
  } catch (error) {
    if (error.message.includes('admin')) {
      return sendError(res, 403, error.message);
    }
    next(error);
  }
}
