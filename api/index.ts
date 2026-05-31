import express from "express";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log("Loading API routes from api/index.ts...");

dotenv.config();

// Local JSON Database Fallback
let DATA_DIR = path.join(process.cwd(), '.data');
let HANTARAN_DB_FILE = path.join(DATA_DIR, 'hantaran.json');
let MERUMPUT_PROGRESS_FILE = path.join(DATA_DIR, 'merumput_progress.json');
let MERUMPUT_INVENTORY_FILE = path.join(DATA_DIR, 'merumput_inventory.json');
let MERUMPUT_TRANSACTIONS_FILE = path.join(DATA_DIR, 'merumput_transactions.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create .data directory, falling back to /tmp");
  DATA_DIR = '/tmp';
  HANTARAN_DB_FILE = path.join(DATA_DIR, 'hantaran.json');
  MERUMPUT_PROGRESS_FILE = path.join(DATA_DIR, 'merumput_progress.json');
  MERUMPUT_INVENTORY_FILE = path.join(DATA_DIR, 'merumput_inventory.json');
  MERUMPUT_TRANSACTIONS_FILE = path.join(DATA_DIR, 'merumput_transactions.json');
}

function getLocalHantaran() {
  if (fs.existsSync(HANTARAN_DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HANTARAN_DB_FILE, 'utf-8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveLocalHantaran(data: any[]) {
  try {
    fs.writeFileSync(HANTARAN_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write local JSON DB:", err);
  }
}

function getInitialSeedData() {
  const ESTATE_BLOCKS = [
    { blok: "1", luas: 72.15 },
    { blok: "2", luas: 68.37 },
    { blok: "3", luas: 76.59 },
    { blok: "4", luas: 92.39 },
    { blok: "5", luas: 60.19 },
    { blok: "6", luas: 80.42 },
    { blok: "7", luas: 89.46 },
    { blok: "8", luas: 82.03 },
    { blok: "9", luas: 83.61 },
    { blok: "10", luas: 84.36 },
    { blok: "11", luas: 47.85 },
    { blok: "12", luas: 76.50 },
    { blok: "13", luas: 50.75 },
    { blok: "14", luas: 70.44 },
    { blok: "15", luas: 68.36 },
    { blok: "16", luas: 64.44 },
    { blok: "17", luas: 84.08 },
    { blok: "18", luas: 76.20 },
    { blok: "19", luas: 81.75 },
    { blok: "20", luas: 68.62 },
    { blok: "21", luas: 24.26 },
    { blok: "22", luas: 65.29 },
    { blok: "LF", luas: 98.51 }
  ];

  const BULATAN_P1_MAP: Record<string, { hek_siap: number; workers_count: number; tarikh_mula: string; tarikh_siap?: string }> = {
    "1": { hek_siap: 72.15, workers_count: 5, tarikh_mula: "2026-05-06", tarikh_siap: "2026-05-06" },
    "2": { hek_siap: 68.37, workers_count: 4, tarikh_mula: "2026-05-13", tarikh_siap: "2026-05-13" },
    "3": { hek_siap: 76.59, workers_count: 5, tarikh_mula: "2026-05-19", tarikh_siap: "2026-05-19" },
    "4": { hek_siap: 12.00, workers_count: 3, tarikh_mula: "2026-05-26" },
    "5": { hek_siap: 60.19, workers_count: 5, tarikh_mula: "2026-05-18", tarikh_siap: "2026-05-18" },
    "6": { hek_siap: 80.42, workers_count: 6, tarikh_mula: "2026-05-12", tarikh_siap: "2026-05-12" },
    "7": { hek_siap: 89.46, workers_count: 7, tarikh_mula: "2026-05-04", tarikh_siap: "2026-05-04" },
    "13": { hek_siap: 24.00, workers_count: 12, tarikh_mula: "2026-05-25" },
    "18": { hek_siap: 76.20, workers_count: 5, tarikh_mula: "2026-05-10", tarikh_siap: "2026-05-10" },
    "19": { hek_siap: 44.00, workers_count: 7, tarikh_mula: "2026-05-25" },
    "21": { hek_siap: 24.26, workers_count: 3, tarikh_mula: "2026-04-20", tarikh_siap: "2026-04-20" },
    "22": { hek_siap: 65.29, workers_count: 4, tarikh_mula: "2026-04-18", tarikh_siap: "2026-04-18" },
    "LF": { hek_siap: 98.51, workers_count: 6, tarikh_mula: "2026-01-10", tarikh_siap: "2026-01-10" }
  };

  const seed: any[] = [];
  ESTATE_BLOCKS.forEach((b, idx) => {
    // 1. Pusingan 1 - BULATAN & LORONG
    const bulatanEntry = BULATAN_P1_MAP[b.blok];
    if (bulatanEntry) {
      seed.push({
        id: `seed-b1-${b.blok}`,
        blok: b.blok,
        luas: b.luas,
        pusingan: 1,
        jenis: "BULATAN & LORONG",
        tarikh_mula: bulatanEntry.tarikh_mula,
        tarikh_siap: bulatanEntry.tarikh_siap || null,
        hek_siap: bulatanEntry.hek_siap,
        workers_count: bulatanEntry.workers_count,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } else {
      seed.push({
        id: `seed-b1-${b.blok}`,
        blok: b.blok,
        luas: b.luas,
        pusingan: 1,
        jenis: "BULATAN & LORONG",
        tarikh_mula: "2026-05-01",
        tarikh_siap: null,
        hek_siap: 0,
        workers_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // 2. Pusingan 1 - DADA (R&S)
    const dadaMulaStr = `2026-04-${String(10 + (idx % 15)).padStart(2, '0')}`;
    seed.push({
      id: `seed-d1-${b.blok}`,
      blok: b.blok,
      luas: b.luas,
      pusingan: 1,
      jenis: "DADA (R&S)",
      tarikh_mula: dadaMulaStr,
      tarikh_siap: dadaMulaStr,
      hek_siap: b.luas,
      workers_count: Math.max(3, Math.round(b.luas / 20)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 3. Pusingan 2 - BULATAN & LORONG
    seed.push({
      id: `seed-b2-${b.blok}`,
      blok: b.blok,
      luas: b.luas,
      pusingan: 2,
      jenis: "BULATAN & LORONG",
      tarikh_mula: "2026-05-01",
      tarikh_siap: null,
      hek_siap: 0,
      workers_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 4. Pusingan 2 - DADA (R&S)
    seed.push({
      id: `seed-d2-${b.blok}`,
      blok: b.blok,
      luas: b.luas,
      pusingan: 2,
      jenis: "DADA (R&S)",
      tarikh_mula: "2026-05-01",
      tarikh_siap: null,
      hek_siap: 0,
      workers_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });
  return seed;
}

function getLocalMerumputProgress() {
  if (fs.existsSync(MERUMPUT_PROGRESS_FILE)) {
    try {
      const stored = JSON.parse(fs.readFileSync(MERUMPUT_PROGRESS_FILE, 'utf-8'));
      if (stored && stored.length >= 92) {
        // Migration: Ensure LF has "2026-01-10" instead of older date to reflect overdue
        let isModified = false;
        const migrated = stored.map((item: any) => {
          if (item.blok === "LF" && item.pusingan === 1 && item.jenis === "BULATAN & LORONG" && item.tarikh_mula === "2026-02-05") {
            isModified = true;
            return {
              ...item,
              tarikh_mula: "2026-01-10",
              tarikh_siap: "2026-01-10",
              updated_at: new Date().toISOString()
            };
          }
          return item;
        });
        if (isModified) {
          saveLocalMerumputProgress(migrated);
          return migrated;
        }
        return stored;
      }
    } catch (e) {
      // ignore
    }
  }
  const seed = getInitialSeedData();
  saveLocalMerumputProgress(seed);
  return seed;
}

function saveLocalMerumputProgress(data: any[]) {
  try {
    fs.writeFileSync(MERUMPUT_PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write local Merumput progress JSON:", err);
  }
}

function getLocalMerumputInventory() {
  if (fs.existsSync(MERUMPUT_INVENTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MERUMPUT_INVENTORY_FILE, 'utf-8'));
    } catch (e) {
      return [];
    }
  }
  const defaultInventory = [
    { id: "1", name: 'GLYPHOSATE 41% (GLYPHOSENE/KEN-UP)', quantity: 100, min_threshold: 20, unit: 'LITER', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "2", name: 'TRICLOPYR 32% (KENELON/GARLON)', quantity: 50, min_threshold: 10, unit: 'LITER', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "3", name: 'METSULFURON-METHYL (ALLY 20DF)', quantity: 20, min_threshold: 5, unit: 'KG', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "4", name: 'GLUFOSINATE-AMMONIUM (BASTA 15)', quantity: 80, min_threshold: 20, unit: 'LITER', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "5", name: 'FLUROXYPYR (STARANE HARMONY)', quantity: 30, min_threshold: 10, unit: 'LITER', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];
  return defaultInventory;
}

function saveLocalMerumputInventory(data: any[]) {
  try {
    fs.writeFileSync(MERUMPUT_INVENTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write local Merumput inventory:", err);
  }
}

function getLocalMerumputTransactions() {
  if (fs.existsSync(MERUMPUT_TRANSACTIONS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MERUMPUT_TRANSACTIONS_FILE, 'utf-8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveLocalMerumputTransactions(data: any[]) {
  try {
    fs.writeFileSync(MERUMPUT_TRANSACTIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write local Merumput transactions:", err);
  }
}


// Initialize Supabase client lazily to pick up runtime environment variables
let supabaseClient: any = null;

// Global Cache for hantaran records to optimize application loading speed
let hantaranCache: any[] | null = null;

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase credentials missing");
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}

function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST116' ||
    code === 'PGRST204' ||
    msg.includes('schema cache') ||
    msg.includes('does not exist') ||
    msg.includes('relation')
  );
}

const app = express();

// Add JSON middleware for standalone Vercel execution
app.use(express.json());

const apiRouter = express.Router();

// Request logging middleware
apiRouter.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
apiRouter.post("/hantaran", async (req, res) => {
  try {
    const data = req.body;
    
    // Basic validation
    if (!data.no_resit || !data.no_lori || !data.blok) {
      return res.status(400).json({ 
        success: false, 
        error: "Maklumat tidak lengkap. Sila pastikan No. Resit, No. Lori dan Blok diisi." 
      });
    }

    // Mapping Luas (Hektar) mengikut gambar yang diberikan
    const BLOK_AREAS: Record<string, number> = {
      "1": 72.15, "2": 68.37, "3": 76.59, "4": 92.39, "5": 60.19,
      "6": 80.42, "7": 89.46, "8": 82.03, "9": 83.61, "10": 84.36,
      "11": 47.85, "12": 76.50, "13": 50.75, "14": 70.45, "15": 68.36,
      "16": 64.44, "17": 84.08, "18": 76.20, "19": 81.75, "20": 68.62,
      "21": 24.26, "22": 65.29, "88": 98.51 // Total LF (51.71 + 46.80)
    };

    const rawBlok = data.blok ? data.blok.toString().replace(/[^0-9]/g, '') : '';
    const blokNum = parseInt(rawBlok, 10);
    const cleanBlok = isNaN(blokNum) ? '' : blokNum.toString();
    
    let pkt = "001";
    if (blokNum >= 18 && blokNum <= 22) pkt = "002";
    else if (blokNum === 88) pkt = "003";
    
    const now = new Date();
    
    // Waktu tempatan Malaysia
    const myTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const calendarToday = myTime.toISOString().split('T')[0];

    // Handle date from request or generate current date
    let dateStr = data.tarikh;
    if (dateStr) {
      dateStr = dateStr.trim();
      if (dateStr.includes('/')) {
        let [d, m, y] = dateStr.split('/');
        if (y && y.length === 2) y = '20' + y;
        dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          // Keep as is
        } else if (parts[2] && parts[2].length === 4) {
          dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      
      // Auto-correct wrong year from OCR (e.g. 2024 to 2026)
      const currentYearStr = String(myTime.getUTCFullYear());
      let parsedParts = dateStr.split('-');
      if (parsedParts.length === 3) {
         if (parsedParts[0].length === 4 && parsedParts[0] !== currentYearStr) {
           parsedParts[0] = currentYearStr;
           dateStr = parsedParts.join('-');
         }
      }
    }
    
    if (!dateStr || !dateStr.includes('-')) {
      // Gunakan waktu tempatan (Malaysia) untuk ketepatan Hari Ini (UTC+8)
      dateStr = calendarToday;
    }

    // ==========================================
    // LOGIK SHIFT DATE SEBELUM 8 PAGI
    // ==========================================
    let receiptHour = 24; // Default to something that prevents shift if no explicit time
    const masaMasuk = data.masa_masuk || "";
    if (masaMasuk.trim()) {
       const timeParts = masaMasuk.split(':');
       if (timeParts.length >= 2) {
         receiptHour = parseInt(timeParts[0], 10);
       }
    }

    // Hanya ubah jika dateStr sama dengan calendarToday (bermaksud ia mungkin menggunakan calendar date)
    // dan masa masuk TERTULIS DI RESIT adalah sebelum 8 pagi. Ini mengelakkan shift dua kali jika weighbridge sudah menggunakan tarikh bekerja.
    // Pengecualian: Jangan anjak tarikh untuk lot Felda (B88)
    if (dateStr === calendarToday && !isNaN(receiptHour) && receiptHour < 8 && cleanBlok !== "88") {
       const [y, m, d] = dateStr.split('-');
       const dObj = new Date(Date.UTC(parseInt(y), parseInt(m)-1, parseInt(d)));
       dObj.setUTCDate(dObj.getUTCDate() - 1);
       dateStr = dObj.toISOString().split('T')[0];
    }

    // ==========================================
    // CLAMP FUTURE DATES (OCR SAFETY)
    // ==========================================
    // Jika tarikh dari OCR (contoh: 2026-12-10) melebihi tarikh sebenar hari ini (contoh: 2026-05-10),
    // kita setkan ke tarikh hari ini sebagai fallback untuk mengelakkan ralat data yang di-OCR salah sebagai bulan hadapan.
    if (dateStr > calendarToday) {
      dateStr = calendarToday;
    }

    const tanValue = parseFloat(data.tan) || 0;
    const rm_mt = parseFloat(data.rm_mt) || 0;
    const hasil_rm = parseFloat((tanValue * rm_mt).toFixed(2));
    const luasBlok = BLOK_AREAS[cleanBlok] || 1; // Use cleanBlok for lookup
    const thekValue = tanValue / luasBlok;

    const payload = {
      no_resit: data.no_resit.trim().toUpperCase(),
      no_akaun_terima: data.no_akaun_terima?.trim().toUpperCase() || '',
      no_lori: data.no_lori.trim().toUpperCase(),
      no_seal: data.no_seal?.trim().toUpperCase() || '',
      no_nota_hantaran: data.no_nota_hantaran?.trim().toUpperCase() || '',
      kpg: data.kpg?.trim().toUpperCase() || '',
      blok: cleanBlok, // Store cleaned blok string
      peringkat: data.is_efb ? "EFB" : `PKT ${pkt}`,
      tan: tanValue,
      muda: parseInt(data.muda) || 0,
      reject: parseFloat(data.reject) || 0,
      sample: parseInt(data.sample) || 0,
      rm_mt: rm_mt,
      hasil_rm: hasil_rm,
      thek: parseFloat(thekValue.toFixed(4)), // Simpan dengan 4 tempat perpuluhan
      tarikh: dateStr,
      masa_masuk: data.masa_masuk || now.toLocaleTimeString('en-GB', { hour12: false }),
      created_at: now.toISOString()
    };

    let dbSuccess = false;

    // 1. Supabase Insert
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: sbError } = await supabase.from('hantaran_hasil').insert([payload]);
        if (sbError) {
          console.error("Supabase Error:", sbError);
          if (sbError.code === '23505') { // Unique violation
            return res.status(409).json({ success: false, error: `No. Resit ${payload.no_resit} sudah wujud dalam sistem.` });
          }
          throw new Error(`Ralat Pangkalan Data: ${sbError.message}`);
        }
        dbSuccess = true;
      } catch (sbErr: any) {
        console.error("Database operation failed:", sbErr.message);
        return res.status(500).json({ success: false, error: sbErr.message });
      }
    } else {
      console.warn("Supabase not configured. Using local JSON fallback.");
      const localData = getLocalHantaran();
      if (localData.some((r: any) => r.no_resit === payload.no_resit)) {
        return res.status(409).json({ success: false, error: `No. Resit ${payload.no_resit} sudah wujud dalam sistem.` });
      }
      localData.unshift(payload); // Add to beginning
      saveLocalHantaran(localData);
      dbSuccess = true;
    }

    hantaranCache = null; // Invalidate cache on new entry insert

    res.json({ 
      success: true, 
      ref: payload.no_resit,
      sync: { db: dbSuccess }
    });
  } catch (err: any) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ success: false, error: "Ralat pelayan dalaman. Sila cuba sebentar lagi." });
  }
});

apiRouter.get("/hantaran", async (req, res) => {
  try {
    // Return cached data if available for high performance
    if (hantaranCache) {
      console.log(`Returning cached hantaran records count: ${hantaranCache.length}`);
      return res.json(hantaranCache);
    }

    const supabase = getSupabase();
    if (supabase) {
      let allRecords: any[] = [];
      let start = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: records, error } = await supabase
          .from('hantaran_hasil')
          .select('*')
          .order('created_at', { ascending: false })
          .range(start, start + step - 1);

        if (error) {
          console.error("Supabase Fetch Error:", error);
          return res.status(500).json({ error: "Gagal mengambil data dari pangkalan data." });
        }

        if (records && records.length > 0) {
          allRecords = allRecords.concat(records);
          start += step;
          if (records.length < step) {
             hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      console.log(`Fetched ${allRecords.length} records from hantaran_hasil and storing in cache`);
      hantaranCache = allRecords;
      res.json(allRecords);
    } else {
      console.log("Supabase not configured, returning from local JSON");
      res.json(getLocalHantaran());
    }
  } catch (err: any) { 
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Ralat rangkaian atau pelayan." }); 
  }
});

apiRouter.post("/annual-yield", async (req, res) => {
  try {
    const { year, yield: yieldVal } = req.body;
    if (!year) return res.status(400).json({ error: "Tahun diperlukan." });

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('annual_yield')
        .upsert({ 
          year: parseInt(year), 
          yield: parseFloat(yieldVal) || 0
        }, { onConflict: 'year' });

      if (error) throw error;
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Supabase tidak dikonfigurasi." });
    }
  } catch (err: any) {
    console.error("Annual yield save error:", err.message || err);
    res.status(500).json({ error: "Gagal menyimpan data tahunan." });
  }
});

apiRouter.get("/annual-yield", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('annual_yield')
        .select('*')
        .order('year', { ascending: true });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache')) return res.json([]);
        throw error;
      }
      res.json(data);
    } else {
      res.json([]);
    }
  } catch (err: any) {
    console.error("Annual yield fetch error:", err.message || err);
    res.status(500).json({ error: "Gagal mengambil data tahunan." });
  }
});

apiRouter.get("/block-annual-yields", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('block_annual_yields')
        .select('*')
        .order('year', { ascending: true });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache')) return res.json([]);
        throw error;
      }
      res.json(data);
    } else {
      res.json([]);
    }
  } catch (err: any) {
    console.error("Block annual yield fetch error:", err.message || err);
    res.status(500).json({ error: "Gagal mengambil data tahunan blok." });
  }
});

apiRouter.post("/seed-historical", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Data diperlukan." });
    }

    const supabase = getSupabase();
    if (supabase) {
      // Upsert data to block_annual_yields
      // Usually we might want to chunk this for very large datasets
      const { error } = await supabase
        .from('block_annual_yields')
        .upsert(data, { onConflict: 'year,block' });

      if (error) throw error;
      res.json({ success: true, count: data.length });
    } else {
      res.status(500).json({ error: "Supabase tidak dikonfigurasi." });
    }
  } catch (err: any) {
    console.error("Seeding error:", err.message || err);
    if (err.message?.includes('schema cache') || err.message?.includes('does not exist')) {
      return res.status(500).json({ 
        error: "Jadual 'block_annual_yields' tidak wujud dalam Supabase.",
        code: "TABLE_MISSING",
        details: "Sila bina jadual 'block_annual_yields' dalam Supabase SQL Editor."
      });
    }
    res.status(500).json({ error: "Gagal menyimpan data sejarah." });
  }
});

apiRouter.delete("/hantaran/all", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('hantaran_hasil')
        .delete()
        .neq('no_resit', '0'); // Delete all rows where no_resit is not '0' (effectively all)

      if (error) throw error;
      hantaranCache = null; // Invalidate cache
      res.json({ success: true });
    } else {
      saveLocalHantaran([]);
      hantaranCache = null; // Invalidate cache
      res.json({ success: true });
    }
  } catch (err: any) {
    console.error("Delete all error:", err.message || err);
    res.status(500).json({ success: false, error: "Gagal memadam semua data." });
  }
});

apiRouter.put("/hantaran/:no_resit", async (req, res) => {
  try {
    const { no_resit } = req.params;
    const data = req.body;
    
    if (!no_resit) return res.status(400).json({ success: false, error: "No. Resit diperlukan." });
    if (!data.no_lori || !data.blok) {
      return res.status(400).json({ 
        success: false, 
        error: "Maklumat tidak lengkap. Sila pastikan No. Lori dan Blok diisi." 
      });
    }

    const BLOK_AREAS: Record<string, number> = {
      "1": 72.15, "2": 68.37, "3": 76.59, "4": 92.39, "5": 60.19,
      "6": 80.42, "7": 89.46, "8": 82.03, "9": 83.61, "10": 84.36,
      "11": 47.85, "12": 76.50, "13": 50.75, "14": 70.45, "15": 68.36,
      "16": 64.44, "17": 84.08, "18": 76.20, "19": 81.75, "20": 68.62,
      "21": 24.26, "22": 65.29, "88": 98.51
    };

    const rawBlok = data.blok ? data.blok.toString().replace(/[^0-9]/g, '') : '';
    const blokNum = parseInt(rawBlok, 10);
    const cleanBlok = isNaN(blokNum) ? '' : blokNum.toString();
    
    let pkt = "001";
    if (blokNum >= 18 && blokNum <= 22) pkt = "002";
    else if (blokNum === 88) pkt = "003";

    let dateStr = data.tarikh;
    if (dateStr) {
      dateStr = dateStr.trim();
      if (dateStr.includes('/')) {
        let [d, m, y] = dateStr.split('/');
        if (y && y.length === 2) y = '20' + y;
        dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          // Keep as is
        } else if (parts[2] && parts[2].length === 4) {
          dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }

    const tanValue = parseFloat(data.tan) || 0;
    const rm_mt = parseFloat(data.rm_mt) || 0;
    const hasil_rm = parseFloat((tanValue * rm_mt).toFixed(2));
    const luasBlok = BLOK_AREAS[cleanBlok] || 1;
    const thekValue = tanValue / luasBlok;

    const payload = {
      no_akaun_terima: data.no_akaun_terima?.trim().toUpperCase() || '',
      no_lori: data.no_lori.trim().toUpperCase(),
      no_seal: data.no_seal?.trim().toUpperCase() || '',
      no_nota_hantaran: data.no_nota_hantaran?.trim().toUpperCase() || '',
      kpg: data.kpg?.trim().toUpperCase() || '',
      blok: cleanBlok,
      peringkat: data.is_efb ? "EFB" : `PKT ${pkt}`,
      tan: tanValue,
      muda: parseInt(data.muda) || 0,
      reject: parseFloat(data.reject) || 0,
      sample: parseInt(data.sample) || 0,
      rm_mt: rm_mt,
      hasil_rm: hasil_rm,
      thek: parseFloat(thekValue.toFixed(4)),
      tarikh: dateStr,
      masa_masuk: data.masa_masuk || undefined
    };

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('hantaran_hasil')
        .update(payload)
        .eq('no_resit', no_resit.toUpperCase());

      if (error) throw error;
      hantaranCache = null; // Invalidate cache
      res.json({ success: true, ref: no_resit });
    } else {
      const localData = getLocalHantaran();
      const updatedData = localData.map((r: any) => 
        r.no_resit === no_resit.toUpperCase() ? { ...r, ...payload } : r
      );
      saveLocalHantaran(updatedData);
      hantaranCache = null; // Invalidate cache
      res.json({ success: true, ref: no_resit });
    }
  } catch (err: any) {
    console.error("Update error:", err.message || err);
    res.status(500).json({ success: false, error: "Gagal mengemaskini data." });
  }
});

apiRouter.delete("/hantaran/:no_resit", async (req, res) => {
  try {
    const { no_resit } = req.params;
    if (!no_resit) return res.status(400).json({ success: false, error: "No. Resit diperlukan." });

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from('hantaran_hasil')
        .delete()
        .eq('no_resit', no_resit.toUpperCase());

      if (error) throw error;
      hantaranCache = null; // Invalidate cache
      res.json({ success: true });
    } else {
      const localData = getLocalHantaran();
      const updatedData = localData.filter((r: any) => r.no_resit !== no_resit.toUpperCase());
      saveLocalHantaran(updatedData);
      hantaranCache = null; // Invalidate cache
      res.json({ success: true });
    }
  } catch (err: any) {
    console.error("Delete error:", err.message || err);
    res.status(500).json({ success: false, error: "Gagal memadam data." });
  }
});

apiRouter.get("/config-check", (req, res) => {
  res.json({
    supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    googleSheets: false,
    env: process.env.NODE_ENV || 'development'
  });
});

apiRouter.post("/export/pptx", async (req, res) => {
  console.log("POST /api/export/pptx hit");
  try {
    const payload = req.body;
    if (!payload) {
      console.error("No payload received");
      return res.status(400).json({ success: false, error: "No payload received" });
    }
    const { reportTitle, generatedAt, filters, summaryCards, charts, tables, branding } = payload;
    console.log("Payload parsed, reportTitle:", reportTitle);

    const PptxGenJS = (await import("pptxgenjs")).default;
    const pptx = new (PptxGenJS as any)();
    console.log("PptxGenJS instance created");
    
    // Set Presentation Metadata & Layout
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "FPMSB TUNGGAL Intelligence Engine";
    pptx.subject = "Plantation Analytics Report";
    pptx.title = reportTitle || "Report";
    pptx.company = branding?.companyName || "FPMSB TUNGGAL";

    // 1. Title Slide
    let slide = pptx.addSlide();
    slide.background = { color: (branding?.primaryColor || "#064E3B").replace('#', '') };
    slide.addText(branding?.companyName || "FPMSB TUNGGAL", { 
      x: 0.5, y: 1.5, w: 12, h: 1, 
      fontSize: 44, bold: true, color: "FFFFFF", align: "center" 
    });
    slide.addText(reportTitle || "Laporan Analitik", { 
      x: 0.5, y: 2.5, w: 12, h: 0.5, 
      fontSize: 24, bold: true, color: "FFFFFF", align: "center" 
    });
    slide.addText(`Tempoh: ${filters?.period || "N/A"}`, { 
      x: 0.5, y: 3.5, w: 12, h: 0.5, 
      fontSize: 14, color: "FFFFFF", align: "center" 
    });
    slide.addText(`Dijana pada: ${generatedAt || new Date().toLocaleString()}`, { 
      x: 0.5, y: 4.2, w: 12, h: 0.5, 
      fontSize: 10, color: "A7F3D0", align: "center" 
    });

    // 2. Summary Slide
    if (summaryCards && summaryCards.length > 0) {
      slide = pptx.addSlide();
      slide.addText("Ringkasan Prestasi", { 
        x: 0.5, y: 0.4, w: 4, h: 0.4, 
        fontSize: 20, bold: true, color: (branding?.primaryColor || "#064E3B").replace('#', '') 
      });
      
      const rows: any[][] = [
        [
          { text: "Metrik", options: { bold: true, fill: "F1F5F9" } }, 
          { text: "Nilai", options: { bold: true, fill: "F1F5F9" } }, 
          { text: "Info Tambahan", options: { bold: true, fill: "F1F5F9" } }
        ]
      ];
      summaryCards.forEach((card: any) => {
        rows.push([card.label, card.value, card.subValue || "-"]);
      });

      slide.addTable(rows, { 
        x: 0.5, y: 1.0, w: 12, 
        border: { pt: 1, color: "E2E8F0" }, 
        fill: { color: "F8FAFC" }, 
        fontSize: 11, align: "center" 
      });
    }

    // 3. Charts Slides
    if (charts && charts.length > 0) {
      charts.forEach((chart: any) => {
        slide = pptx.addSlide();
        slide.addText(chart.title, { 
          x: 0.5, y: 0.4, w: 12, h: 0.4, 
          fontSize: 20, bold: true, color: (branding?.primaryColor || "#064E3B").replace('#', '') 
        });
        
        const chartTypeMap: any = {
          'bar': pptx.ChartType.bar,
          'line': pptx.ChartType.line,
          'pie': pptx.ChartType.pie
        };

        slide.addChart(chartTypeMap[chart.type] || pptx.ChartType.bar, chart.data, {
          x: 0.5, y: 1.0, w: 12, h: 5.5,
          ...chart.options
        });
      });
    }

    // 4. Tables Slides
    if (tables && tables.length > 0) {
      tables.forEach((table: any) => {
        slide = pptx.addSlide();
        slide.addText(table.title, { 
          x: 0.5, y: 0.4, w: 12, h: 0.4, 
          fontSize: 20, bold: true, color: (branding?.primaryColor || "#064E3B").replace('#', '') 
        });
        
        const tableRows = [
          table.headers.map((h: string) => ({ 
            text: h, 
            options: { fill: (branding?.primaryColor || "#064E3B").replace('#', ''), color: "FFFFFF", bold: true } 
          })),
          ...table.rows
        ];

        slide.addTable(tableRows, { 
          x: 0.5, y: 1.0, w: 12, 
          fontSize: 10, align: "center", 
          border: { pt: 1, color: "E2E8F0" } 
        });
      });
    }

    console.log("Generating buffer...");
    const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
    console.log("Buffer generated, size:", buffer.length);
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename=Laporan_${(filters?.period || "Export").replace(/ /g, '_')}.pptx`);
    res.send(buffer);
    console.log("Response sent");

  } catch (err: any) {
    console.error("PPTX Generation Error:", err);
    res.status(500).json({ success: false, error: "Gagal menjana PowerPoint." });
  }
});

// --- FERTILIZER (BAJA) MODULE ROUTES ---

apiRouter.get("/fertilizer/master", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_master_schedule')
      .select('*')
      .order('blok_code', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/fertilizer/master/batch", async (req, res) => {
  try {
    const { data } = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { error } = await supabase
      .from('fertilizer_master_schedule')
      .upsert(data, { onConflict: 'blok_code' });

    if (error) throw error;
    res.json({ success: true, count: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/fertilizer/entries", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_daily_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/fertilizer/entries", async (req, res) => {
  try {
    const payload = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data: insertedData, error } = await supabase
      .from('fertilizer_daily_entries')
      .insert([payload])
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: "Data untuk tarikh, blok dan PUS ini sudah wujud." });
      }
      throw error;
    }

    // --- AUTOMATIC INVENTORY DEDUCTION ---
    if (payload.fertilizer_type && payload.total_beg_completed > 0) {
      try {
        // Find the fertilizer by name
        const { data: invItem, error: invError } = await supabase
          .from('fertilizer_inventory')
          .select('id, quantity')
          .eq('name', payload.fertilizer_type)
          .single();

        if (invItem && !invError) {
          const kgValue = payload.total_beg_completed * 50;
          const newQuantity = invItem.quantity - kgValue;

          // 1. Log transaction
          await supabase
            .from('fertilizer_inventory_transactions')
            .insert([{
              inventory_id: invItem.id,
              type: 'OUT',
              quantity: kgValue,
              reference: `Auto-deduct: Blok ${payload.blok_code} (Entry ID: ${insertedData[0].id})`,
              created_at: new Date().toISOString()
            }]);

          // 2. Update inventory
          await supabase
            .from('fertilizer_inventory')
            .update({ 
              quantity: newQuantity, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', invItem.id);
            
          console.log(`Auto-deducted ${kgValue}kg for ${payload.fertilizer_type} (Inventory ID: ${invItem.id})`);
        }
      } catch (deductErr) {
        console.error("Failed to auto-deduct inventory:", deductErr);
        // We don't fail the whole request because the primary record was saved
      }
    }

    res.json({ success: true, data: insertedData[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put("/fertilizer/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    // --- AUTOMATIC INVENTORY ADJUSTMENT ---
    try {
      // 1. Get the old record
      const { data: oldEntry, error: oldFetchError } = await supabase
        .from('fertilizer_daily_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (oldEntry && !oldFetchError) {
        // We only adjust if fertilizer type or amount changed
        const newTotalBeg = payload.total_beg_completed !== undefined ? payload.total_beg_completed : oldEntry.total_beg_completed;
        const newType = payload.fertilizer_type || oldEntry.fertilizer_type;

        if (newType !== oldEntry.fertilizer_type) {
          // Complex case: fertilizer type changed. Refund old, deduct new.
          // Refund old
          if (oldEntry.fertilizer_type && oldEntry.total_beg_completed > 0) {
            const { data: oldInv } = await supabase.from('fertilizer_inventory').select('id, quantity').eq('name', oldEntry.fertilizer_type).single();
            if (oldInv) {
              const refundKg = oldEntry.total_beg_completed * 50;
              await supabase.from('fertilizer_inventory_transactions').insert([{ inventory_id: oldInv.id, type: 'IN', quantity: refundKg, reference: `Adjustment (Type Changed): Refund Entry ID ${id}`, created_at: new Date().toISOString() }]);
              await supabase.from('fertilizer_inventory').update({ quantity: oldInv.quantity + refundKg, updated_at: new Date().toISOString() }).eq('id', oldInv.id);
            }
          }
          // Deduct new
          if (newType && newTotalBeg > 0) {
            const { data: newInv } = await supabase.from('fertilizer_inventory').select('id, quantity').eq('name', newType).single();
            if (newInv) {
              const deductKg = newTotalBeg * 50;
              await supabase.from('fertilizer_inventory_transactions').insert([{ inventory_id: newInv.id, type: 'OUT', quantity: deductKg, reference: `Adjustment (Type Changed): Deduct Entry ID ${id}`, created_at: new Date().toISOString() }]);
              await supabase.from('fertilizer_inventory').update({ quantity: newInv.quantity - deductKg, updated_at: new Date().toISOString() }).eq('id', newInv.id);
            }
          }
        } else if (newTotalBeg !== oldEntry.total_beg_completed) {
          // Simple case: same type, different amount
          if (newType && newTotalBeg !== undefined) {
            const { data: invItem } = await supabase.from('fertilizer_inventory').select('id, quantity').eq('name', newType).single();
            if (invItem) {
              const oldKg = oldEntry.total_beg_completed * 50;
              const newKg = newTotalBeg * 50;
              const diffKg = newKg - oldKg;

              if (diffKg !== 0) {
                await supabase.from('fertilizer_inventory_transactions').insert([{
                  inventory_id: invItem.id,
                  type: diffKg > 0 ? 'OUT' : 'IN',
                  quantity: Math.abs(diffKg),
                  reference: `Adjustment: Entry ID ${id} (Beg change: ${oldEntry.total_beg_completed} -> ${newTotalBeg})`,
                  created_at: new Date().toISOString()
                }]);
                await supabase.from('fertilizer_inventory').update({ quantity: invItem.quantity - diffKg, updated_at: new Date().toISOString() }).eq('id', invItem.id);
              }
            }
          }
        }
      }
    } catch (adjustErr) {
      console.error("Failed to adjust inventory on update:", adjustErr);
    }

    const { data, error } = await supabase
      .from('fertilizer_daily_entries')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete("/fertilizer/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete fertilizer entry with id: ${id}`);
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    // --- AUTOMATIC INVENTORY REFUND ---
    try {
      // 1. Get the entry details before deleting
      const { data: entry, error: fetchError } = await supabase
        .from('fertilizer_daily_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (entry && !fetchError && entry.fertilizer_type && entry.total_beg_completed > 0) {
        // 2. Find the fertilizer in inventory
        const { data: invItem, error: invError } = await supabase
          .from('fertilizer_inventory')
          .select('id, quantity')
          .eq('name', entry.fertilizer_type)
          .single();

        if (invItem && !invError) {
          const kgValue = entry.total_beg_completed * 50;
          const newQuantity = invItem.quantity + kgValue;

          // 3. Log transaction (as "IN" or "REFUND")
          await supabase
            .from('fertilizer_inventory_transactions')
            .insert([{
              inventory_id: invItem.id,
              type: 'IN', // Refund counts as adding back
              quantity: kgValue,
              reference: `Refund: Deleted Entry ID ${id}`,
              created_at: new Date().toISOString()
            }]);

          // 4. Update inventory
          await supabase
            .from('fertilizer_inventory')
            .update({ 
              quantity: newQuantity, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', invItem.id);
            
          console.log(`Refunded ${kgValue}kg for ${entry.fertilizer_type} due to deletion of entry ${id}`);
        }
      }
    } catch (refundErr) {
      console.error("Failed to refund inventory on deletion:", refundErr);
    }

    const { error } = await supabase
      .from('fertilizer_daily_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/fertilizer/entries/batch", async (req, res) => {
  try {
    const { data } = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { error } = await supabase
      .from('fertilizer_daily_entries')
      .upsert(data, { onConflict: 'entry_date,blok_code,pus' });

    if (error) throw error;
    res.json({ success: true, count: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- FERTILIZER INVENTORY ROUTES ---

apiRouter.get("/fertilizer/inventory", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/fertilizer/inventory", async (req, res) => {
  try {
    const payload = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_inventory')
      .insert([payload])
      .select();

    if (error) throw error;

    if (payload.quantity > 0 && data && data[0]) {
      await supabase
        .from('fertilizer_inventory_transactions')
        .insert([{
          inventory_id: data[0].id,
          type: 'IN',
          quantity: payload.quantity,
          reference: 'Initial Stock',
          created_at: new Date().toISOString()
        }]);
    }

    res.json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/fertilizer/inventory/transactions", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_inventory_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/fertilizer/inventory/:id/transaction", async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reference } = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    // 1. Start a transaction by doing operations in sequence (Supabase doesn't have multi-table transactions in plain JS SDK easily)
    // First, log the transaction
    const { error: logError } = await supabase
      .from('fertilizer_inventory_transactions')
      .insert([{
        inventory_id: id,
        type,
        quantity,
        reference,
        created_at: new Date().toISOString()
      }]);

    if (logError) throw logError;

    // Second, update the inventory level
    const { data: inv, error: fetchError } = await supabase
      .from('fertilizer_inventory')
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newQuantity = type === 'IN' ? inv.quantity + quantity : inv.quantity - quantity;

    const { error: updateError } = await supabase
      .from('fertilizer_inventory')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({ success: true, newQuantity });
  } catch (err: any) {
    console.error("Inventory transaction error:", err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete("/fertilizer/inventory/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    // 1. Get transaction
    const { data: trans, error: fetchError } = await supabase
      .from('fertilizer_inventory_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !trans) throw fetchError || new Error("Transaction not found");

    // 2. Get inventory
    const { data: inv, error: invError } = await supabase
      .from('fertilizer_inventory')
      .select('id, quantity')
      .eq('id', trans.inventory_id)
      .single();

    if (invError || !inv) throw invError || new Error("Inventory not found");

    // 3. Rollback quantity
    const revertedQuantity = trans.type === 'IN' ? inv.quantity - trans.quantity : inv.quantity + trans.quantity;

    // 4. Perform updates
    const { error: updateError } = await supabase.from('fertilizer_inventory').update({ quantity: revertedQuantity, updated_at: new Date().toISOString() }).eq('id', inv.id);
    if (updateError) throw updateError;
    
    const { error: deleteError } = await supabase.from('fertilizer_inventory_transactions').delete().eq('id', id);
    if (deleteError) throw deleteError;

    res.json({ success: true, newQuantity: revertedQuantity });
  } catch (err: any) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- PRUNING MODULE ROUTES ---

apiRouter.get("/pruning", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('hantaran_pruning')
      .select('*')
      .order('blok', { ascending: true });

    if (error) {
      if (error.code === '42P01') return res.json([]); // Table doesn't exist yet
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/pruning/batch", async (req, res) => {
  try {
    const { data } = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { error } = await supabase
      .from('hantaran_pruning')
      .upsert(data, { onConflict: 'blok' });

    if (error) throw error;
    res.json({ success: true, count: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/pruning", async (req, res) => {
  try {
    const payload = req.body;
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('hantaran_pruning')
      .upsert([payload], { onConflict: 'blok' })
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- MERUMPUT MODULE ENDPOINTS ---

apiRouter.get("/merumput/progress", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.json(getLocalMerumputProgress());
    }

    const { data, error } = await supabase
      .from('merumput_progress')
      .select('*')
      .order('blok', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return res.json(getLocalMerumputProgress());
      }
      throw error;
    }

    if (!data || data.length < 92) {
      console.log(`Supabase table 'merumput_progress' has incomplete data (${data?.length || 0}/92). Auto-seeding database directly from local...`);
      const localData = getLocalMerumputProgress();
      
      const allowedKeys = ['id', 'blok', 'luas', 'pusingan', 'jenis', 'tarikh_mula', 'tarikh_siap', 'hek_siap', 'workers_count', 'created_at', 'updated_at'];
      const processed = localData.map((item: any) => {
        const record: any = {};
        allowedKeys.forEach(k => {
          if (item[k] !== undefined) record[k] = item[k];
        });
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(record.id));
        if (record.id && !isUUID) {
          delete record.id;
        }
        if (!record.tarikh_mula) record.tarikh_mula = "2026-05-01";
        return record;
      });

      const { data: seededData, error: seedError } = await supabase
        .from('merumput_progress')
        .upsert(processed, { onConflict: 'blok,pusingan,jenis' })
        .select()
        .order('blok', { ascending: true });

      if (seedError) {
        console.error("Failed to auto-seed Supabase:", seedError);
        return res.json(localData);
      }
      
      return res.json(seededData);
    }

    // Always keep the local backup in complete sync with the latest database state
    let finalData = data;
    let isMigrated = false;
    const updatedData = data.map((item: any) => {
      if (item.blok === "LF" && item.pusingan === 1 && item.jenis === "BULATAN & LORONG" && item.tarikh_mula === "2026-02-05") {
        isMigrated = true;
        return {
          ...item,
          tarikh_mula: "2026-01-10",
          tarikh_siap: "2026-01-10"
        };
      }
      return item;
    });

    if (isMigrated) {
      console.log("Migrating Supabase record of LF to 2026-01-10...");
      supabase
        .from('merumput_progress')
        .update({ tarikh_mula: "2026-01-10", tarikh_siap: "2026-01-10" })
        .eq('blok', 'LF')
        .eq('pusingan', 1)
        .eq('jenis', 'BULATAN & LORONG')
        .then(({ error: upError }: any) => {
          if (upError) console.error("Failed to migrate LF in Supabase:", upError);
          else console.log("Successfully migrated LF in Supabase.");
        });
      finalData = updatedData;
    }

    saveLocalMerumputProgress(finalData);
    res.json(finalData);
  } catch (err: any) {
    if (!isMissingTableError(err)) {
      console.warn("Supabase fetch merumput progress failed:", err.message);
    }
    res.json(getLocalMerumputProgress());
  }
});

apiRouter.post("/merumput/progress/batch", async (req, res) => {
  try {
    const { data } = req.body;
    const supabase = getSupabase();
    
    // Always save local fallback
    saveLocalMerumputProgress(data);

    if (!supabase) {
      return res.json({ success: true, count: data.length });
    }

    // Step 1: Fetch all existing progress records to match their IDs
    const { data: existing, error: fetchError } = await supabase
      .from('merumput_progress')
      .select('id, blok, pusingan, jenis');

    if (fetchError) {
      if (isMissingTableError(fetchError)) {
        return res.json({ success: true, count: data.length });
      }
      throw fetchError;
    }

    // Step 2: Map incoming progress records to their genuine primary key IDs (if exists) and sanitize properties
    const allowedKeys = ['id', 'blok', 'luas', 'pusingan', 'jenis', 'tarikh_mula', 'tarikh_siap', 'hek_siap', 'workers_count', 'created_at', 'updated_at'];
    const processedData = data.map((item: any) => {
      const match = existing?.find((e: any) => 
        String(e.blok) === String(item.blok) &&
        Number(e.pusingan) === Number(item.pusingan) &&
        String(e.jenis).trim().toUpperCase() === String(item.jenis).trim().toUpperCase()
      );
      
      const record: any = {};
      
      // Copy only allowed schema columns to avoid "column does not exist" database errors
      allowedKeys.forEach(k => {
        if (item[k] !== undefined) {
          record[k] = item[k];
        }
      });

      if (match) {
        record.id = match.id;
      } else if (!record.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(record.id))) {
        delete record.id; // supabase generates new uuid
      }

      // Safe date coercion for PostgreSQL Date column requirements
      if (!record.tarikh_mula || record.tarikh_mula === "") {
        record.tarikh_mula = "2026-05-01";
      }
      if (!record.tarikh_siap || record.tarikh_siap === "") {
        record.tarikh_siap = null;
      }

      return record;
    });

    // Step 3: Upsert matching on UNIQUE constraint (blok, pusingan, jenis) which is guaranteed to succeed
    const { error } = await supabase
      .from('merumput_progress')
      .upsert(processedData, { onConflict: 'blok,pusingan,jenis' });

    if (error) {
      if (isMissingTableError(error)) {
        return res.json({ success: true, count: data.length });
      }
      throw error;
    }
    res.json({ success: true, count: data.length });
  } catch (err: any) {
    if (!isMissingTableError(err)) {
      console.warn("Supabase batch progress merumput failed, fallback to local cache:", err.message);
    }
    res.json({ success: true, count: req.body?.data?.length || 0 });
  }
});

apiRouter.post("/merumput/progress", async (req, res) => {
  try {
    const payload = req.body;
    const supabase = getSupabase();
    
    // Check if this is a direct editor edit (has id)
    const isEdit = !!payload.id && !String(payload.id).startsWith('loc-temp');

    // Always perform accumulation and save on local storage block FIRST.
    // This maintains perfect local safety and consistency.
    const local = getLocalMerumputProgress();
    const existingIdx = local.findIndex((p: any) => 
      p.blok === payload.blok && 
      Number(p.pusingan) === Number(payload.pusingan) && 
      p.jenis === payload.jenis
    );
    const existingRec = existingIdx !== -1 ? local[existingIdx] : null;
    
    let finalPayload = { ...payload };
    if (existingRec && !isEdit) {
      // Accumulate hektar siap and worker counts
      const existingHek = Number(existingRec.hek_siap || 0);
      const existingWorkers = Number(existingRec.workers_count || 0);
      const targetLuas = Number(payload.luas || existingRec.luas || 0);
      
      finalPayload.hek_siap = Math.min(targetLuas, existingHek + Number(payload.hek_siap || 0));
      finalPayload.workers_count = existingWorkers + Number(payload.workers_count || 0);
      
      if (finalPayload.hek_siap >= targetLuas * 0.999) {
        finalPayload.tarikh_siap = payload.tarikh_mula || new Date().toISOString().split('T')[0];
      } else {
        finalPayload.tarikh_siap = null;
      }
      
      // Keep the earlier start date if it already started
      if (existingHek > 0 && existingRec.tarikh_mula && existingRec.tarikh_mula !== "2026-05-01") {
        finalPayload.tarikh_mula = existingRec.tarikh_mula;
      }
    }

    const recordLoc = { 
      ...existingRec, 
      ...finalPayload, 
      id: existingRec?.id || payload.id || `loc-${Date.now()}`, 
      created_at: existingRec?.created_at || new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    };

    if (existingIdx !== -1) {
      local[existingIdx] = recordLoc;
    } else {
      local.push(recordLoc);
    }
    saveLocalMerumputProgress(local);

    if (!supabase) {
      return res.json({ success: true, data: recordLoc });
    }

    // Step 1: Find if there's an existing record in the database for matching (blok, pusingan, jenis)
    const { data: existing, error: fetchError } = await supabase
      .from('merumput_progress')
      .select('*')
      .eq('blok', String(payload.blok))
      .eq('pusingan', Number(payload.pusingan))
      .eq('jenis', String(payload.jenis))
      .maybeSingle();

    if (fetchError && !isMissingTableError(fetchError)) {
      throw fetchError;
    }

    const allowedKeys = ['id', 'blok', 'luas', 'pusingan', 'jenis', 'tarikh_mula', 'tarikh_siap', 'hek_siap', 'workers_count', 'created_at', 'updated_at'];
    const record: any = {};
    
    // Copy the correct accumulated values from recordLoc
    allowedKeys.forEach(k => {
      if (recordLoc[k] !== undefined) {
        record[k] = recordLoc[k];
      }
    });

    if (existing) {
      record.id = existing.id;
    } else {
      delete record.id;
    }

    // Safe date coercion for PostgreSQL Date column requirements
    if (!record.tarikh_mula || record.tarikh_mula === "") {
      record.tarikh_mula = "2026-05-01";
    }
    if (!record.tarikh_siap || record.tarikh_siap === "") {
      record.tarikh_siap = null;
    }

    // Step 2: Upsert matching on UNIQUE constraint (blok, pusingan, jenis) which is guaranteed to succeed
    const { data, error } = await supabase
      .from('merumput_progress')
      .upsert([record], { onConflict: 'blok,pusingan,jenis' })
      .select();

    if (error) {
      if (isMissingTableError(error)) {
        // Table doesn't exist anymore, but we successfully saved locally, so continue safely!
        return res.json({ success: true, data: recordLoc });
      }
      throw error;
    }
    res.json({ success: true, data: data[0] });
  } catch (err: any) {
    if (!isMissingTableError(err)) {
      console.warn("Supabase upsert progress merumput failed, fallback to local:", err.message);
    }
    // We already saved to local file successfully above, so return the local state!
    const local = getLocalMerumputProgress();
    const match = local.find((p: any) => p.blok === req.body.blok && Number(p.pusingan) === Number(req.body.pusingan) && p.jenis === req.body.jenis);
    res.json({ success: true, data: match || req.body });
  }
});

// --- MERUMPUT INVENTORY ROUTES ---

apiRouter.get("/merumput/inventory", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.json(getLocalMerumputInventory());
    }

    const { data, error } = await supabase
      .from('merumput_inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return res.json(getLocalMerumputInventory());
      }
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    if (!isMissingTableError(err)) {
      console.warn("Supabase fetch merumput inventory failed, using local:", err.message);
    }
    res.json(getLocalMerumputInventory());
  }
});

apiRouter.post("/merumput/inventory", async (req, res) => {
  try {
    const item = req.body;
    const supabase = getSupabase();
    if (!supabase) {
      const local = getLocalMerumputInventory();
      const existingIdx = local.findIndex((p: any) => p.name.toLowerCase() === item.name.toLowerCase());
      const record = { ...item, id: item.id || `inv-${Date.now()}`, quantity: parseFloat(item.quantity) || 0, min_threshold: parseFloat(item.min_threshold) || 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      
      if (existingIdx !== -1) {
        local[existingIdx] = { ...local[existingIdx], ...record };
      } else {
        local.push(record);
        // add a seeding transaction
        const transactions = getLocalMerumputTransactions();
        transactions.unshift({
          id: `tx-${Date.now()}`,
          inventory_id: record.id,
          type: 'IN',
          quantity: record.quantity,
          reference: 'Stok Awal (Sistem Fallback)',
          created_at: new Date().toISOString()
        });
        saveLocalMerumputTransactions(transactions);
      }
      saveLocalMerumputInventory(local);
      return res.json({ success: true, data: record });
    }

    const { data, error } = await supabase
      .from('merumput_inventory')
      .insert([item])
      .select();

    if (error) {
      if (isMissingTableError(error)) {
        const local = getLocalMerumputInventory();
        const existingIdx = local.findIndex((p: any) => p.name.toLowerCase() === item.name.toLowerCase());
        const record = { ...item, id: item.id || `inv-${Date.now()}`, quantity: parseFloat(item.quantity) || 0, min_threshold: parseFloat(item.min_threshold) || 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        
        if (existingIdx !== -1) {
          local[existingIdx] = { ...local[existingIdx], ...record };
        } else {
          local.push(record);
        }
        saveLocalMerumputInventory(local);
        return res.json({ success: true, data: record });
      }
      throw error;
    }

    if (data && data[0] && parseFloat(item.quantity) > 0) {
      await supabase
        .from('merumput_inventory_transactions')
        .insert([{
          inventory_id: data[0].id,
          type: 'IN',
          quantity: parseFloat(item.quantity),
          reference: 'Stok Awal',
          created_at: new Date().toISOString()
        }]);
    }

    res.json({ success: true, data: data[0] });
  } catch (err: any) {
    if (!isMissingTableError(err)) {
      console.warn("Supabase create merumput item failed, using local:", err.message);
    }
    try {
      const item = req.body;
      const local = getLocalMerumputInventory();
      const existingIdx = local.findIndex((p: any) => p.name.toLowerCase() === item.name.toLowerCase());
      const record = { ...item, id: item.id || `inv-${Date.now()}`, quantity: parseFloat(item.quantity) || 0, min_threshold: parseFloat(item.min_threshold) || 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      
      if (existingIdx !== -1) {
        local[existingIdx] = { ...local[existingIdx], ...record };
      } else {
        local.push(record);
      }
      saveLocalMerumputInventory(local);
      res.json({ success: true, data: record });
    } catch (e: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

apiRouter.get("/merumput/inventory/transactions", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.json(getLocalMerumputTransactions());
    }

    const { data, error } = await supabase
      .from('merumput_inventory_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return res.json(getLocalMerumputTransactions());
      }
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    if (!isMissingTableError(err)) {
      console.warn("Supabase fetch merumput transactions failed:", err.message);
    }
    res.json(getLocalMerumputTransactions());
  }
});

apiRouter.post("/merumput/inventory/:id/transaction", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const supabase = getSupabase();

    if (!supabase) {
      const localInv = getLocalMerumputInventory();
      const invItem = localInv.find((p: any) => p.id === id);
      if (!invItem) return res.status(404).json({ error: "Chemical not found" });

      const tx = {
        id: `tx-${Date.now()}`,
        inventory_id: id,
        type: payload.type,
        quantity: parseFloat(payload.quantity),
        reference: payload.reference || 'Manual Transaction (Fallback)',
        created_at: new Date().toISOString()
      };

      const transactions = getLocalMerumputTransactions();
      transactions.unshift(tx);
      saveLocalMerumputTransactions(transactions);

      const qty = parseFloat(payload.quantity);
      if (payload.type === 'IN') {
        invItem.quantity = (parseFloat(invItem.quantity) || 0) + qty;
      } else {
        invItem.quantity = (parseFloat(invItem.quantity) || 0) - qty;
      }
      invItem.updated_at = new Date().toISOString();
      saveLocalMerumputInventory(localInv);

      return res.json({ success: true, transaction: tx, newQuantity: invItem.quantity });
    }

    const { data: txData, error: txError } = await supabase
      .from('merumput_inventory_transactions')
      .insert([{
        inventory_id: id,
        type: payload.type,
        quantity: parseFloat(payload.quantity),
        reference: payload.reference,
        created_at: new Date().toISOString()
      }])
      .select();

    if (txError) throw txError;

    const { data: invItem, error: invError } = await supabase
      .from('merumput_inventory')
      .select('quantity')
      .eq('id', id)
      .single();

    if (invError) throw invError;

    const diff = parseFloat(payload.quantity);
    const newQty = payload.type === 'IN'
      ? (parseFloat(invItem.quantity) || 0) + diff
      : (parseFloat(invItem.quantity) || 0) - diff;

    await supabase
      .from('merumput_inventory')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', id);

    res.json({ success: true, transaction: txData[0], newQuantity: newQty });
  } catch (err: any) {
    if (!isMissingTableError(err)) {
      console.warn("Supabase transaction failed, fallback to local:", err.message);
    }
    try {
      const { id } = req.params;
      const payload = req.body;
      const localInv = getLocalMerumputInventory();
      const invItem = localInv.find((p: any) => p.id === id);
      if (!invItem) return res.status(404).json({ error: "Chemical not found" });

      const tx = {
        id: `tx-${Date.now()}`,
        inventory_id: id,
        type: payload.type,
        quantity: parseFloat(payload.quantity),
        reference: payload.reference || 'Manual Transaction (Fallback)',
        created_at: new Date().toISOString()
      };

      const transactions = getLocalMerumputTransactions();
      transactions.unshift(tx);
      saveLocalMerumputTransactions(transactions);

      const qty = parseFloat(payload.quantity);
      if (payload.type === 'IN') {
        invItem.quantity = (parseFloat(invItem.quantity) || 0) + qty;
      } else {
        invItem.quantity = (parseFloat(invItem.quantity) || 0) - qty;
      }
      invItem.updated_at = new Date().toISOString();
      saveLocalMerumputInventory(localInv);

      res.json({ success: true, transaction: tx, newQuantity: invItem.quantity });
    } catch (e: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

apiRouter.delete("/merumput/inventory/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    if (!supabase) {
      const transactions = getLocalMerumputTransactions();
      const txIdx = transactions.findIndex((t: any) => t.id === id);
      if (txIdx === -1) return res.status(404).json({ error: "Transaction not found" });

      const tx = transactions[txIdx];
      const localInv = getLocalMerumputInventory();
      const invItem = localInv.find((i: any) => i.id === tx.inventory_id);

      if (invItem) {
        const qty = parseFloat(tx.quantity);
        if (tx.type === 'IN') {
          invItem.quantity = (parseFloat(invItem.quantity) || 0) - qty;
        } else {
          invItem.quantity = (parseFloat(invItem.quantity) || 0) + qty;
        }
        invItem.updated_at = new Date().toISOString();
        saveLocalMerumputInventory(localInv);
      }

      transactions.splice(txIdx, 1);
      saveLocalMerumputTransactions(transactions);

      return res.json({ success: true, newQuantity: invItem ? invItem.quantity : 0 });
    }

    const { data: tx, error: txError } = await supabase
      .from('merumput_inventory_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (txError) throw txError;

    const { data: inv, error: invError } = await supabase
      .from('merumput_inventory')
      .select('quantity')
      .eq('id', tx.inventory_id)
      .single();

    if (invError) throw invError;

    const qty = parseFloat(tx.quantity);
    const revertedQty = tx.type === 'IN'
      ? (parseFloat(inv.quantity) || 0) - qty
      : (parseFloat(inv.quantity) || 0) + qty;

    await supabase.from('merumput_inventory').update({ quantity: revertedQty, updated_at: new Date().toISOString() }).eq('id', inv.id);
    await supabase.from('merumput_inventory_transactions').delete().eq('id', id);

    res.json({ success: true, newQuantity: revertedQty });
  } catch (err: any) {
    if (!isMissingTableError(err)) {
      console.warn("Supabase transaction delete failed, fallback to local:", err.message);
    }
    try {
      const { id } = req.params;
      const transactions = getLocalMerumputTransactions();
      const txIdx = transactions.findIndex((t: any) => t.id === id);
      if (txIdx === -1) return res.status(404).json({ error: "Transaction not found" });

      const tx = transactions[txIdx];
      const localInv = getLocalMerumputInventory();
      const invItem = localInv.find((i: any) => i.id === tx.inventory_id);

      if (invItem) {
        const qty = parseFloat(tx.quantity);
        if (tx.type === 'IN') {
          invItem.quantity = (parseFloat(invItem.quantity) || 0) - qty;
        } else {
          invItem.quantity = (parseFloat(invItem.quantity) || 0) + qty;
        }
        invItem.updated_at = new Date().toISOString();
        saveLocalMerumputInventory(localInv);
      }

      transactions.splice(txIdx, 1);
      saveLocalMerumputTransactions(transactions);

      res.json({ success: true, newQuantity: invItem ? invItem.quantity : 0 });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
});


app.use('/api', apiRouter);
app.use('/', apiRouter);

apiRouter.get("/debug-db", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('hantaran_hasil')
        .select('id, no_resit, tarikh, masa_masuk, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      res.json({ data, error });
    } else {
      res.json({ error: "No Supabase" });
    }
  } catch (err: any) {
    res.json({ error: err.message });
  }
});

// Catch-all to prevent timeouts
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found: ' + req.url, path: req.path });
});

export default app;
