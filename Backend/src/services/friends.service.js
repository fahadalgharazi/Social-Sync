import { supabaseAdmin } from '../config/supabase.js';

/**
 * Send a friend request
 */
export async function sendFriendRequest(userId, friendId) {
  // 1. Check if user is trying to friend themselves
  if (userId === friendId) {
    throw new Error('You cannot send a friend request to yourself');
  }

  // 2. Check if friend exists
  const { data: friendExists, error: friendCheckError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', friendId)
    .single();

  if (friendCheckError || !friendExists) {
    throw new Error('User not found');
  }

  // 3. Check if friendship already exists (either direction)
  const { data: existingFriendship } = await supabaseAdmin
    .from('friendships')
    .select('*')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

  if (existingFriendship && existingFriendship.length > 0) {
    const friendship = existingFriendship[0];
    if (friendship.status === 'accepted') {
      throw new Error('You are already friends with this user');
    }
    if (friendship.status === 'pending') {
      throw new Error('A friend request is already pending');
    }
    if (friendship.status === 'blocked') {
      throw new Error('Cannot send friend request');
    }
  }

  // 4. Create friend request
  const { data, error } = await supabaseAdmin
    .from('friendships')
    .insert([
      {
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      },
    ])
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to send friend request');
  }

  return data;
}

/**
 * Get all friends (accepted friendships) for a user
 */
export async function getFriends(userId) {
  // Get friendships where user is either user_id or friend_id
  const { data: friendships, error } = await supabaseAdmin
    .from('friendships')
    .select('*')
    .eq('status', 'accepted')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (error) {
    throw new Error('Failed to fetch friends');
  }

  // Extract friend IDs
  const friendIds = friendships.map((f) => (f.user_id === userId ? f.friend_id : f.user_id));

  if (friendIds.length === 0) {
    return [];
  }

  // Get friend profiles
  const { data: friends, error: profileError } = await supabaseAdmin
    .from('user_data')
    .select('id, username, first_name, last_name, bio, city, state')
    .in('id', friendIds);

  if (profileError) {
    throw new Error('Failed to fetch friend profiles');
  }

  return friends;
}

/**
 * Get pending friend requests (received by the user)
 */
export async function getPendingRequests(userId) {
  const { data: requests, error } = await supabaseAdmin
    .from('friendships')
    .select('id, user_id, requested_at')
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch pending requests');
  }

  if (requests.length === 0) {
    return [];
  }

  // Get requester profiles
  const requesterIds = requests.map((r) => r.user_id);
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('user_data')
    .select('id, username, first_name, last_name, bio')
    .in('id', requesterIds);

  if (profileError) {
    throw new Error('Failed to fetch requester profiles');
  }

  // Merge request data with profiles
  return requests.map((request) => {
    const profile = profiles.find((p) => p.id === request.user_id);
    return {
      requestId: request.id,
      requestedAt: request.requested_at,
      ...profile,
    };
  });
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(userId, requestId) {
  // Verify the request exists and is for this user
  const { data: request, error: fetchError } = await supabaseAdmin
    .from('friendships')
    .select('*')
    .eq('id', requestId)
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .single();

  if (fetchError || !request) {
    throw new Error('Friend request not found');
  }

  // Update status to accepted
  const { data, error } = await supabaseAdmin
    .from('friendships')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to accept friend request');
  }

  return data;
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(userId, requestId) {
  // Verify the request exists and is for this user
  const { data: request, error: fetchError } = await supabaseAdmin
    .from('friendships')
    .select('*')
    .eq('id', requestId)
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .single();

  if (fetchError || !request) {
    throw new Error('Friend request not found');
  }

  // Delete the request
  const { error } = await supabaseAdmin.from('friendships').delete().eq('id', requestId);

  if (error) {
    throw new Error('Failed to reject friend request');
  }

  return true;
}

/**
 * Unfriend a user (remove friendship)
 */
export async function unfriend(userId, friendId) {
  // Delete friendship in either direction
  const { error } = await supabaseAdmin
    .from('friendships')
    .delete()
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

  if (error) {
    throw new Error('Failed to unfriend user');
  }

  return true;
}

/**
 * Get sent friend requests (requests sent by the user)
 */
export async function getSentRequests(userId) {
  const { data: requests, error } = await supabaseAdmin
    .from('friendships')
    .select('id, friend_id, requested_at')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch sent requests');
  }

  if (requests.length === 0) {
    return [];
  }

  // Get recipient profiles
  const recipientIds = requests.map((r) => r.friend_id);
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('user_data')
    .select('id, username, first_name, last_name')
    .in('id', recipientIds);

  if (profileError) {
    throw new Error('Failed to fetch recipient profiles');
  }

  // Merge request data with profiles
  return requests.map((request) => {
    const profile = profiles.find((p) => p.id === request.friend_id);
    return {
      requestId: request.id,
      requestedAt: request.requested_at,
      ...profile,
    };
  });
}
