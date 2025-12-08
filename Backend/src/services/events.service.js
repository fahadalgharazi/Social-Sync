import * as TM from './ticketmaster.client.js';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get user's status for multiple events
 * Returns a map of eventId -> status
 */
async function getUserEventStatuses(userId, eventIds) {
  if (!eventIds || eventIds.length === 0) {
    return {};
  }

  const { data: userEvents, error } = await supabaseAdmin
    .from('user_events')
    .select('event_id, status')
    .eq('user_id', userId)
    .in('event_id', eventIds);

  if (error || !userEvents) {
    return {};
  }

  // Build map of eventId -> status
  const statusMap = {};
  userEvents.forEach((userEvent) => {
    statusMap[userEvent.event_id] = userEvent.status;
  });

  return statusMap;
}

/**
 * Get friends attending multiple events
 * Returns a map of eventId -> array of friends
 */
async function getFriendsAttendingEvents(userId, eventIds) {
  if (!eventIds || eventIds.length === 0) {
    return {};
  }

  // Get user's friend IDs
  const { data: friendships, error: friendshipError } = await supabaseAdmin
    .from('friendships')
    .select('*')
    .eq('status', 'accepted')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (friendshipError || !friendships || friendships.length === 0) {
    return {};
  }

  const friendIds = friendships.map((f) => (f.user_id === userId ? f.friend_id : f.user_id));

  // Get friends attending these events
  const { data: attendees, error: attendeeError } = await supabaseAdmin
    .from('user_events')
    .select('event_id, user_id')
    .in('event_id', eventIds)
    .in('user_id', friendIds)
    .in('status', ['interested', 'going']);

  if (attendeeError || !attendees) {
    return {};
  }

  if (attendees.length === 0) {
    return {};
  }

  // Get friend profiles
  const attendeeIds = [...new Set(attendees.map((a) => a.user_id))];
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('user_data')
    .select('id, username, first_name, last_name')
    .in('id', attendeeIds);

  if (profileError) {
    return {};
  }

  // Build map of eventId -> friends
  const friendsByEvent = {};
  attendees.forEach((attendee) => {
    if (!friendsByEvent[attendee.event_id]) {
      friendsByEvent[attendee.event_id] = [];
    }
    const profile = profiles.find((p) => p.id === attendee.user_id);
    if (profile) {
      friendsByEvent[attendee.event_id].push(profile);
    }
  });

  return friendsByEvent;
}

export async function search({ userId, personalityType, limit = 20, page = 0 }) {
  // If personalityType not provided, pull from DB
  let type = personalityType;

  if (!type) {
    const { data: pRow, error: pErr } = await supabaseAdmin
      .from('user_personality_data')
      .select(
        'personality_type, z_score_extraversion, z_score_neuroticism, z_score_agreeableness, z_score_conscientiousness, z_score_openness',
      )
      .eq('id', userId)
      .single();

    if (pErr || !pRow?.personality_type) {
      throw new Error('personalityType not set for user. Please complete the questionnaire.');
    }
    type = pRow.personality_type;

    // Optional: pass z-scores to nudge keyword selection
    var z = {
      z_E: pRow.z_score_extraversion,
      z_N: pRow.z_score_neuroticism,
      z_A: pRow.z_score_agreeableness,
      z_C: pRow.z_score_conscientiousness,
      z_O: pRow.z_score_openness,
    };
  }

  // Get geohash from user_data
  const { data: gRow, error: gErr } = await supabaseAdmin
    .from('user_data')
    .select('geohash')
    .eq('id', userId)
    .single();

  if (gErr || !gRow?.geohash) {
    throw new Error('User location not set. Please add a ZIP in your profile.');
  }

  // Call Ticketmaster
  const result = await TM.search({
    personalityType: type,
    geoPoint: gRow.geohash,
    limit,
    page,
    z, // optional; safe if undefined
    radius: 100, // in miles; adjust as needed
  });

  // Enrich events with user status and friends attending
  if (result.items && result.items.length > 0) {
    const eventIds = result.items.map((event) => event.id);

    // Fetch both user statuses and friends attending in parallel
    const [userStatuses, friendsByEvent] = await Promise.all([
      getUserEventStatuses(userId, eventIds),
      getFriendsAttendingEvents(userId, eventIds)
    ]);

    // Add user status and friends to each event
    result.items = result.items.map((event) => ({
      ...event,
      userStatus: userStatuses[event.id] || null,
      friendsAttending: friendsByEvent[event.id] || [],
      friendsCount: (friendsByEvent[event.id] || []).length,
    }));
  }

  // Ensure the controller can echo type in meta
  return { ...result, personalityType: type };
}
