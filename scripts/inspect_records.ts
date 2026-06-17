import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Credentials missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const { data, error } = await supabase.from('hantaran_hasil').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else if (data && data.length > 0) {
    console.log("=== HANTARAN_HASIL RECORD KEYS ===");
    console.log(Object.keys(data[0]));
    console.log("=== SAMPLE RECORD ===");
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log("No records found in hantaran_hasil");
  }
}

inspect();
