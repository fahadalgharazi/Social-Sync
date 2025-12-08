import { http } from "../../../lib/http";

/**
 * Create a new group
 */
export async function createGroup({ name, description, isPrivate }) {
  const payload = {
    name,
    description,
    is_private: isPrivate,
  };
  const { data } = await http.post("/groups", payload);
  return data?.data;
}

/**
 * Get user's groups
 */
export async function getUserGroups() {
  const { data } = await http.get("/groups");
  return data?.data || [];
}

/**
 * Get a specific group
 */
export async function getGroup(groupId) {
  const { data } = await http.get(`/groups/${groupId}`);
  return data?.data;
}

/**
 * Update a group
 */
export async function updateGroup(groupId, updates) {
  const { data } = await http.patch(`/groups/${groupId}`, updates);
  return data?.data;
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId) {
  const { data } = await http.delete(`/groups/${groupId}`);
  return data;
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId) {
  const { data } = await http.get(`/groups/${groupId}/members`);
  return data?.data || [];
}

/**
 * Add a member to the group
 */
export async function addGroupMember(groupId, userId, role = "member") {
  const { data } = await http.post(`/groups/${groupId}/members`, { user_id: userId, role });
  return data;
}

/**
 * Remove a member from the group
 */
export async function removeGroupMember(groupId, userId) {
  const { data } = await http.delete(`/groups/${groupId}/members/${userId}`);
  return data;
}

/**
 * Get group events
 */
export async function getGroupEvents(groupId) {
  const { data } = await http.get(`/groups/${groupId}/events`);
  return data?.data || [];
}

/**
 * Add an event to the group
 */
export async function addGroupEvent(groupId, eventId) {
  const { data } = await http.post(`/groups/${groupId}/events`, { event_id: eventId });
  return data;
}

/**
 * Remove an event from the group
 */
export async function removeGroupEvent(groupId, eventId) {
  const { data } = await http.delete(`/groups/${groupId}/events/${eventId}`);
  return data;
}
