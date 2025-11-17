import { Router } from 'express';
import * as EventsController from '../controllers/events.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import authGuard from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { eventSearchSchema } from '../validators/events.validator.js';

const router = Router();

/**
 * POST /api/events/search
 *
 * LESSON: Why POST for search?
 * Usually searches use GET, but:
 * 1. We need auth (cookie) - POST is clearer for this
 * 2. Request body is cleaner than query strings for complex data
 * 3. User's location data is sensitive - POST doesn't show in logs
 *
 * Middleware chain:
 * 1. authGuard - User must be logged in
 * 2. validate(eventSearchSchema) - Validates/coerces pagination params
 * 3. EventsController.search - Fetches personalized events
 *
 * The old commented-out validation is now replaced with proper Zod schema!
 * Notice how much cleaner this is compared to the old manual validation.
 */
router.post(
  '/search',
  authGuard,
  validate(eventSearchSchema),
  asyncHandler(EventsController.search)
);

/**
 * GET /api/events/personalities
 *
 * Returns list of valid personality types.
 * No auth required - this is public info.
 * No validation needed - no input parameters.
 */
router.get('/personalities', asyncHandler(EventsController.personalities));

export default router;
