import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined) ||
// @ts-ignore
  import.meta.env.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) ||
// @ts-ignore
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof process !== 'undefined' ? (process.env as any).SUPABASE_URL : undefined) ||
// @ts-ignore
  (import.meta.env as any).SUPABASE_URL ||
  '';

const supabaseAnonKey = 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined) ||
// @ts-ignore
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) ||
// @ts-ignore
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? (process.env as any).SUPABASE_ANON_KEY : undefined) ||
// @ts-ignore
  (import.meta.env as any).SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Supabase URL is missing or using placeholder. Please check your environment variables (VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL).');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
