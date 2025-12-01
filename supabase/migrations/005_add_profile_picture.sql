-- =====================================================
-- Add Profile Picture Support
-- =====================================================
-- This migration adds profile picture URL field to user_data table

ALTER TABLE user_data
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

COMMENT ON COLUMN user_data.profile_picture_url IS 'URL to user profile picture (can be external URL or Supabase storage URL)';
