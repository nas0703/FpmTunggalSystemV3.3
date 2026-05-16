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

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create .data directory, falling back to /tmp");
  DATA_DIR = '/tmp';
  HANTARAN_DB_FILE = path.join(DATA_DIR, 'hantaran.json');
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

// Initialize Supabase client lazily to pick up runtime environment variables
let supabaseClient: any = null;

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
    const supabase = getSupabase();
    if (supabase) {
      const { data: records, error } = await supabase
        .from('hantaran_hasil')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) {
        console.error("Supabase Fetch Error:", error);
        return res.status(500).json({ error: "Gagal mengambil data dari pangkalan data." });
      }
      console.log(`Fetched ${records?.length || 0} records from hantaran_hasil`);
      res.json(records);
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
      res.json({ success: true });
    } else {
      saveLocalHantaran([]);
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
      res.json({ success: true, ref: no_resit });
    } else {
      const localData = getLocalHantaran();
      const updatedData = localData.map((r: any) => 
        r.no_resit === no_resit.toUpperCase() ? { ...r, ...payload } : r
      );
      saveLocalHantaran(updatedData);
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
      res.json({ success: true });
    } else {
      const localData = getLocalHantaran();
      const updatedData = localData.filter((r: any) => r.no_resit !== no_resit.toUpperCase());
      saveLocalHantaran(updatedData);
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


app.use('/', apiRouter);
app.use('/api', apiRouter);

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
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found: ' + req.url, path: req.path });
});

export default app;
