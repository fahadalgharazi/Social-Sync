import { Router } from 'express';
import * as EventsController from '../controllers/events.controller.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = Router();

// You can keep your inline validator for now:
function validateEventRequest(req, res, next) {
  const { personalityType, zip } = req.body || {};
  if (!personalityType) return res.status(400).json({ error: 'personalityType is required' });
  if (!zip) return res.status(400).json({ error: 'zip code is required' });
  if (!/^\d{5}(-\d{4})?$/.test(String(zip).trim())) {
    return res.status(400).json({ error: 'Invalid ZIP code format' });
  }
  req.body.zip = String(zip).trim();
  next();
}

router.post('/search', validateEventRequest, asyncHandler(EventsController.search));
router.get('/personalities', asyncHandler(EventsController.personalities));

export default router;
