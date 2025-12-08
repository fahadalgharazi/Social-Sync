import { Router } from 'express';
import * as ProfileController from '../controllers/profile.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validators/profile.validator.js';

const router = Router();

// Update profile
router.patch('/', validate(updateProfileSchema), asyncHandler(ProfileController.updateProfile));

export default router;
