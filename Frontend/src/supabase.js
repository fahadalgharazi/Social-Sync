import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ymopgfxefafqjxdwlzhu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltb3BnZnhlZmFmcWp4ZHdsemh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwMDcwMjcsImV4cCI6MjA1MDU4MzAyN30.-0_kGKkDEmpl_XWbt9cPBVaIL3sAEOVUwKnZHLY7bvU";



export const supabase = createClient(supabaseUrl, supabaseKey);
