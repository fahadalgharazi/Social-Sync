// Backend/src/validators/auth.validator.js
import { z } from 'zod';

/**
 * LESSON: Zod Schema Validation
 *
 * A schema is a "blueprint" that describes what valid data looks like.
 * Think of it like a contract: "I expect data in THIS exact shape"
 *
 * Benefits:
 * 1. Declarative - You describe WHAT you want, not HOW to check it
 * 2. Self-documenting - The schema IS the documentation
 * 3. Type-safe - TypeScript can infer types from schemas
 * 4. Composable - Build complex schemas from simple ones
 */

// ============================================
// REUSABLE SCHEMA BUILDING BLOCKS
// ============================================

/**
 * Email validation schema
 *
 * Chain methods (called "refinements") add constraints:
 * - .string() = must be a string
 * - .email() = must match email pattern (built-in to Zod)
 * - .trim() = automatically removes whitespace
 * - .toLowerCase() = normalizes to lowercase
 *
 * The message in parentheses is what users see if validation fails
 */
const emailSchema = z
  .string({ required_error: 'Email is required' })
  .email('Please enter a valid email address')
  .trim()
  .toLowerCase();

/**
 * Password validation schema
 *
 * .min(8) = at least 8 characters
 * .regex() = must match the pattern
 *
 * Notice how each rule has a descriptive error message.
 * This is MUCH better than generic "Invalid input" errors!
 */
const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Name validation schema (reusable for first/last name)
 *
 * .min(1) after .trim() ensures non-empty after whitespace removal
 * .max(50) prevents unreasonably long names (prevents abuse)
 */
const nameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(1, 'Name cannot be empty')
  .max(50, 'Name is too long');

/**
 * ZIP code validation schema
 *
 * Accepts: 12345 or 12345-6789
 * The regex pattern: ^\d{5}(-\d{4})?$
 *   ^ = start of string
 *   \d{5} = exactly 5 digits
 *   (-\d{4})? = optionally, a dash followed by 4 digits
 *   $ = end of string
 */
const zipCodeSchema = z
  .string({ required_error: 'ZIP code is required' })
  .trim()
  .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');

// ============================================
// COMPLETE REQUEST SCHEMAS
// ============================================

/**
 * Signup Request Schema
 *
 * z.object() creates a schema for an object with specific keys.
 * This is your "contract" for what a signup request MUST contain.
 *
 * Optional fields use .optional() or provide defaults
 * .default([]) means "if not provided, use empty array"
 *
 * TRANSFORMATION: .transform() lets you clean/reshape data after validation
 * Here we ensure interests is always an array, even if sent as comma-separated string
 */
export const signupSchema = z.object({
  // Required fields
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  zip: zipCodeSchema,

  // Optional fields with sensible defaults
  gender: z
    .string()
    .trim()
    .optional()
    .nullable(), // .nullable() allows explicit null values

  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be 500 characters or less')
    .optional()
    .nullable(),

  interests: z
    .union([
      // Accept either a string (comma-separated) or array of strings
      z.string().transform(str =>
        str.split(',').map(s => s.trim()).filter(Boolean)
      ),
      z.array(z.string().trim()).default([])
    ])
    .optional()
    .default([])
});

/**
 * Login Request Schema
 *
 * Much simpler than signup - just email and password.
 * Notice we reuse emailSchema for consistency!
 *
 * For login, we don't enforce password strength rules
 * (user might have old account with weaker password)
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
});

/**
 * TYPE INFERENCE (Advanced Concept)
 *
 * Zod can automatically generate TypeScript types from schemas!
 * This is HUGE because:
 * 1. Your validation and types are always in sync
 * 2. You define the shape once, not twice
 *
 * Usage in TypeScript:
 * const data: SignupInput = signupSchema.parse(req.body);
 * // TypeScript now knows data.email is string, data.interests is string[], etc.
 */
// These would be used in TypeScript files:
// export type SignupInput = z.infer<typeof signupSchema>;
// export type LoginInput = z.infer<typeof loginSchema>;
