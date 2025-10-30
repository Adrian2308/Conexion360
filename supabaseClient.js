import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://agaubewwvbfwuztoqjyh.supabase.co'; // pega tu Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYXViZXd3dmJmd3V6dG9xanloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTk2NTYsImV4cCI6MjA3NzMzNTY1Nn0.tZKkW4A_YUbx7tNTbHTn0scoIQaG2uB70t3fjDbX2sU'; // pega tu anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
