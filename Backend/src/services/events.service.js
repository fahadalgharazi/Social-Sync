// Backend/src/services/events.service.js
import * as TM from './ticketmaster.client.js';
import { supabaseAdmin } from '../config/supabase.js';

export async function search({ userId, personalityType, limit = 20, page = 0 }) {
  // If personalityType not provided, pull from DB
  let type = personalityType;

  if (!type) {
    const { data: pRow, error: pErr } = await supabaseAdmin
      .from('user_personality_data')
      .select('personality_type, z_score_extraversion, z_score_neuroticism, z_score_agreeableness, z_score_conscientiousness, z_score_openness')
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
  console.log("Events search result:", result, type,gRow.geohash);
  // Ensure the controller can echo type in meta
  return { ...result, personalityType: type };
}
