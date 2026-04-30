import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  // Try Vite's native way first
  const meta: any = import.meta;
  if (typeof meta !== 'undefined' && meta.env && meta.env[key]) {
    return meta.env[key];
  }
  // Fallback to process.env (for server-side or if defined via vite config)
  if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
    return (process.env as any)[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 
                    getEnv('NEXT_PUBLIC_SUPABASE_URL') || 
                    getEnv('SUPABASE_URL') || 
                    '';

const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 
                        getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
                        getEnv('SUPABASE_ANON_KEY') || 
                        '';

if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Supabase URL is missing or using placeholder. Please check your environment variables (VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL).');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
