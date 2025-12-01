import { supabaseAdmin } from '../config/supabase.js';

/**
 * Search for users by username, first name, or last name
 */
export async function searchUsers(query, currentUserId, limit = 20) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  // Search users by username, first_name, or last_name (case-insensitive)
  const { data: users, error } = await supabaseAdmin
    .from('user_data')
    .select('id, username, first_name, last_name, bio, city, state, profile_picture_url')
    .or(`username.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`)
    .neq('id', currentUserId) // Exclude current user
    .limit(limit);

  if (error) {
    throw new Error('Failed to search users');
  }

  if (users.length === 0) {
    return [];
  }

  // Get friendship status for each user
  const userIds = users.map((u) => u.id);

  const { data: friendships, error: friendshipError } = await supabaseAdmin
    .from('friendships')
    .select('user_id, friend_id, status')
    .or(
      `and(user_id.eq.${currentUserId},friend_id.in.(${userIds.join(',')})),` +
      `and(friend_id.eq.${currentUserId},user_id.in.(${userIds.join(',')}))`
    );

  if (friendshipError) {
    throw new Error('Failed to fetch friendship status');
  }

  // Map friendship status to each user
  const usersWithStatus = users.map((user) => {
    const friendship = friendships.find(
      (f) =>
        (f.user_id === currentUserId && f.friend_id === user.id) ||
        (f.friend_id === currentUserId && f.user_id === user.id)
    );

    let friendshipStatus = 'none';
    if (friendship) {
      if (friendship.status === 'accepted') {
        friendshipStatus = 'friends';
      } else if (friendship.status === 'pending') {
        // Determine if request was sent or received
        if (friendship.user_id === currentUserId) {
          friendshipStatus = 'request_sent';
        } else {
          friendshipStatus = 'request_received';
        }
      }
    }

    return {
      ...user,
      friendshipStatus,
    };
  });

  return usersWithStatus;
}

/**
 * Get a user profile by ID
 */
export async function getUserProfile(userId) {
  const { data: user, error } = await supabaseAdmin
    .from('user_data')
    .select('id, username, first_name, last_name, bio, city, state, profile_picture_url')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  return user;
}
