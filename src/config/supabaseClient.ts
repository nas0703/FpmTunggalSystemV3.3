import { createClient } from '@supabase/supabase-js';

// Helper function untuk menyokong kedua-dua persekitaran: Next.js (Vercel) dan Vite (Local/AI Studio)
const getEnvVars = () => {
  // 1. Next.js App Router / Vercel (Pilihan Utama)
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    };
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

