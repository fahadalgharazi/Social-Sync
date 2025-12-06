import { http } from "../../../lib/http";

/**
 * Get events a friend is attending or interested in
 */
export async function getFriendEvents(friendId) {
  const { data } = await http.get(`/user-events/friends/${friendId}`);
  return data?.data?.events || [];
}
