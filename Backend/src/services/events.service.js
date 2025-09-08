// Backend/src/services/events.service.js
import * as TM from './ticketmaster.client.js';
import { supabaseAdmin } from '../config/supabase.js';

// New version: look up geohash for the authenticated user
export async function search({ userId, personalityType, limit = 20, page = 0 }) {
  // Fetch geohash from DB (user_data table)
  const { data, error } = await supabaseAdmin
    .from('user_data')
    .select('geohash')
    .eq('id', userId)
    .single();

  if (error || !data?.geohash) {
    throw new Error("User location not set. Please update profile ZIP.");
  }

  // Call Ticketmaster using geohash + radius ladder
  const events = await TM.search({
    personalityType,
    geoPoint: data.geohash,
    limit,
    page,
  });

  return events;
}
