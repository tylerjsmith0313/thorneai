import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[v0] Supabase Init - URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('[v0] Supabase Init - Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `Missing Supabase configuration. URL: ${supabaseUrl ? 'OK' : 'MISSING'}, Key: ${supabaseAnonKey ? 'OK' : 'MISSING'}`;
  console.error('[v0] ' + errorMsg);
  throw new Error(errorMsg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
