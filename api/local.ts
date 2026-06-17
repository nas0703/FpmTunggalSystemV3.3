import fs from 'fs';
import path from 'path';

function getUUID(): string {
  // Pure JavaScript UUID v4 generator (no crypto dependency to prevent Vercel crashes)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let DATA_DIR = path.join(process.cwd(), 'data');

if (process.env.VERCEL || process.env.NOW_REGION) {
  DATA_DIR = '/tmp'; // Use /tmp for serverless environments
}

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create local data directory, running in-memory or readonly fallback:", err);
}

let HANTARAN_FILE = path.join(DATA_DIR, 'hantaran.json');
let MERUMPUT_PROGRESS_FILE = path.join(DATA_DIR, 'merumput_progress.json');
let MERUMPUT_INVENTORY_FILE = path.join(DATA_DIR, 'merumput_inventory.json');
let MERUMPUT_TRANSACTIONS_FILE = path.join(DATA_DIR, 'merumput_transactions.json');

// Re-assign for Vercel just in case
if (process.env.VERCEL) {
  HANTARAN_FILE = path.join(DATA_DIR, 'hantaran.json');
  MERUMPUT_PROGRESS_FILE = path.join(DATA_DIR, 'merumput_progress.json');
  MERUMPUT_INVENTORY_FILE = path.join(DATA_DIR, 'merumput_inventory.json');
  MERUMPUT_TRANSACTIONS_FILE = path.join(DATA_DIR, 'merumput_transactions.json');
}

export function getLocalHantaran() {
  if (fs.existsSync(HANTARAN_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HANTARAN_FILE, 'utf-8'));
    } catch (e) {
      console.error("Error reading hantaran file", e);
    }
  }
  return [];
}

export function saveLocalHantaran(data: any[]) {
  try {
    fs.writeFileSync(HANTARAN_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing hantaran file", e);
  }
}

export function getInitialSeedData() {
  const seed: any[] = [];
  const bloks = Array.from({ length: 22 }, (_, i) => String(i + 1));
  bloks.push("LF");

  bloks.forEach(blok => {
    const luas = blok === "LF" ? 173.1 : 20.0;
    
    // PUS 1
    seed.push({ id: getUUID(), blok, luas, pusingan: 1, jenis: "BULATAN & LORONG", tarikh_mula: "2026-05-01", tarikh_siap: null, hek_siap: 0, workers_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    seed.push({ id: getUUID(), blok, luas, pusingan: 1, jenis: "L. ANGIN / GAJAH / SEMPADAN", tarikh_mula: "2026-05-01", tarikh_siap: null, hek_siap: 0, workers_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });

    // PUS 2
    seed.push({ id: getUUID(), blok, luas, pusingan: 2, jenis: "BULATAN & LORONG", tarikh_mula: "2026-08-01", tarikh_siap: null, hek_siap: 0, workers_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    seed.push({ id: getUUID(), blok, luas, pusingan: 2, jenis: "L. ANGIN / GAJAH / SEMPADAN", tarikh_mula: "2026-08-01", tarikh_siap: null, hek_siap: 0, workers_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  });
  return seed;
}

export function getLocalMerumputProgress() {
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
      console.error("Error reading merumput data", e);
    }
  }
  
  const initial = getInitialSeedData();
  saveLocalMerumputProgress(initial);
  return initial;
}

export function saveLocalMerumputProgress(data: any[]) {
  try {
    fs.writeFileSync(MERUMPUT_PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing merumput data", e);
  }
}

export function getLocalMerumputInventory() {
  if (fs.existsSync(MERUMPUT_INVENTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MERUMPUT_INVENTORY_FILE, 'utf-8'));
    } catch (e) {
      console.error("Error reading merumput inventory", e);
    }
  }
  const defaultInv = [
    { id: getUUID(), name: "GLYPHOSATE 41%", quantity: 0, unit: "LITER", type: "RACUN" },
    { id: getUUID(), name: "METSULFURON", quantity: 0, unit: "KG", type: "RACUN" }
  ];
  saveLocalMerumputInventory(defaultInv);
  return defaultInv;
}

export function saveLocalMerumputInventory(data: any[]) {
  try {
    fs.writeFileSync(MERUMPUT_INVENTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing merumput inventory", e);
  }
}

export function getLocalMerumputTransactions() {
  if (fs.existsSync(MERUMPUT_TRANSACTIONS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MERUMPUT_TRANSACTIONS_FILE, 'utf-8'));
    } catch (e) {
      console.error("Error reading merumput transactions", e);
    }
  }
  return [];
}

export function saveLocalMerumputTransactions(data: any[]) {
  try {
    fs.writeFileSync(MERUMPUT_TRANSACTIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing merumput transactions", e);
  }
}
