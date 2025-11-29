import { supabaseAdmin } from '../config/supabase.js';
import { sanitizeString } from '../utils/sanitize.js';

/**
 * Create a new group
 */
export async function createGroup(userId, groupData) {
  const { data, error } = await supabaseAdmin
    .from('groups')
    .insert([
      {
        name: sanitizeString(groupData.name),
        description: groupData.description ? sanitizeString(groupData.description) : null,
        created_by: userId,
        is_private: groupData.is_private || false,
        created_at: new Date().toISOString(),
      },
    ])
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to create group');
  }

  // Automatically add creator as admin
  await supabaseAdmin.from('group_members').insert([
    {
      group_id: data.id,
      user_id: userId,
      role: 'admin',
      joined_at: new Date().toISOString(),
    },
  ]);

  return data;
}

/**
 * Get all groups for a user (where they are a member)
 */
export async function getUserGroups(userId) {
  // Get group IDs where user is a member
  const { data: memberships, error: membershipError } = await supabaseAdmin
    .from('group_members')
    .select('group_id, role, joined_at')
    .eq('user_id', userId);

  if (membershipError) {
    throw new Error('Failed to fetch groups');
  }

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const groupIds = memberships.map((m) => m.group_id);

  // Get group details
  const { data: groups, error: groupsError } = await supabaseAdmin
    .from('groups')
    .select('id, name, description, created_by, is_private, created_at')
    .in('id', groupIds);

  if (groupsError) {
    throw new Error('Failed to fetch group details');
  }

  // Merge membership info with group data
  return groups.map((group) => {
    const membership = memberships.find((m) => m.group_id === group.id);
    return {
      ...group,
      userRole: membership.role,
      joinedAt: membership.joined_at,
    };
  });
}

/**
 * Get group details
 */
export async function getGroup(groupId, userId) {
  // Check if user is a member
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (membershipError || !membership) {
    // Check if group is public
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      throw new Error('Group not found');
    }

    if (group.is_private) {
      throw new Error('You do not have access to this private group');
    }

    return { ...group, userRole: null };
  }

  // User is a member, get full details
  const { data: group, error: groupError } = await supabaseAdmin
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError) {
    throw new Error('Failed to fetch group');
  }

  return { ...group, userRole: membership.role };
}

/**
 * Update group (admin only)
 */
export async function updateGroup(groupId, userId, updates) {
  // Check if user is admin
  const { data: membership } = await supabaseAdmin
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (!membership || membership.role !== 'admin') {
    throw new Error('Only group admins can update the group');
  }

  // Sanitize text fields
  const sanitizedUpdates = {};
  if (updates.name) sanitizedUpdates.name = sanitizeString(updates.name);
  if (updates.description) sanitizedUpdates.description = sanitizeString(updates.description);
  if (updates.is_private !== undefined) sanitizedUpdates.is_private = updates.is_private;

  const { data, error } = await supabaseAdmin
    .from('groups')
    .update({ ...sanitizedUpdates, updated_at: new Date().toISOString() })
    .eq('id', groupId)
    .select('*')
    .single();

  if (error) {
    throw new Error('Failed to update group');
  }

  return data;
}

/**
 * Delete group (creator only)
 */
export async function deleteGroup(groupId, userId) {
  // Check if user is the creator
  const { data: group } = await supabaseAdmin.from('groups').select('created_by').eq('id', groupId).single();

  if (!group || group.created_by !== userId) {
    throw new Error('Only the group creator can delete the group');
  }

  const { error } = await supabaseAdmin.from('groups').delete().eq('id', groupId);

  if (error) {
    throw new Error('Failed to delete group');
  }

  return true;
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId, userId) {
  // Verify user has access to this group
  const { data: membership } = await supabaseAdmin
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  // If not a member, check if group is public
  if (!membership) {
    const { data: group } = await supabaseAdmin.from('groups').select('is_private').eq('id', groupId).single();

    if (!group || group.is_private) {
      throw new Error('Access denied');
    }
  }

  // Get all members
  const { data: members, error } = await supabaseAdmin
    .from('group_members')
    .select('user_id, role, joined_at')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch members');
  }

  if (!members || members.length === 0) {
    return [];
  }

  // Get member profiles
  const userIds = members.map((m) => m.user_id);
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('user_data')
    .select('id, username, first_name, last_name')
    .in('id', userIds);

  if (profileError) {
    throw new Error('Failed to fetch member profiles');
  }

  // Merge member data with profiles
  return members.map((member) => {
    const profile = profiles.find((p) => p.id === member.user_id);
    return {
      ...profile,
      role: member.role,
      joinedAt: member.joined_at,
    };
  });
}

/**
 * Add member to group (admin only)
 */
export async function addMember(groupId, userId, newUserId, role = 'member') {
  // Check if requester is admin
  const { data: membership } = await supabaseAdmin
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (!membership || membership.role !== 'admin') {
    throw new Error('Only group admins can add members');
  }

  // Check if user exists
  const { data: userExists } = await supabaseAdmin.from('users').select('id').eq('id', newUserId).single();

  if (!userExists) {
    throw new Error('User not found');
  }

  // Add member
  const { data, error } = await supabaseAdmin
    .from('group_members')
    .insert([
      {
        group_id: groupId,
        user_id: newUserId,
        role,
        joined_at: new Date().toISOString(),
      },
    ])
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('User is already a member of this group');
    }
    throw new Error('Failed to add member');
  }

  return data;
}

/**
 * Remove member from group (admin only, or self)
 */
export async function removeMember(groupId, userId, memberIdToRemove) {
  // Can remove self, or must be admin to remove others
  if (userId !== memberIdToRemove) {
    const { data: membership } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'admin') {
      throw new Error('Only group admins can remove other members');
    }
  }

  const { error } = await supabaseAdmin
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', memberIdToRemove);

  if (error) {
    throw new Error('Failed to remove member');
  }

  return true;
}

/**
 * Get group events
 */
export async function getGroupEvents(groupId, userId) {
  // Verify user has access
  const { data: membership } = await supabaseAdmin
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (!membership) {
    throw new Error('Access denied');
  }

  const { data, error } = await supabaseAdmin
    .from('group_events')
    .select('*')
    .eq('group_id', groupId)
    .order('event_date', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch group events');
  }

  return data || [];
}

/**
 * Add event to group
 */
export async function addGroupEvent(groupId, userId, eventData) {
  // Verify user is a member
  const { data: membership } = await supabaseAdmin
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (!membership) {
    throw new Error('Only group members can add events');
  }

  const { data, error } = await supabaseAdmin
    .from('group_events')
    .insert([
      {
        group_id: groupId,
        event_id: eventData.event_id,
        event_name: eventData.event_name,
        event_date: eventData.event_date,
        venue_name: eventData.venue_name || null,
        added_by: userId,
        added_at: new Date().toISOString(),
      },
    ])
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('This event is already added to the group');
    }
    throw new Error('Failed to add event');
  }

  return data;
}

/**
 * Remove event from group (admin only)
 */
export async function removeGroupEvent(groupId, userId, eventId) {
  // Check if user is admin
  const { data: membership } = await supabaseAdmin
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (!membership || membership.role !== 'admin') {
    throw new Error('Only group admins can remove events');
  }

  const { error } = await supabaseAdmin.from('group_events').delete().eq('group_id', groupId).eq('event_id', eventId);

  if (error) {
    throw new Error('Failed to remove event');
  }

  return true;
}
