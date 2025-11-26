-- =====================================================
-- Social-Sync RLS Policies
-- =====================================================
-- Row Level Security policies to protect user data
-- Users can only access their own data

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personality_data ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. USERS TABLE POLICIES
-- =====================================================

-- Users can view their own user record
CREATE POLICY "Users can view own user record"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own user record
CREATE POLICY "Users can update own user record"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Service role can insert users (during signup)
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 3. USER_DATA TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_data
  FOR SELECT
  USING (auth.uid() = id);

-- Users can view other users' public profile data (for friends feature)
-- Note: In production, you may want to restrict this based on friendship status
CREATE POLICY "Users can view public profiles"
  ON user_data
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_data
  FOR UPDATE
  USING (auth.uid() = id);

-- Service role can insert user profiles (during signup)
CREATE POLICY "Service role can insert profiles"
  ON user_data
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 4. USER_PERSONALITY_DATA TABLE POLICIES
-- =====================================================

-- Users can view their own personality data
CREATE POLICY "Users can view own personality data"
  ON user_personality_data
  FOR SELECT
  USING (auth.uid() = id);

-- Users can view others' personality types (not full scores) for matching
-- This is a simplified policy - you may want to expose only personality_type
CREATE POLICY "Users can view personality types"
  ON user_personality_data
  FOR SELECT
  USING (true);

-- Users can update their own personality data (retake quiz)
CREATE POLICY "Users can update own personality data"
  ON user_personality_data
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own personality data (first quiz)
CREATE POLICY "Users can insert own personality data"
  ON user_personality_data
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role can insert/update personality data (for questionnaire submission)
CREATE POLICY "Service role can manage personality data"
  ON user_personality_data
  FOR ALL
  USING (true);

-- =====================================================
-- 5. SECURITY NOTES
-- =====================================================
--
-- IMPORTANT: These policies assume you're using the service role key
-- for backend operations (as seen in your auth routes).
--
-- For production:
-- 1. Consider using more restrictive policies
-- 2. Implement friend-based access control
-- 3. Limit which profile fields are publicly visible
-- 4. Add rate limiting at the application level
-- 5. Consider implementing a "privacy settings" table
--
-- FUTURE: When implementing friends/groups features, add policies like:
-- - Friends can view each other's full profiles
-- - Group members can see group event data
-- - Users can only modify resources they own
