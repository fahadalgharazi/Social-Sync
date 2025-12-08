import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  firstName: z.string().trim().min(1, 'First name required').max(50, 'First name too long'),
  lastName: z.string().trim().min(1, 'Last name required').max(50, 'Last name too long'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  gender: z.enum(['male', 'female', 'nonbinary', 'other']).optional(),
  bio: z.string().trim().max(500, 'Bio too long').optional(),
  interests: z.string().trim().optional(),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, 'ZIP must be 5 digits (e.g., 12345 or 12345-6789)'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export const eventSearchSchema = z.object({
  personalityType: z
    .enum(['Reactive Idealist', 'Balanced Realist', 'Sensitive Companion', 'Secure Optimist'])
    .optional(),
  limit: z.number().min(1).max(100).optional(), // Strict: must be number in JSON
  page: z.number().min(0).optional(),
});