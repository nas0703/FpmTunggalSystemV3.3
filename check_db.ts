import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const configPath = './supabase-applet-config.json';
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

  async function check() {
    const { data, error } = await supabase.from('hantaran_hasil').select('no_resit, tarikh, masa_masuk, created_at').order('created_at', { ascending: false }).limit(20);
    console.log(JSON.stringify(data, null, 2));
  }
  check();
} else {
  console.log("No config found");
}
