// Backend/src/controllers/events.controller.js
import * as EventsService from '../services/events.service.js';

export async function search(req, res, next) {
  try {
    const userId = req.user.id;
    const { personalityType, limit = 20, page = 0 } = req.body || {};

    const {
      items,
      page: currentPage,
      totalPages,
      total,
      personalityType: resolvedType,
    } = await EventsService.search({ userId, personalityType, limit, page });

    res.json({
      success: true,
      data: items,
      pagination: {
        page: currentPage,
        totalPages,
        total,
        limit,
      },
      meta: {
        personalityType: resolvedType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function personalities(_req, res) {
  res.json({
    success: true,
    data: ['Reactive Idealist', 'Balanced Realist', 'Sensitive Companion', 'Secure Optimist'],
  });
}
