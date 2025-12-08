-- =====================================================
-- Social Features RLS Policies
-- =====================================================
-- Run this with 003_social_features_schema.sql
-- DO NOT RUN THIS YET - it's prepared for Phase 2

-- =====================================================
-- 1. ENABLE RLS ON SOCIAL TABLES
-- =====================================================
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. FRIENDSHIPS POLICIES
-- =====================================================

-- Users can view friendships they're part of
CREATE POLICY "Users can view own friendships"
  ON friendships
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friend requests
CREATE POLICY "Users can send friend requests"
  ON friendships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update friend requests they received (accept/reject)
CREATE POLICY "Users can respond to friend requests"
  ON friendships
  FOR UPDATE
  USING (auth.uid() = friend_id);

-- Users can delete their own friendships (unfriend)
CREATE POLICY "Users can delete own friendships"
  ON friendships
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- =====================================================
-- 3. USER_EVENTS POLICIES
-- =====================================================

-- Users can view their own events
CREATE POLICY "Users can view own events"
  ON user_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view events of their friends
CREATE POLICY "Users can view friends' events"
  ON user_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (friendships.user_id = auth.uid() AND friendships.friend_id = user_events.user_id)
        OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_events.user_id)
      )
    )
  );

-- Users can add events to their own list
CREATE POLICY "Users can add own events"
  ON user_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update own events"
  ON user_events
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete own events"
  ON user_events
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. GROUPS POLICIES
-- =====================================================

-- Users can view public groups
CREATE POLICY "Users can view public groups"
  ON groups
  FOR SELECT
  USING (is_private = false);

-- Users can view private groups they're members of
CREATE POLICY "Users can view member groups"
  ON groups
  FOR SELECT
  USING (
    is_private = true AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Users can create groups
CREATE POLICY "Users can create groups"
  ON groups
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Group admins can update groups
CREATE POLICY "Admins can update groups"
  ON groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- Group creators can delete groups
CREATE POLICY "Creators can delete groups"
  ON groups
  FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- 5. GROUP_MEMBERS POLICIES
-- =====================================================

-- Anyone can view members of public groups
CREATE POLICY "View public group members"
  ON group_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.is_private = false
    )
  );

-- Members can view members of their groups
CREATE POLICY "Members can view group members"
  ON group_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members AS gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- Admins can add members
CREATE POLICY "Admins can add members"
  ON group_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members AS gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- Admins can remove members
CREATE POLICY "Admins can remove members"
  ON group_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_members AS gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- Members can leave groups
CREATE POLICY "Members can leave groups"
  ON group_members
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. GROUP_EVENTS POLICIES
-- =====================================================

-- Members can view group events
CREATE POLICY "Members can view group events"
  ON group_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_events.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Members can add events to groups
CREATE POLICY "Members can add group events"
  ON group_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_events.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Admins can remove events from groups
CREATE POLICY "Admins can remove group events"
  ON group_events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_events.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );
