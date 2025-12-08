import { http } from "../../../lib/http";

/**
 * Add an event to user's event list (interested or going)
 */
export async function addUserEvent({ eventId, eventName, eventDate, venueName, status }) {
  const payload = {
    event_id: eventId,
    event_name: eventName,
    event_date: eventDate,
    venue_name: venueName,
    status, // 'interested' or 'going'
  };

  const { data } = await http.post("/user-events", payload);
  return data;
}

/**
 * Get current user's events
 */
export async function getUserEvents() {
  const { data } = await http.get("/user-events");
  return data?.data || [];
}

/**
 * Update user's status for an event
 */
export async function updateUserEventStatus(eventId, status) {
  const { data } = await http.patch(`/user-events/${eventId}`, { status });
  return data;
}

/**
 * Remove event from user's event list
 */
export async function removeUserEvent(eventId) {
  const { data } = await http.delete(`/user-events/${eventId}`);
  return data;
}

/**
 * Get friends attending a specific event
 */
export async function getFriendsAttendingEvent(eventId) {
  const { data } = await http.get(`/user-events/event/${eventId}/friends`);
  return data?.data || [];
}

/**
 * Get a friend's events
 */
export async function getFriendEvents(friendId) {
  const { data } = await http.get(`/user-events/friends/${friendId}`);
  return data?.data || [];
}
