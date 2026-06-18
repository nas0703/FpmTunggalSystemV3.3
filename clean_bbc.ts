import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Try reading from applet config if dotenv is empty
let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const configPath = './supabase-applet-config.json';
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  if (!supabaseUrl) supabaseUrl = config.supabaseUrl;
  if (!supabaseAnonKey) supabaseAnonKey = config.supabaseAnonKey;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clean() {
  console.log("Cleaning BBC records from Supabase tables...");
  
  // 1. Delete from hasil_bbc_history
  try {
    const { data, error } = await supabase
      .from('hasil_bbc_history')
      .delete()
      .in('category', ['bbcHistory', 'feldaBbcHistory']);
      
    if (error) {
      console.log("hasil_bbc_history table might not exist or returned error:", error.message);
    } else {
      console.log("Successfully cleaned and deleted bbc categories from hasil_bbc_history!");
    }
  } catch (e: any) {
    console.error("Error cleaning hasil_bbc_history:", e.message);
  }

  // 2. Delete from hasil_abw_history (to clear old seed rows)
  try {
    const { data, error } = await supabase
      .from('hasil_abw_history')
      .delete()
      .in('category', ['bbcHistory', 'feldaBbcHistory']);
      
    if (error) {
      console.log("hasil_abw_history table returned error:", error.message);
    } else {
      console.log("Successfully cleaned and deleted bbc categories from hasil_abw_history!");
    }
  } catch (e: any) {
    console.error("Error cleaning hasil_abw_history:", e.message);
  }

  console.log("Database clean up complete.");
}

clean();
