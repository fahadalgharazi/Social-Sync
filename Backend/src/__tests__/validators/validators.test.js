import { describe, it, expect } from '@jest/globals';
import { sendFriendRequestSchema, respondToRequestSchema } from '../../validators/friends.validator.js';
import { addUserEventSchema, updateUserEventSchema } from '../../validators/userEvents.validator.js';
import { createGroupSchema, updateGroupSchema, addMemberSchema } from '../../validators/groups.validator.js';

describe('Validator Tests', () => {
  describe('Friends Validators', () => {
    it('should validate correct friend request data', () => {
      const validData = {
        friendId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = sendFriendRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for friendId', () => {
      const invalidData = {
        friendId: 'not-a-uuid',
      };

      const result = sendFriendRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate respond to request schema', () => {
      const validData = {
        requestId: '550e8400-e29b-41d4-a716-446655440000',
        action: 'accept',
      };

      const result = respondToRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid action', () => {
      const invalidData = {
        requestId: '550e8400-e29b-41d4-a716-446655440000',
        action: 'invalid',
      };

      const result = respondToRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('User Events Validators', () => {
    it('should validate correct user event data', () => {
      const validData = {
        event_id: 'event-123',
        event_name: 'Concert',
        event_date: new Date().toISOString(),
        venue_name: 'Arena',
        status: 'going',
      };

      const result = addUserEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        event_id: 'event-123',
        event_name: 'Concert',
        event_date: new Date().toISOString(),
        status: 'maybe',
      };

      const result = addUserEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate update event status schema', () => {
      const validData = {
        status: 'interested',
      };

      const result = updateUserEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Groups Validators', () => {
    it('should validate correct group creation data', () => {
      const validData = {
        name: 'My Group',
        description: 'A test group',
        is_private: false,
      };

      const result = createGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject group name that is too short', () => {
      const invalidData = {
        name: 'AB',
        is_private: false,
      };

      const result = createGroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject group name that is too long', () => {
      const invalidData = {
        name: 'A'.repeat(101),
        is_private: false,
      };

      const result = createGroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate update group schema', () => {
      const validData = {
        name: 'Updated Group',
        description: 'Updated description',
      };

      const result = updateGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate add member schema', () => {
      const validData = {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'member',
      };

      const result = addMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'superadmin',
      };

      const result = addMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
