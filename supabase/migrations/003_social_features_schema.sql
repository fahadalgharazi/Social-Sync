-- =====================================================
-- Social Features Schema (Friends & Groups)
-- =====================================================
-- Run this migration when implementing friends and groups features
-- DO NOT RUN THIS YET - it's prepared for Phase 2

-- =====================================================
-- 1. FRIENDSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,

  -- Ensure a user can't friend themselves
  CONSTRAINT check_not_self CHECK (user_id != friend_id),

  -- Ensure unique friendships (no duplicates)
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),

  -- Status must be valid
  CONSTRAINT check_status CHECK (status IN ('pending', 'accepted', 'blocked'))
);

-- Indexes for friend queries
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user_status ON friendships(user_id, status);

-- =====================================================
-- 2. USER_EVENTS TABLE
-- =====================================================
-- Tracks which events users are interested in or attending
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id VARCHAR(255) NOT NULL, -- Ticketmaster event ID
  event_name VARCHAR(500),
  event_date TIMESTAMP WITH TIME ZONE,
  venue_name VARCHAR(500),
  venue_city VARCHAR(255),
  venue_state VARCHAR(2),
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'interested',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One user can only have one status per event
  CONSTRAINT unique_user_event UNIQUE (user_id, event_id),

  -- Valid statuses
  CONSTRAINT check_status CHECK (status IN ('interested', 'going', 'went'))
);

-- Indexes for event queries
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_id ON user_events(event_id);
CREATE INDEX IF NOT EXISTS idx_user_events_status ON user_events(status);
CREATE INDEX IF NOT EXISTS idx_user_events_date ON user_events(event_date);

-- =====================================================
-- 3. GROUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for group queries
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_is_private ON groups(is_private);

-- =====================================================
-- 4. GROUP_MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One user can only be in a group once
  CONSTRAINT unique_group_member UNIQUE (group_id, user_id),

  -- Valid roles
  CONSTRAINT check_role CHECK (role IN ('admin', 'member'))
);

-- Indexes for group member queries
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);

-- =====================================================
-- 5. GROUP_EVENTS TABLE
-- =====================================================
-- Events that groups are planning to attend together
CREATE TABLE IF NOT EXISTS group_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  event_id VARCHAR(255) NOT NULL, -- Ticketmaster event ID
  event_name VARCHAR(500),
  event_date TIMESTAMP WITH TIME ZONE,
  venue_name VARCHAR(500),
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One group can only track one event once
  CONSTRAINT unique_group_event UNIQUE (group_id, event_id)
);

-- Indexes for group event queries
CREATE INDEX IF NOT EXISTS idx_group_events_group_id ON group_events(group_id);
CREATE INDEX IF NOT EXISTS idx_group_events_event_id ON group_events(event_id);
CREATE INDEX IF NOT EXISTS idx_group_events_date ON group_events(event_date);

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (user_id = user1_id AND friend_id = user2_id)
      OR (user_id = user2_id AND friend_id = user1_id)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get mutual friends between two users
CREATE OR REPLACE FUNCTION get_mutual_friends(user1_id UUID, user2_id UUID)
RETURNS TABLE(user_id UUID, username VARCHAR, first_name VARCHAR, last_name VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ud.id, ud.username, ud.first_name, ud.last_name
  FROM user_data ud
  WHERE ud.id IN (
    -- Friends of user1
    SELECT friend_id FROM friendships WHERE user_id = user1_id AND status = 'accepted'
    UNION
    SELECT user_id FROM friendships WHERE friend_id = user1_id AND status = 'accepted'
  )
  AND ud.id IN (
    -- Friends of user2
    SELECT friend_id FROM friendships WHERE user_id = user2_id AND status = 'accepted'
    UNION
    SELECT user_id FROM friendships WHERE friend_id = user2_id AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE friendships IS 'User friendship relationships with pending, accepted, and blocked statuses';
COMMENT ON TABLE user_events IS 'Events that users are interested in or attending';
COMMENT ON TABLE groups IS 'User-created groups for coordinating event attendance';
COMMENT ON TABLE group_members IS 'Membership records for groups';
COMMENT ON TABLE group_events IS 'Events that groups plan to attend together';

COMMENT ON FUNCTION are_friends IS 'Check if two users are friends (accepted status)';
COMMENT ON FUNCTION get_mutual_friends IS 'Get list of mutual friends between two users';
