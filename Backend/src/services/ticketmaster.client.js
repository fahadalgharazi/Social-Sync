import { ticketmasterHttp } from '../config/http.js';
import ngeohash from 'ngeohash';
import { zipToLatLng } from './geo.service.js';

const RADII_MI = [15, 30, 60, 120, 250];
const KEYWORDS = {
  'Reactive Idealist': 'Music',
  'Balanced Realist': 'Music',
  'Sensitive Companion': 'Music',
  'Secure Optimist': 'Music',
};

export async function search({ personalityType, zip, limit = 20 }) {
  const keyword = KEYWORDS[personalityType] || 'Music';

  // Convert ZIP -> geohash (precision 6 ≈ ~1km)
  const { lat, lng } = await zipToLatLng(zip);
  const geoPoint = ngeohash.encode(lat, lng, 6);

  // Try widening radius
  for (const radius of RADII_MI) {
    try {
      const { data } = await ticketmasterHttp.get('/events.json', {
        params: {
          geoPoint,            // ← geohash
          radius,              // ← miles
          unit: 'miles',
          keyword,
          size: limit,
          sort: 'date,asc',
          locale: '*',
          countryCode: 'US',   // helps scope results
        },
      });
      const items = data?._embedded?.events ?? [];
      if (items.length) return items.map(normalize);
    } catch (e) {
      console.error(`TM search radius=${radius} failed:`, e?.message || e);
    }
  }

  // Fallback: virtual/online
  try {
    const { data } = await ticketmasterHttp.get('/events.json', {
      params: { keyword: 'virtual|online', size: limit, sort: 'date,asc', locale: '*' },
    });
    return (data?._embedded?.events ?? []).map(normalize);
  } catch (e) {
    console.error('TM virtual fallback error:', e?.message || e);
    return [];
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
