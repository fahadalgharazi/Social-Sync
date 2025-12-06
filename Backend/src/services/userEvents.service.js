import { supabaseAdmin } from '../config/supabase.js';

/**
 * Add an event to user's list (interested or going)
 */
export async function addUserEvent(userId, eventData) {
  const { data, error } = await supabaseAdmin
    .from('user_events')
    .insert([
      {
        user_id: userId,
        event_id: eventData.event_id,
        event_name: eventData.event_name,
        event_date: eventData.event_date,
        venue_name: eventData.venue_name || null,
        venue_city: eventData.venue_city || null,
        venue_state: eventData.venue_state || null,
        image_url: eventData.image_url || null,
        status: eventData.status,
        added_at: new Date().toISOString(),
      },
    ])
    .select('*')
    .single();

  if (error) {
    // Check for unique constraint violation
    if (error.code === '23505') {
      throw new Error('You have already added this event');
    }
    throw new Error('Failed to add event');
  }

  return data;
}

/**
 * Get all events for a user
 */
export async function getUserEvents(userId, status = null) {
  let query = supabaseAdmin
    .from('user_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Failed to fetch user events');
  }

  return data;
}

/**
 * Update event status (interested → going, going → went, etc.)
 */
export async function updateUserEventStatus(userId, eventId, newStatus) {
  const { data, error } = await supabaseAdmin
    .from('user_events')
    .update({ status: newStatus })
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to update event status');
  }

  return data;
}

/**
 * Remove an event from user's list
 */
export async function removeUserEvent(userId, eventId) {
  const { error } = await supabaseAdmin
    .from('user_events')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  if (error) {
    throw new Error('Failed to remove event');
  }

  return true;
}

/**
 * Get events a specific user is attending (for viewing friend's events)
 * Requires the current user to be friends with the target user
 */
export async function getFriendEvents(currentUserId, friendId) {
  // First, verify that currentUser is friends with friendId
  const { data: friendship, error: friendshipError } = await supabaseAdmin
    .from('friendships')
    .select('*')
    .eq('status', 'accepted')
    .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`)
    .single();

  if (friendshipError || !friendship) {
    throw new Error('Not authorized to view this user\'s events');
  }

  // If friendship verified, get the friend's events
  const { data, error } = await supabaseAdmin
    .from('user_events')
    .select('*')
    .eq('user_id', friendId)
    .in('status', ['interested', 'going'])
    .order('event_date', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch friend events');
  }

  return data;
}

/**
 * Get all friends attending a specific event
 */
export async function getFriendsAttendingEvent(userId, eventId) {
  // First, get user's friend IDs
  const { data: friendships, error: friendshipError } = await supabaseAdmin
    .from('friendships')
    .select('*')
    .eq('status', 'accepted')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (friendshipError) {
    throw new Error('Failed to fetch friends');
  }

  const friendIds = friendships.map((f) => (f.user_id === userId ? f.friend_id : f.user_id));

  if (friendIds.length === 0) {
    return [];
  }

  // Get friends attending this event
  const { data: attendees, error: attendeeError } = await supabaseAdmin
    .from('user_events')
    .select('user_id')
    .eq('event_id', eventId)
    .in('user_id', friendIds)
    .in('status', ['interested', 'going']);

  if (attendeeError) {
    throw new Error('Failed to fetch event attendees');
  }

  if (attendees.length === 0) {
    return [];
  }

  // Get friend profiles
  const attendeeIds = attendees.map((a) => a.user_id);
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('user_data')
    .select('id, username, first_name, last_name')
    .in('id', attendeeIds);

  if (profileError) {
    throw new Error('Failed to fetch attendee profiles');
  }

  return profiles;
}
