import { ticketmasterHttp } from '../config/http.js';
import { buildPersonaSignals } from './recommendation/buildPersonaSignals.js';
import ngeohash from 'ngeohash';

const RADII_MI = [15, 30, 60, 120, 250];
const MAX_TOTAL = 100;

export async function search({ personalityType, geoPoint, limit = 20, page = 0 }) {
  const { segmentMix, tokens, classificationHints, weights } = buildPersonaSignals(personalityType);
  const segments = Object.keys(segmentMix);

  const targetCounts = Object.fromEntries(
    segments.map((s) => [s, Math.round(MAX_TOTAL * segmentMix[s])]),
  );
  const haveCounts = Object.fromEntries(segments.map((s) => [s, 0]));

  // Decode user geohash once for proximity scoring
  let userLat = null,
    userLon = null;
  try {
    if (geoPoint) {
      const d = ngeohash.decode(geoPoint);
      userLat = d.latitude;
      userLon = d.longitude;
    }
  } catch {}

  const collected = [];
  const seen = new Set();
  const tried = [];

  for (const radius of RADII_MI) {
    for (const segmentName of segments) {
      if (collected.length >= MAX_TOTAL) break;

      const remaining = Math.max(0, targetCounts[segmentName] - haveCounts[segmentName]);
      if (remaining === 0) continue;

      const size = Math.min(25, remaining);
      const hints = classificationHints[segmentName];

      const r = await tmQuery({
        geoPoint,
        radius,
        limit: size,
        page: 0, // paginate locally
        segmentName,
        classificationName: hints?.length ? hints : undefined,
      });

      tried.push({ radius, segmentName, count: r.items.length });

      for (const e of r.items) {
        if (!seen.has(e.id)) {
          seen.add(e.id);
          collected.push(e);
          haveCounts[segmentName] += 1;
          if (collected.length >= MAX_TOTAL) break;
          if (haveCounts[segmentName] >= targetCounts[segmentName]) break;
        }
      }
    }
    if (collected.length >= MAX_TOTAL) break;
  }

  // Fallback if nothing local
  if (collected.length === 0) {
    const r = await tmQuery({ limit: 30, page: 0, keyword: 'virtual' });
    for (const e of r.items)
      if (!seen.has(e.id)) {
        seen.add(e.id);
        collected.push(e);
      }
  }

  // Rank with persona + recency + proximity + diversity, then interleave by segment a bit
  const ranked = rankEvents(collected, tokens, weights, userLat, userLon);

  // Local pagination
  const total = ranked.length;
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = Math.max(0, page) * safeLimit;
  const items = ranked.slice(start, start + safeLimit);

  return { items, page, totalPages, total, tried };
}

async function tmQuery({
  geoPoint,
  radius,
  limit,
  page,
  keyword,
  segmentName,
  classificationName,
}) {
  try {
    const params = {
      size: limit,
      page,
      sort: 'date,asc',
      locale: '*',
      countryCode: 'US',
    };
    if (geoPoint) params.geoPoint = geoPoint;
    if (radius) {
      params.radius = radius;
      params.unit = 'miles';
    }

    if (segmentName) params.segmentName = segmentName;
    if (classificationName) {
      params.classificationName = Array.isArray(classificationName)
        ? classificationName.join(',')
        : classificationName;
    }

    if (keyword) params.keyword = keyword; // only used for virtual fallback

    const { data } = await ticketmasterHttp.get('/events.json', { params });
    const raw = data?._embedded?.events ?? [];
    return {
      items: raw.map(normalize),
      page: data?.page?.number ?? page,
      totalPages: data?.page?.totalPages ?? 1,
      total: data?.page?.totalElements ?? raw.length,
      tried: { geoPoint, radius, segmentName, size: limit, page },
    };
  } catch (e) {
    const status = e?.response?.status;
    const body = e?.response?.data;
    return {
      items: [],
      page,
      totalPages: 0,
      total: 0,
      tried: { geoPoint, radius, segmentName },
      error: e?.message,
      status,
      body,
    };
  }
}

function rankEvents(events, tokens, w, userLat, userLon) {
  // Pre-compute base scores
  const base = events.map((e) => ({
    e,
    persona: personaMatchScore(e, tokens),
    recency: recencyScore(e.date),
    proximity: proximityScore(e, userLat, userLon),
  }));

  // Greedy diversity-aware selection:
  // Sort by base score, then pick top while applying a small penalty to repeated venues/artists.
  base.sort((a, b) => weighted(b, w) - weighted(a, w));

  const picked = [];
  const venueCounts = new Map();

  for (const row of base) {
    const venueKey = (row.e.venueName || '').toLowerCase();
    const repeats = venueCounts.get(venueKey) || 0;
    const diversityPenalty = Math.max(0, w.diversity * (0.2 * repeats)); // 0.2 per repeat

    const finalScore = weighted(row, w) - diversityPenalty;
    row.finalScore = finalScore;
  }

  base.sort((a, b) => b.finalScore - a.finalScore);

  for (const row of base) {
    picked.push(row.e);
    const venueKey = (row.e.venueName || '').toLowerCase();
    venueCounts.set(venueKey, (venueCounts.get(venueKey) || 0) + 1);
  }

  // Light interleave so page 1 isn’t all one segment
  return interleaveBySegment(picked);
}

function weighted(row, w) {
  return w.persona * row.persona + w.recency * row.recency + w.proximity * row.proximity;
}

function personaMatchScore(event, tokens) {
  if (!tokens?.length) return 0;
  const hay = `${event.name} ${event.venueName} ${event.venueCity}`.toLowerCase();
  let s = 0;
  for (const t of tokens) {
    const tok = t.toLowerCase();
    if (hay.includes(tok))
      s += 2; // phrase hit
    else s += tok.split(/\s+/).reduce((acc, p) => acc + (p && hay.includes(p) ? 1 : 0), 0);
  }
  return Math.min(s, 10); // cap
}

function recencyScore(dateStr) {
  if (!dateStr) return 0;
  const now = Date.now();
  const dt = new Date(dateStr).getTime() || now;
  const days = Math.max(0, (dt - now) / (1000 * 60 * 60 * 24));
  // 1.0 for within ~7 days, tapers to 0 by ~45 days
  return Math.max(0, 1 - days / 45);
}

function proximityScore(event, userLat, userLon) {
  const vLat = Number(event.venueLat);
  const vLon = Number(event.venueLon);
  if (
    !Number.isFinite(userLat) ||
    !Number.isFinite(userLon) ||
    !Number.isFinite(vLat) ||
    !Number.isFinite(vLon)
  ) {
    return 0.5; // neutral if we can’t compute
  }
  const d = haversineMiles(userLat, userLon, vLat, vLon);
  // 1.0 when very close, ~0 by ~150 miles
  return Math.max(0, 1 - d / 150);
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function interleaveBySegment(items) {
  const buckets = new Map();
  for (const e of items) {
    const k = e.segment || 'Other';
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(e);
  }
  const order = ['Music', 'Sports', 'Arts & Theatre', 'Miscellaneous', 'Other'];
  const seq = order.filter((o) => buckets.has(o)).map((o) => buckets.get(o));
  for (const [k, arr] of buckets) if (!order.includes(k)) seq.push(arr);

  const out = [];
  let pulled = true;
  while (pulled && out.length < MAX_TOTAL) {
    pulled = false;
    for (const arr of seq) {
      if (arr.length && out.length < MAX_TOTAL) {
        out.push(arr.shift());
        pulled = true;
      }
    }
  }
  return out;
}

function normalize(evt) {
  const img = evt.images?.find((i) => i.width >= 300) || evt.images?.[0];
  const cls = Array.isArray(evt.classifications) ? evt.classifications[0] : null;
  const venue = evt._embedded?.venues?.[0];

  const lat = venue?.location?.latitude;
  const lon = venue?.location?.longitude;

  return {
    id: evt.id,
    name: evt.name,
    url: evt.url,
    date: evt.dates?.start?.localDate || evt.dates?.start?.dateTime || '',
    time: evt.dates?.start?.localTime || '',
    venueName: venue?.name || '',
    venueCity: venue?.city?.name || '',
    venueState: venue?.state?.stateCode || '',
    imageUrl: img?.url || '',
    // classification info for mixing
    segment: cls?.segment?.name || '',
    genre: cls?.genre?.name || '',
    subGenre: cls?.subGenre?.name || '',
    // coords for proximity scoring
    venueLat: lat ? Number(lat) : undefined,
    venueLon: lon ? Number(lon) : undefined,
  };
}
