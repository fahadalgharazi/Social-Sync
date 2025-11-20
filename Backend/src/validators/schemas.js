import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  gender: z.enum(['male', 'female', 'nonbinary', 'other']).optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  interests: z.string().optional(),
  zip: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
});

export const eventSearchSchema = z.object({
  personalityType: z
    .enum(['Reactive Idealist', 'Balanced Realist', 'Sensitive Companion', 'Secure Optimist'])
    .optional(),
  limit: z.number().min(1).max(100).optional(), // Strict: must be number in JSON
  page: z.number().min(0).optional(),
});