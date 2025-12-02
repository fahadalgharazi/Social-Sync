import { z } from 'zod';

/**
 * Friend Request Validator
 */
export const sendFriendRequestSchema = z.object({
  friendId: z.string().uuid('Invalid user ID'),
});

/**
 * Friend Request Response Validator (for accept/reject)
 * Note: requestId is in URL params, not body
 */
export const respondToRequestSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: 'Action must be either "accept" or "reject"' }),
  }),
});

/**
 * Unfriend Validator
 */
export const unfriendSchema = z.object({
  friendId: z.string().uuid('Invalid user ID'),
});
