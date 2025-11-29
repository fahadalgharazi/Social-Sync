import { http } from "../../../lib/http";

/**
 * Get user's friends list
 */
export async function getFriends() {
  const { data } = await http.get("/friends");
  return data?.data || [];
}

/**
 * Get pending friend requests (received)
 */
export async function getPendingRequests() {
  const { data } = await http.get("/friends/requests/pending");
  return data?.data || [];
}

/**
 * Get sent friend requests
 */
export async function getSentRequests() {
  const { data } = await http.get("/friends/requests/sent");
  return data?.data || [];
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(friendId) {
  const { data } = await http.post("/friends/request", { friendId });
  return data;
}

/**
 * Respond to a friend request (accept or reject)
 */
export async function respondToRequest(requestId, action) {
  const { data } = await http.post(`/friends/requests/${requestId}/respond`, { action });
  return data;
}

/**
 * Unfriend a user
 */
export async function unfriend(friendId) {
  const { data } = await http.delete(`/friends/${friendId}`);
  return data;
}
