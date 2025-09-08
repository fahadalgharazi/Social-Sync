// Backend/src/services/ticketmaster.client.js
import { ticketmasterHttp } from '../config/http.js';

const RADII_MI = [15, 30, 60, 120, 250];
const KEYWORDS = {
  'Reactive Idealist': 'Music',
  'Balanced Realist': 'Music',
  'Sensitive Companion': 'Music',
  'Secure Optimist': 'Music',
};

export async function search({ personalityType, geoPoint, limit = 20, page = 0 }) {
  const keyword = KEYWORDS[personalityType] || 'Music';

  // Try widening radius until we get events
  for (const radius of RADII_MI) {
    try {
      const { data } = await ticketmasterHttp.get('/events.json', {
        params: {
          geoPoint,            // use stored geohash directly
          radius,              // miles
          unit: 'miles',
          keyword,
          size: limit,
          page,
          sort: 'date,asc',
          locale: '*',
          countryCode: 'US',
        },
      });

      const items = data?._embedded?.events ?? [];
      if (items.length) {
        return {
          items: items.map(normalize),
          page: data.page?.number ?? page,
          totalPages: data.page?.totalPages ?? 1,
          total: data.page?.totalElements ?? items.length,
        };
      }
    } catch (e) {
      console.error(`TM search radius=${radius} failed:`, e?.message || e);
    }
  }

  // Fallback: virtual/online
  try {
    const { data } = await ticketmasterHttp.get('/events.json', {
      params: { keyword: 'virtual|online', size: limit, sort: 'date,asc', locale: '*', page },
    });
    const items = data?._embedded?.events ?? [];
    return {
      items: items.map(normalize),
      page: data.page?.number ?? page,
      totalPages: data.page?.totalPages ?? 1,
      total: data.page?.totalElements ?? items.length,
    };
  } catch (e) {
    console.error('TM virtual fallback error:', e?.message || e);
    return { items: [], page: 0, totalPages: 0, total: 0 };
  }
}

function normalize(evt) {
  const img = evt.images?.find(i => i.width >= 300) || evt.images?.[0];
  return {
    id: evt.id,
    name: evt.name,
    url: evt.url,
    date: evt.dates?.start?.localDate || evt.dates?.start?.dateTime || '',
    time: evt.dates?.start?.localTime || '',
    venueName: evt._embedded?.venues?.[0]?.name || '',
    venueCity: evt._embedded?.venues?.[0]?.city?.name || '',
    venueState: evt._embedded?.venues?.[0]?.state?.stateCode || '',
    imageUrl: img?.url || '',
  };
}
