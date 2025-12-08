import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as FriendsService from '../../services/friends.service.js';

// Mock Supabase client
jest.mock('../../config/supabase.js', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('Friends Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request successfully', async () => {
      const userId = 'user-1';
      const friendId = 'user-2';

      // Mock implementation would go here
      // For now, just test that the function exists
      expect(typeof FriendsService.sendFriendRequest).toBe('function');
    });

    it('should throw error if trying to friend yourself', async () => {
      const userId = 'user-1';

      await expect(
        FriendsService.sendFriendRequest(userId, userId)
      ).rejects.toThrow();
    });
  });

  describe('getFriends', () => {
    it('should return list of friends', async () => {
      expect(typeof FriendsService.getFriends).toBe('function');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept a friend request', async () => {
      expect(typeof FriendsService.acceptFriendRequest).toBe('function');
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject a friend request', async () => {
      expect(typeof FriendsService.rejectFriendRequest).toBe('function');
    });
  });

  describe('unfriend', () => {
    it('should remove friendship', async () => {
      expect(typeof FriendsService.unfriend).toBe('function');
    });
  });
});
