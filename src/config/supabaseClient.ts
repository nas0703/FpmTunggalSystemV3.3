import { createClient } from '@supabase/supabase-js';

// Helper function untuk menyokong kedua-dua persekitaran: Next.js (Vercel) dan Vite (Local/AI Studio)
const getEnvVars = () => {
  // 0. Dynamic Script Injection (Highest Priority in browser runtime)
  if (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) {
    return {
      url: (window as any).__SUPABASE_URL__,
      key: (window as any).__SUPABASE_ANON_KEY__ || ''
    };
  }

  // 1. Next.js App Router / Vercel (Pilihan Utama)
  if (typeof process !== 'undefined' && process.env) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || (process.env as any).SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || (process.env as any).SUPABASE_ANON_KEY;
    if (url) {
      return {
        url,
        key: key || ''
      };
    }
  }
  
  // 2. Vite / Local (Fallback)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_URL) {
    return {
      url: (import.meta as any).env.VITE_SUPABASE_URL,
      key: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ''
    };
  }
  
  // 3. Placeholder jika tiada env variables dijumpai
  return {
    url: 'https://placeholder.supabase.co',
    key: 'placeholder-anon-key'
  };
};

const envVars = getEnvVars();

export const supabase = createClient(envVars.url, envVars.key);

