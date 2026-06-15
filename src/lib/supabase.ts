import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://twxkjbxkqnddblaahqls.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bFYgbw5U-1OYJKv3AKr8PA_R-VFOp_8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
