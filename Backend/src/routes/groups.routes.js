import { Router } from 'express';
import * as GroupsController from '../controllers/groups.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import {
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
  addGroupEventSchema,
} from '../validators/groups.validator.js';

const router = Router();

// Group CRUD
router.post('/', validate(createGroupSchema), asyncHandler(GroupsController.createGroup));
router.get('/', asyncHandler(GroupsController.getUserGroups));
router.get('/:groupId', asyncHandler(GroupsController.getGroup));
router.patch('/:groupId', validate(updateGroupSchema), asyncHandler(GroupsController.updateGroup));
router.delete('/:groupId', asyncHandler(GroupsController.deleteGroup));

// Group Members
router.get('/:groupId/members', asyncHandler(GroupsController.getGroupMembers));
router.post('/:groupId/members', validate(addMemberSchema), asyncHandler(GroupsController.addMember));
router.delete('/:groupId/members/:userId', asyncHandler(GroupsController.removeMember));

// Group Events
router.get('/:groupId/events', asyncHandler(GroupsController.getGroupEvents));
router.post('/:groupId/events', validate(addGroupEventSchema), asyncHandler(GroupsController.addGroupEvent));
router.delete('/:groupId/events/:eventId', asyncHandler(GroupsController.removeGroupEvent));

export default router;
