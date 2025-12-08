import { z } from 'zod';
import { isAllowedImageUrl } from '../utils/urlValidation.js';

/**
 * Add User Event Validator
 */
export const addUserEventSchema = z.object({
  event_id: z.string().min(1, 'Event ID is required'),
  event_name: z.string().min(1, 'Event name is required'),
  event_date: z
    .string()
    .min(1, 'Event date is required')
    .refine(
      (val) => {
        // Accept any string that can be parsed as a valid date
        const parsed = Date.parse(val);
        return !isNaN(parsed);
      },
      {
        message: 'Invalid date format - must be a valid date string',
      }
    ),
  venue_name: z.string().optional(),
  venue_city: z.string().optional(),
  venue_state: z.string().max(2).optional(),
  image_url: z
    .string()
    .url()
    .refine(isAllowedImageUrl, {
      message: 'Event image must be from an allowed image hosting service',
    })
    .optional()
    .or(z.literal('')),
  status: z.enum(['interested', 'going'], {
    errorMap: () => ({ message: 'Status must be either "interested" or "going"' }),
  }),
});

/**
 * Update User Event Status Validator
 */
export const updateUserEventSchema = z.object({
  status: z.enum(['interested', 'going', 'went'], {
    errorMap: () => ({ message: 'Status must be "interested", "going", or "went"' }),
  }),
});
