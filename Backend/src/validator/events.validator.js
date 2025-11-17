import { z } from 'zod';

const PERSONALITY_TYPES = [
  'Reactive Idealist',
  'Balanced Realist',
  'Sensitive Companion',
  'Secure Optimist'
] ;


export const eventSearchSchema = z.object({
  personalityType: z
    .enum(PERSONALITY_TYPES, {
      errorMap: () => ({
        message: `personalityType must be one of: ${PERSONALITY_TYPES.join(', ')}`
      })
    })
    .optional(),

  limit: z
    .coerce
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100') // Prevent abuse
    .optional()
    .default(20),

  page: z
    .coerce
    .number()
    .int('Page must be a whole number')
    .min(0, 'Page cannot be negative')
    .optional()
    .default(0)
});


export const eventQuerySchema = eventSearchSchema;