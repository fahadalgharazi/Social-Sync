import { http } from "../../../lib/http";

/**
 * Search events.
 * Backend infers user from cookies, geohash & personality from DB.
 * Optional personalityType lets you override the stored value (e.g. for experiments).
 */
export async function searchEvents({personalityType, page = 0, limit = 20 } = {}) {
  const res = await http.post("/events/search", { personalityType, limit, page });
  const { data, pagination, meta } = res.data || {};
  // Controller sends: { success, data, pagination, meta }
  return {
    items: Array.isArray(data) ? data : [],
    pagination: pagination || { page: 0, totalPages: 0, total: 0, limit },
    meta: meta || {},
  };
}

/** Optional: personalities helper (for filters/labels) */
export async function getPersonalities() {
  const { data } = await http.get("/events/personalities");
  return data?.data ?? [];
}

/** Get current user (cookie-based session) */
export async function getMe() {
  const { data } = await http.get("/auth/me");
  return data?.user || null;
}
