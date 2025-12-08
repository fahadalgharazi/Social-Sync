import { z } from 'zod';


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
 * Username Schema
 * Alphanumeric and underscores only
 */
const usernameSchema = z
  .string({ required_error: 'Username is required' })
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

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
  username: usernameSchema,
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
