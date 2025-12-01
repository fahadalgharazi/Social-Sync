import { supabaseAdmin } from '../config/supabase.js';

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabaseAdmin
    .from('user_data')
    .update(updates)
    .eq('id', userId)
    .select('id, username, first_name, last_name, bio, city, state, profile_picture_url')
    .single();

  if (error) {
    throw new Error('Failed to update profile');
  }

  return data;
}
