import { ticketmasterHttp } from '../config/http.js';

// simple mapping for now; customize later
const KEYWORDS = {
  'Reactive Idealist': 'Music',
  'Balanced Realist': 'Music',
  'Sensitive Companion': 'Music',
  'Secure Optimist': 'Music',
};

const RADII_MI = [15, 30, 60, 120, 250];

export async function search({ personalityType, zip, limit = 20 }) {
  const keyword = KEYWORDS[personalityType] || KEYWORDS['Balanced Realist'];

  for (const radius of RADII_MI) {
    try {
      const { data } = await ticketmasterHttp.get('/events.json', {
        params: {
          postalCode: zip,       // use ZIP (no hard-coded city)
          radius,
          unit: 'miles',
          keyword,
          size: limit,
          sort: 'date,asc',
          locale: '*',
        },
      });
      const items = data?._embedded?.events ?? [];
      if (items.length) return items.map(normalize);
    } catch (err) {
      console.error(`Ticketmaster search (radius ${radius}) failed:`, err?.message || err);
    }
  }

  // fallback: virtual/online
  try {
    const { data } = await ticketmasterHttp.get('/events.json', {
      params: { keyword: 'virtual|online', size: limit, sort: 'date,asc', locale: '*' },
    });
    return (data?._embedded?.events ?? []).map(normalize);
  } catch {
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
