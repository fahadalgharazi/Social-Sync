-- =====================================================
-- Social-Sync Database Schema - Initial Migration
-- =====================================================
-- This file creates the core tables for the Social-Sync application
-- Run this against your Supabase project to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Core user authentication table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- 2. USER_DATA TABLE
-- =====================================================
-- Extended user profile information
CREATE TABLE IF NOT EXISTS user_data (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  username VARCHAR(20) NOT NULL UNIQUE,
  gender VARCHAR(20),
  bio TEXT,
  interests TEXT,

  -- Location data
  city VARCHAR(255),
  state VARCHAR(2),
  zipcode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  geohash VARCHAR(12),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_gender CHECK (gender IN ('male', 'female', 'nonbinary', 'other'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_data_username ON user_data(username);
CREATE INDEX IF NOT EXISTS idx_user_data_geohash ON user_data(geohash);
CREATE INDEX IF NOT EXISTS idx_user_data_zipcode ON user_data(zipcode);

-- =====================================================
-- 3. USER_PERSONALITY_DATA TABLE
-- =====================================================
-- Stores Big Five personality test results and computed personality type
CREATE TABLE IF NOT EXISTS user_personality_data (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Raw Big Five scores (1-5 scale)
  extraversion DECIMAL(3, 2),
  emotional_stability DECIMAL(3, 2),
  agreeableness DECIMAL(3, 2),
  conscientiousness DECIMAL(3, 2),
  openness DECIMAL(3, 2),

  -- Normalized z-scores for clustering
  z_score_extraversion DECIMAL(6, 3),
  z_score_neuroticism DECIMAL(6, 3),
  z_score_agreeableness DECIMAL(6, 3),
  z_score_conscientiousness DECIMAL(6, 3),
  z_score_openness DECIMAL(6, 3),

  -- Computed personality type based on clustering
  personality_type VARCHAR(50),
  cluster_distance DECIMAL(10, 6),

  -- Open-ended questionnaire response
  open_ended TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_personality_type CHECK (
    personality_type IN (
      'Reactive Idealist',
      'Balanced Realist',
      'Sensitive Companion',
      'Secure Optimist'
    )
  )
);

-- Index for personality type queries
CREATE INDEX IF NOT EXISTS idx_personality_type ON user_personality_data(personality_type);

-- =====================================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Automatically update updated_at timestamp on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_personality_data_updated_at
  BEFORE UPDATE ON user_personality_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE users IS 'Core user authentication table linked to Supabase Auth';
COMMENT ON TABLE user_data IS 'Extended user profile information including location and interests';
COMMENT ON TABLE user_personality_data IS 'Big Five personality test results and computed personality types';

COMMENT ON COLUMN user_data.geohash IS 'Geohash for efficient location-based queries (precision 6)';
COMMENT ON COLUMN user_personality_data.cluster_distance IS 'Euclidean distance to nearest personality cluster centroid';
