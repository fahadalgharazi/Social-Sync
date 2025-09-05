// // backend/routes/events.js
// import express from 'express';
// import { searchEvents } from '../services/ticketmaster.js';

// // Create a router instance - this will handle all /api/events/* routes
// const router = express.Router();

// // ============================================
// // VALIDATION MIDDLEWARE
// // ============================================
// function validateEventRequest(req, res, next) {
//   const { personalityType, zip } = req.body;

//   if (!personalityType) {
//     return res.status(400).json({ error: 'personalityType is required' });
//   }

//   if (!zip) {
//     return res.status(400).json({ error: 'zip code is required' });
//   }

//   if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) {
//     return res.status(400).json({ error: 'Invalid ZIP code format' });
//   }

//   req.body.zip = zip.trim();
//   next();
// }

// // ============================================
// // ROUTE HANDLERS
// // ============================================

// // POST /api/events/search
// router.post('/search', validateEventRequest, async (req, res) => {
//   try {
//     const { personalityType, zip, limit = 20 } = req.body;

//     console.log(`📡 API request: ${personalityType} events near ${zip}`);

//     const events = await searchEvents(personalityType, zip, limit);

//     res.json({
//       success: true,
//       data: events,
//       meta: {
//         personalityType,
//         zip,
//         count: events.length,
//         timestamp: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error('Events search error:', error);

//     res.status(500).json({
//       success: false,
//       error: 'Failed to search for events',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// });

// // GET /api/events/personalities
// router.get('/personalities', (req, res) => {
//   const personalities = [
//     'Reactive Idealist',
//     'Balanced Realist',
//     'Sensitive Companion',
//     'Secure Optimist',
//   ];

//   res.json({
//     success: true,
//     data: personalities,
//   });
// });

// // ============================================
// // EXPORT THE ROUTER
// // ============================================
// export default router;
