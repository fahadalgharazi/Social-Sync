import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';  // same folder, so just ./config.js

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
