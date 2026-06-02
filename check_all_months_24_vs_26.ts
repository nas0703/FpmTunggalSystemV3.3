import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  process.exit();
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('hantaran_hasil').select('*');
  if (error) {
    console.error(error);
    return;
  }

  const monthsMap: Record<string, { total_created: number, tarikh_24: number, tarikh_26: number, other: number }> = {};

  data.forEach((item: any) => {
    const created_at = String(item.created_at || "");
    const tarikh = String(item.tarikh || "");
    
    if (created_at.includes("2026-")) {
      const parts = created_at.split("T")[0].split("-");
      const m = `${parts[0]}-${parts[1]}`;
      
      if (!monthsMap[m]) {
        monthsMap[m] = { total_created: 0, tarikh_24: 0, tarikh_26: 0, other: 0 };
      }
      
      const s = monthsMap[m];
      s.total_created++;
      
      if (tarikh.startsWith("2024")) {
        s.tarikh_24++;
      } else if (tarikh.startsWith("2026")) {
        s.tarikh_26++;
      } else {
        s.other++;
      }
    }
  });

  console.log("=== YEAR MISMATCHES FOR ALL 2026 CREATED MONTHS ===");
  Object.keys(monthsMap).sort().forEach(m => {
    const s = monthsMap[m];
    console.log(`Month (created_at): ${m} | Total Created: ${s.total_created} | Tarikh starts with 2026: ${s.tarikh_26} | Tarikh starts with 2024: ${s.tarikh_24} | Other: ${s.other}`);
  });
}

check();
