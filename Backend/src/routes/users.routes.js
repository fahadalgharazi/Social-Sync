import { Router } from 'express';
import * as UsersController from '../controllers/users.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { validateQuery } from '../middlewares/validate.js';
import { searchUsersSchema } from '../validators/users.validator.js';

const router = Router();

// Search for users
router.get('/search', validateQuery(searchUsersSchema), asyncHandler(UsersController.searchUsers));

// Get user profile by ID
router.get('/:userId', asyncHandler(UsersController.getUserProfile));

export default router;
