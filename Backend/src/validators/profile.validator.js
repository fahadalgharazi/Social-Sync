import { z } from 'zod';

/**
 * Profile Update Validator
 */
export const updateProfileSchema = z.object({
  profile_picture_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  interests: z.string().max(500, 'Interests must be 500 characters or less').optional(),
  gender: z.enum(['male', 'female', 'nonbinary', 'other']).optional(),
}).strict();
