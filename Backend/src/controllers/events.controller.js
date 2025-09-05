import * as EventsService from '../services/events.service.js';

export async function search(req, res) {
  const { personalityType, zip, limit = 20 } = req.body;
  const data = await EventsService.search({ personalityType, zip, limit });
  res.json({
    success: true,
    data,
    meta: { personalityType, zip, count: data.length, timestamp: new Date().toISOString() },
  });
}

export async function personalities(_req, res) {
  res.json({
    success: true,
    data: ['Reactive Idealist','Balanced Realist','Sensitive Companion','Secure Optimist'],
  });
}
