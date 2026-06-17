import { supabase } from "./supabaseClient";

interface DiagnosticResult {
  success: boolean;
  urlConfigured: boolean;
  keyConfigured: boolean;
  isPlaceholder: boolean;
  pingSuccessful: boolean;
  errorDetails?: string;
  advice?: string[];
}

/**
 * Diagnoses Supabase client configuration and runs active checks.
 * This logs helpful debug metadata and returns status + solutions.
 */
export async function diagnoseSupabaseConnection(): Promise<DiagnosticResult> {
  // 1. Inspect Environment Variables safely (hiding sensitive sections)
  const envUrl = 
    (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined) ||
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_URL || 
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined) ||
    // @ts-ignore
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';

  const envKey = 
    (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined) ||
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) ||
    // @ts-ignore
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    '';

  const urlConfigured = !!envUrl && envUrl !== 'https://placeholder.supabase.co';
  const keyConfigured = !!envKey && envKey !== 'placeholder';
  const isPlaceholder = envUrl.includes('placeholder.supabase.co') || envKey === 'placeholder';

  console.group("🔍 [Supabase Diagnostics Log]");
  console.log("📍 Client configuration detected:");
  console.log(`   - URL Configured: ${urlConfigured ? "✅ YES" : "❌ NO"}`);
  console.log(`   - URL Value: ${envUrl || "(empty)"}`);
  console.log(`   - Anon Key Configured: ${keyConfigured ? "✅ YES" : "❌ NO"}`);
  console.log(`   - Anon Key Length: ${envKey ? envKey.length + " characters" : "0"}`);
  if (envKey) {
    const startStr = envKey.substring(0, 10);
    const endStr = envKey.substring(envKey.length - 8);
    console.log(`   - Anon Key Preview: ${startStr}...***...${endStr}`);
  }
  console.log(`   - Using Placeholder Credentials: ${isPlaceholder ? "⚠️ YES (Local fallback)" : "✅ NO"}`);

  const advice: string[] = [];
  if (!urlConfigured) {
    advice.push("Sila masukkan domain Supabase anda yang betul (bukan placeholder) ke dalam variable VITE_SUPABASE_URL.");
  }
  if (!keyConfigured) {
    advice.push("Sila masukkan API key anon Supabase anda ke dalam variable VITE_SUPABASE_ANON_KEY.");
  }

  let pingSuccessful = false;
  let errorDetails = "";

  // 2. Perform simple ping query
  try {
    console.log("⚡ Menjalankan ujian ping ke Supabase...");
    
    // Query yang paling ringkas dan pantas (select 1)
    const { data, error } = await supabase.from('hujan_rekod').select('id').limit(1);

    if (error) {
      console.error("❌ Ralat dikembalikan oleh API Supabase semasa ujian ping:", error);
      errorDetails = `Supabase API Error: [Code: ${error.code}] ${error.message}`;
      
      // Categorize common codes
      if (error.code === 'PGRST301' || error.message?.toLowerCase().includes('jwt') || error.message?.toLowerCase().includes('apikey')) {
        advice.push("API key yang diberikan tidak sah atau tidak sepadan dengan projek Supabase anda. Semak 'supabseAnonKey'.");
      } else if (error.code === '42P01') {
        advice.push("Jadual 'hujan_rekod' tidak ditemui di dalam senarai database public anda. Anda mungkin perlu menjalankan fail 'setup_hujan_rls.sql' di SQL Editor.");
        pingSuccessful = true; // DB responsive, query simply missed the table
      } else {
        advice.push("Ujian sambungan berjaya dihantar tetapi pangkalan data mengembalikan ralat. Sila pastikan RLS diaktifkan dengan betul.");
      }
    } else {
      console.log("✅ Ujian sambungan ping Supabase berjaya! Data dipulangkan:", data);
      pingSuccessful = true;
    }
  } catch (err: any) {
    console.error("💥 Ralat kritikal menangkap sambungan:", err);
    errorDetails = err.message || JSON.stringify(err);
    advice.push("Pastikan anda mempunyai sambungan internet yang aktif dan domain Supabase anda tidak disekat oleh CORS atau firewall.");
  }

  console.groupEnd();

  return {
    success: urlConfigured && keyConfigured && !isPlaceholder && pingSuccessful,
    urlConfigured,
    keyConfigured,
    isPlaceholder,
    pingSuccessful,
    errorDetails,
    advice
  };
}
