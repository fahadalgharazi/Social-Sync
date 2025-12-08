import { z } from 'zod';



const emailSchema = z
  .string({ required_error: 'Email is required' })
  .email('Please enter a valid email address')
  .trim()
  .toLowerCase();


const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');


const nameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(1, 'Name cannot be empty')
  .max(50, 'Name is too long');

const usernameSchema = z
  .string({ required_error: 'Username is required' })
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

const zipCodeSchema = z
  .string({ required_error: 'ZIP code is required' })
  .trim()
  .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');

export const signupSchema = z.object({
  // Required fields
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  firstName: nameSchema,
  lastName: nameSchema,
  username: usernameSchema,
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
      z.string().transform(str =>
        str.split(',').map(s => s.trim()).filter(Boolean)
      ),
      z.array(z.string().trim()).default([])
    ])
    .optional()
    .default([])
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
});

