import { supabaseAdmin } from '../config/supabase.js';

// Whitelist of fields that users are allowed to update
const ALLOWED_PROFILE_FIELDS = [
  'bio',
  'interests',
  'profile_picture_url',
  'gender',
  'city',
  'state'
];

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  // Filter updates to only include whitelisted fields
  const filteredUpdates = {};
  Object.keys(updates).forEach((key) => {
    if (ALLOWED_PROFILE_FIELDS.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  // If no valid fields to update, throw error
  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  const { data, error } = await supabaseAdmin
    .from('user_data')
    .update(filteredUpdates)
    .eq('id', userId)
    .select('id, username, first_name, last_name, bio, interests, gender, city, state, profile_picture_url')
    .single();

  if (error) {
    throw new Error('Failed to update profile');
  }

  return data;
}
