import { z } from 'zod';

/**
 * Create Group Validator
 */
export const createGroupSchema = z.object({
  name: z.string().trim().min(3, 'Group name must be at least 3 characters').max(100, 'Group name is too long'),
  description: z.string().trim().max(500, 'Description must be 500 characters or less').optional(),
  is_private: z.boolean().default(false),
});

/**
 * Update Group Validator
 */
export const updateGroupSchema = z.object({
  name: z.string().trim().min(3, 'Group name must be at least 3 characters').max(100, 'Group name is too long').optional(),
  description: z.string().trim().max(500, 'Description must be 500 characters or less').optional(),
  is_private: z.boolean().optional(),
});

/**
 * Add Member Validator
 */
export const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'member']).default('member'),
});

/**
 * Add Group Event Validator
 */
export const addGroupEventSchema = z.object({
  event_id: z.string().min(1, 'Event ID is required'),
  event_name: z.string().min(1, 'Event name is required'),
  event_date: z.string().datetime('Invalid date format'),
  venue_name: z.string().optional(),
});
