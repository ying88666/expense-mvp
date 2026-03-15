import { createClient } from '@supabase/supabase-js';

export const CATEGORIES = ['交通', '教育', '美食', '打扮', '旅游'];
export const TABLE_NAME = 'expenses';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
