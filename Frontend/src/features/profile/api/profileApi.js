import { http } from "../../../lib/http";

/**
 * Update user profile
 */
export async function updateProfile(updates) {
  const { data } = await http.patch("/profile", updates);
  return data?.data || null;
}
