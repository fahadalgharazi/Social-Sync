// Frontend/src/validators/auth.validator.js
import { z } from 'zod';

/**
 * LESSON: Shared Validation Between Frontend and Backend
 *
 * These schemas mirror our backend validators. This provides:
 * 1. Immediate feedback to users (no server round-trip)
 * 2. Consistent validation rules across frontend and backend
 * 3. Type-safe form handling with React Hook Form
 *
 * The backend STILL validates (never trust the client!), but
 * frontend validation improves UX by catching errors early.
 */

/**
 * Email Schema
 * Matches backend: lowercase, trimmed, valid email format
 */
const emailSchema = z
  .string({ required_error: 'Email is required' })
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .trim()
  .toLowerCase();

/**
 * Password Schema for Signup
 * Enforces strong password requirements
 */
const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Name Schema
 * Used for first and last names
 */
const nameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(1, 'Name cannot be empty')
  .max(50, 'Name is too long (max 50 characters)');

/**
 * ZIP Code Schema
 * Supports both 5-digit and ZIP+4 formats
 */
const zipCodeSchema = z
  .string({ required_error: 'ZIP code is required' })
  .trim()
  .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (12345 or 12345-6789)');

/**
 * Login Schema
 * Note: Password validation is relaxed for login
 * (Users might have old passwords from before we added requirements)
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
});

/**
 * Signup Schema
 * Full validation including password strength, names, ZIP, and optional fields
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  firstName: nameSchema,
  lastName: nameSchema,
  zip: zipCodeSchema,
  gender: z.string().trim().optional().nullable(),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or less').optional().nullable(),
  interests: z.string().trim().optional().nullable()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"] // Error will appear on confirmPassword field
  }
);

/**
 * WHAT THIS GIVES US:
 *
 * 1. Instant feedback: Users see errors as they type
 * 2. Consistent rules: Same validation on frontend and backend
 * 3. Better UX: No server round-trip for simple validation errors
 * 4. Type safety: React Hook Form knows the shape of our data
 * 5. Less code: No more manual if/else validation checks
 */
