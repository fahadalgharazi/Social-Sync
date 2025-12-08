// backend/config.js
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables before anything else
dotenv.config();

/**
 * Environment Variable Schema
 *
 * Validates all required environment variables on server startup.
 * Fails fast if configuration is missing or invalid.
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, {
      message: 'PORT must be between 1 and 65535',
    }),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL must be a valid URL')
    .default('http://localhost:5173'),

  // External APIs
  TICKETMASTER_KEY: z
    .string()
    .min(1, 'TICKETMASTER_KEY is required')
    .describe('Get from https://developer.ticketmaster.com/'),

  // Supabase Configuration
  SUPABASE_URL: z
    .string()
    .url('SUPABASE_URL must be a valid URL')
    .min(1, 'SUPABASE_URL is required')
    .describe('Your Supabase project URL'),

  SUPABASE_KEY: z
    .string()
    .min(1, 'SUPABASE_KEY (anon/public key) is required')
    .describe('Supabase anon/public key'),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required')
    .describe('Supabase service role key (keep secret!)'),
});

/**
 * Validate and parse environment variables
 *
 * This runs immediately when the config module is imported.
 * If validation fails, the server won't start and will show helpful error messages.
 */
let env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error('');

  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      console.error(`  • ${path}: ${err.message}`);

      // Show description if available
      const field = envSchema.shape[err.path[0]];
      if (field && field.description) {
        console.error(`    ℹ️  ${field.description}`);
      }
    });
  } else {
    console.error(error);
  }

  console.error('');
  console.error('💡 Check your .env file and ensure all required variables are set.');
  console.error('   See .env.example for reference.');
  console.error('');

  process.exit(1); // Exit with error code
}

// Export validated config
export const PORT = env.PORT;
export const NODE_ENV = env.NODE_ENV;
export const FRONTEND_URL = env.FRONTEND_URL;
export const TICKETMASTER_KEY = env.TICKETMASTER_KEY;
export const SUPABASE_URL = env.SUPABASE_URL;
export const SUPABASE_KEY = env.SUPABASE_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Log configuration on startup (development only)
if (NODE_ENV === 'development') {
  console.log('');
  console.log('✅ Environment configuration validated');
  console.log('');
  console.log('🌍 Server Configuration:');
  console.log(`   PORT: ${PORT}`);
  console.log(`   NODE_ENV: ${NODE_ENV}`);
  console.log(`   FRONTEND_URL: ${FRONTEND_URL}`);
  console.log('');
  console.log('🔑 External Services:');
  console.log(`   TICKETMASTER_KEY: ${TICKETMASTER_KEY ? '✔️ Present' : '❌ Missing'}`);
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✔️ Present' : '❌ Missing'}`);
  console.log(`   SUPABASE_KEY: ${SUPABASE_KEY ? '✔️ Present' : '❌ Missing'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '✔️ Present' : '❌ Missing'}`);
  console.log('');
}
