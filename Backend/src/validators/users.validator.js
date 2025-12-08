import { z } from 'zod';

/**
 * User Search Query Validator
 */
export const searchUsersSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  limit: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const num = parseInt(val);
      return !isNaN(num) && num > 0 && num <= 50;
    },
    {
      message: 'Limit must be a number between 1 and 50',
    }
  ),
});
