import { z } from 'zod';
import { isAllowedImageUrl } from '../utils/urlValidation.js';

/**
 * Profile Update Validator
 */
export const updateProfileSchema = z.object({
  profile_picture_url: z
    .string()
    .url('Invalid URL')
    .refine(isAllowedImageUrl, {
      message: 'Profile picture must be from an allowed image hosting service (e.g., Imgur, Unsplash, Gravatar)',
    })
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  interests: z.string().max(500, 'Interests must be 500 characters or less').optional(),
  gender: z.enum(['male', 'female', 'nonbinary', 'other']).optional(),
}).strict();
