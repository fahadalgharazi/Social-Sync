import { Router } from 'express';
  import * as EventsController from '../controllers/events.controller.js';
  import asyncHandler from '../middlewares/asyncHandler.js';
  import { validate } from '../middlewares/validate.js'; // NEW
  import { eventSearchSchema } from '../validation/schemas.js'; // NEW

  const router = Router();

  // Remove the old disabled validation function entirely
  // Delete lines 6-18

  // Add validation middleware to the route
  router.post(
    '/search',
    validate(eventSearchSchema), // NEW - runs validation first
    asyncHandler(EventsController.search)
  );

  router.get('/personalities', asyncHandler(EventsController.personalities));

  export default router;
