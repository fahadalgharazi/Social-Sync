// src/services/ticketmaster.client.js
import { ticketmasterHttp } from '../config/http.js';
import { buildKeywordPipes } from '../services/recommendation/buildKeywords.js';

const RADII_MI = [15, 30, 60, 120, 250];

export async function search({ personalityType, geoPoint, limit = 20, page = 0, z }) {
  const { primary, secondary } = buildKeywordPipes({ personalityType, z });

  for (const radius of RADII_MI) {
    // 1) primary
    const r1 = await tmQuery({ geoPoint, radius, limit, page, keyword: primary });
    if (r1.items.length) return r1;

    // 2) secondary
    const r2 = await tmQuery({ geoPoint, radius, limit, page, keyword: secondary });
    if (r2.items.length) return r2;
  }

  // 3) virtual fallback
  return await tmQuery({ geoPoint: undefined, radius: undefined, limit, page, keyword: "virtual|online" });
}

async function tmQuery({ geoPoint, radius, limit, page, keyword }) {
  try {
    const params = {
      keyword,
      size: limit,
      page,
      sort: 'date,asc',
      locale: '*',
      countryCode: 'US',
    };
    if (geoPoint) params.geoPoint = geoPoint;
    if (radius) { params.radius = radius; params.unit = 'miles'; }

    const { data } = await ticketmasterHttp.get('/events.json', { params });
    const items = data?._embedded?.events ?? [];
    return {
      items: items.map(normalize),
      page: data?.page?.number ?? page,
      totalPages: data?.page?.totalPages ?? 1,
      total: data?.page?.totalElements ?? items.length,
      tried: { keyword, radius },
    };
  } catch (e) {
    // don't blow up the whole search; just return empty for this attempt
    return { items: [], page, totalPages: 0, total: 0, tried: { keyword, radius }, error: e?.message };
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
