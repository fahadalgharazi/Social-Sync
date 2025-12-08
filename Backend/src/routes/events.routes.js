import { Router } from 'express';
import * as EventsController from '../controllers/events.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import authGuard from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { eventSearchSchema } from '../validators/events.validator.js';

const router = Router();

router.post(
  '/search',
  authGuard,
  validate(eventSearchSchema),
  asyncHandler(EventsController.search)
);

router.get('/personalities', asyncHandler(EventsController.personalities));

export default router;