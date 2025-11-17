// Backend/src/validators/events.validator.js
import { z } from 'zod';

/**
 * LESSON: Enumeration Validation
 *
 * When a field can only be one of a specific set of values,
 * use z.enum() to enforce that constraint.
 *
 * This is type-safe and self-documenting!
 */

/**
 * Valid personality types
 *
 * Using const assertion ([...] as const) makes this a tuple of literals.
 * Zod can infer the exact string values from this.
 */
const PERSONALITY_TYPES = [
  'Reactive Idealist',
  'Balanced Realist',
  'Sensitive Companion',
  'Secure Optimist'
] ;

/**
 * Events search request schema
 *
 * LESSON: Optional Fields with Defaults
 *
 * .optional() means the field doesn't have to be present
 * .default(value) provides a fallback if not present
 *
 * After validation, you're GUARANTEED to have limit and page
 * with sensible values, even if the client didn't send them!
 */
export const eventSearchSchema = z.object({
  personalityType: z
    .enum(PERSONALITY_TYPES, {
      errorMap: () => ({
        message: `personalityType must be one of: ${PERSONALITY_TYPES.join(', ')}`
      })
    })
    .optional(), // Optional because service can look up user's type from DB

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

/**
 * WHAT THIS VALIDATION PROVIDES:
 *
 * 1. Type safety: personalityType can only be one of 4 valid values
 * 2. Bounds checking: limit 1-100, page >= 0
 * 3. Defaults: Even if client sends {}, we get { limit: 20, page: 0 }
 * 4. Type coercion: "20" becomes 20, "true" becomes error
 * 5. Descriptive errors: "personalityType must be one of: ..."
 *
 * Benefits:
 * - Can't ask for negative pages
 * - Can't request 10,000 items at once (DoS protection!)
 * - Invalid personality type rejected immediately
 * - Frontend doesn't need to send defaults
 */

/**
 * BONUS: Query parameter validation for GET requests
 *
 * If you later want /events?limit=10&page=2 (GET instead of POST),
 * you can reuse this schema with validateQuery middleware!
 */
export const eventQuerySchema = eventSearchSchema;
