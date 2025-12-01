import { http } from "../../../lib/http";

/**
 * Search for users by username or name
 */
export async function searchUsers(query) {
  const { data } = await http.get(`/users/search?q=${encodeURIComponent(query)}`);
  return data?.data || [];
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId) {
  const { data } = await http.get(`/users/${userId}`);
  return data?.data || null;
}
