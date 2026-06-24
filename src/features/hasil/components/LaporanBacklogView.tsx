import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, ClipboardCheck, Edit3, Calendar, Search, 
  Trash2, Plus, Info, Check, X, AlertCircle, Share2, Printer, MessageCircle
} from 'lucide-react';
import { MASTER_DATA, ABW_DATA, MONTHLY_TARGETS_2026 } from '../../../utils/constants';

interface BacklogRecord {
  pus1_mula: string;
  pus1_tamat: string;
  pus2_mula: string;
  pus2_tamat: string;
  hektar_siap: number;
  capai_tandan: number;
  backlog_diladang: number;
  catatan: string;
  bil_buruh?: number;
  tandan_harian?: number;
  custom_abw?: number;
  pus1_mula_default?: string;
  pus1_tamat_default?: string;
}

interface BlockConfig {
  id: string;
  label: string;
  group: 'ADIB' | 'ARIL' | 'KIROMIN' | 'wan' | 'FELDA';
  defaultBuruh: number;
  defaultHektar: number;
  defaultTandanHarian: number;
  defaultAbw: number;
}

// Fixed block structure as shown in the user's reference image
const BLOCKS_CONFIG: BlockConfig[] = [
  // ADIB Group
  { id: "1", label: "1", group: "ADIB", defaultBuruh: 3, defaultHektar: 72.15, defaultTandanHarian: 219, defaultAbw: 23.00 },
  { id: "2", label: "2", group: "ADIB", defaultBuruh: 3, defaultHektar: 68.37, defaultTandanHarian: 360, defaultAbw: 23.01 },
  { id: "3", label: "3", group: "ADIB", defaultBuruh: 3, defaultHektar: 76.59, defaultTandanHarian: 330, defaultAbw: 23.00 },
  { id: "5", label: "5", group: "ADIB", defaultBuruh: 0, defaultHektar: 60.19, defaultTandanHarian: 198, defaultAbw: 23.00 },
  { id: "6", label: "6", group: "ADIB", defaultBuruh: 3, defaultHektar: 80.42, defaultTandanHarian: 230, defaultAbw: 24.97 },
  { id: "7", label: "7", group: "ADIB", defaultBuruh: 4, defaultHektar: 89.46, defaultTandanHarian: 250, defaultAbw: 22.98 },
  
  // ARIL Group
  { id: "4", label: "4", group: "ARIL", defaultBuruh: 4, defaultHektar: 92.39, defaultTandanHarian: 250, defaultAbw: 24.05 },
  { id: "8", label: "8", group: "ARIL", defaultBuruh: 2, defaultHektar: 82.03, defaultTandanHarian: 280, defaultAbw: 23.00 },
  { id: "9", label: "9", group: "ARIL", defaultBuruh: 3, defaultHektar: 83.61, defaultTandanHarian: 274, defaultAbw: 23.00 },
  { id: "10", label: "10", group: "ARIL", defaultBuruh: 3, defaultHektar: 84.36, defaultTandanHarian: 259, defaultAbw: 23.01 },
  { id: "11", label: "11", group: "ARIL", defaultBuruh: 2, defaultHektar: 47.85, defaultTandanHarian: 152, defaultAbw: 23.00 },
  { id: "12", label: "12", group: "ARIL", defaultBuruh: 2, defaultHektar: 76.50, defaultTandanHarian: 233, defaultAbw: 23.00 },
  
  // KIROMIN Group
  { id: "13", label: "13", group: "KIROMIN", defaultBuruh: 2, defaultHektar: 50.75, defaultTandanHarian: 225, defaultAbw: 22.38 },
  { id: "14", label: "14", group: "KIROMIN", defaultBuruh: 4, defaultHektar: 70.45, defaultTandanHarian: 310, defaultAbw: 12.88 },
  { id: "15", label: "15", group: "KIROMIN", defaultBuruh: 2, defaultHektar: 68.36, defaultTandanHarian: 335, defaultAbw: 23.02 },
  { id: "16", label: "16", group: "KIROMIN", defaultBuruh: 2, defaultHektar: 64.44, defaultTandanHarian: 220, defaultAbw: 23.01 },
  { id: "17", label: "17", group: "KIROMIN", defaultBuruh: 4, defaultHektar: 84.08, defaultTandanHarian: 400, defaultAbw: 23.01 },
  
  // wan (PKT 002) Group
  { id: "18", label: "18", group: "wan", defaultBuruh: 2, defaultHektar: 76.20, defaultTandanHarian: 490, defaultAbw: 18.39 },
  { id: "19", label: "19", group: "wan", defaultBuruh: 2, defaultHektar: 81.75, defaultTandanHarian: 543, defaultAbw: 13.99 },
  { id: "20", label: "20", group: "wan", defaultBuruh: 2, defaultHektar: 68.62, defaultTandanHarian: 342, defaultAbw: 18.69 },
  { id: "21", label: "21", group: "wan", defaultBuruh: 2, defaultHektar: 24.26, defaultTandanHarian: 210, defaultAbw: 14.01 },
  { id: "22", label: "22", group: "wan", defaultBuruh: 2, defaultHektar: 65.29, defaultTandanHarian: 288, defaultAbw: 14.00 },
  
  // FELDA Groups
  { id: "001LF", label: "001LF", group: "FELDA", defaultBuruh: 3, defaultHektar: 51.71, defaultTandanHarian: 100, defaultAbw: 22.00 },
  { id: "002LF", label: "002LF", group: "FELDA", defaultBuruh: 3, defaultHektar: 46.80, defaultTandanHarian: 140, defaultAbw: 15.33 }
];

export const LaporanBacklogView: React.FC = () => {
  // Select active date (default to 2026-06-22 as in user image, or current date if out of range)
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-22');
  
  // Backlog state: keyed by date and blockId
  const [backlogHistory, setBacklogHistory] = useState<Record<string, Record<string, BacklogRecord>>>(() => {
    const saved = localStorage.getItem("fpm_backlog_history_v1");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  // State to fetch cloud dynamic ABW and map it
  const [cloudAbwHistory, setCloudAbwHistory] = useState<Record<string, Record<string, number[]>>>({});
  const [cloudFeldaAbwHistory, setCloudFeldaAbwHistory] = useState<Record<string, Record<string, number | null>>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Editing state
  const [editingBlock, setEditingBlock] = useState<BlockConfig | null>(null);
  const [editForm, setEditForm] = useState<BacklogRecord>({
    pus1_mula: "",
    pus1_tamat: "",
    pus2_mula: "",
    pus2_tamat: "",
    hektar_siap: 0,
    capai_tandan: 0,
    backlog_diladang: 0,
    catatan: "",
    bil_buruh: 0,
    tandan_harian: 0,
    custom_abw: 0
  });

  // Intro feature guide state
  const [showBacklogIntro, setShowBacklogIntro] = useState<boolean>(false);

  const handleCloseIntro = () => {
    localStorage.setItem("fpm_backlog_intro_dismissed_v2", "true");
    setShowBacklogIntro(false);
  };

  // Alert dismiss helper
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load backlog data and dynamic ABW calculations from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch backlog history
        const backlogRes = await fetch("/api/hasil/backlog");
        const isBacklogJson = backlogRes.headers.get("content-type")?.includes("application/json");
        if (backlogRes.ok && isBacklogJson) {
          const backlogJson = await backlogRes.json();
          if (backlogJson.backlogHistory) {
            setBacklogHistory(backlogJson.backlogHistory);
          }
        } else {
          console.warn(`Backlog API returned non-JSON response or error (${backlogRes.status})`);
        }

        // Fetch dynamic ABW calculations
        const abwRes = await fetch("/api/hasil/abw");
        const isAbwJson = abwRes.headers.get("content-type")?.includes("application/json");
        if (abwRes.ok && isAbwJson) {
          const abwJson = await abwRes.json();
          if (abwJson.abwHistory) setCloudAbwHistory(abwJson.abwHistory);
          if (abwJson.feldaAbwHistory) setCloudFeldaAbwHistory(abwJson.feldaAbwHistory);
        } else {
          console.warn(`ABW API returned non-JSON response or error (${abwRes.status})`);
        }

      } catch (err) {
        console.error("Failed to load backlog or ABW data from API. Using offline copy.", err);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // Save backlog to local and sync to Supabase Cloud
  const saveAndSync = async (updatedHistory: Record<string, Record<string, BacklogRecord>>) => {
    localStorage.setItem("fpm_backlog_history_v1", JSON.stringify(updatedHistory));
    setIsSyncing(true);
    try {
      await fetch("/api/hasil/backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backlogHistory: updatedHistory })
      });
    } catch (e) {
      console.error("Sync backlog fail:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Map Selected Date to ABW Month key ("Jan", "Feb", etc.)
  const activeAbwMonth = useMemo(() => {
    if (!selectedDate || typeof selectedDate !== 'string') return 'Mei';
    const parts = selectedDate.split("-");
    const monthIndex = parts[1] ? parseInt(parts[1], 10) - 1 : 5;
    const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
    return months[monthIndex] || 'Jun';
  }, [selectedDate]);

  // Dynamic look-up of local or cloud ABW per block
  const getDynamicBlockAbw = (blockId: string, customWeightOverride?: number) => {
    if (typeof customWeightOverride === 'number' && customWeightOverride > 0) {
      return customWeightOverride;
    }

    const monthKey = activeAbwMonth;
    
    // Check if it's a FELDA block
    if (blockId === "001LF") {
      const monthWeights = cloudFeldaAbwHistory[monthKey] || {};
      const lots1 = ["8009", "8017", "8016", "7993", "8066", "1811", "8102", "4408", "8165", "4593"]; // 1LF lots
      const validWeights = lots1.map(lot => monthWeights[lot]).filter(w => typeof w === 'number' && w !== null && (w as number) > 0);
      if (validWeights.length > 0) {
        return validWeights.reduce((a, b) => (a || 0) + (b || 0), 0) / validWeights.length;
      }
      return 21.60; // Fallback to Mei weighted average
    }
    
    if (blockId === "002LF") {
      const monthWeights = cloudFeldaAbwHistory[monthKey] || {};
      const lots2 = ["6235", "6226", "6284", "6280", "6206", "6199", "6195", "6172"]; // 2LF lots
      const validWeights = lots2.map(lot => monthWeights[lot]).filter(w => typeof w === 'number' && w !== null && (w as number) > 0);
      if (validWeights.length > 0) {
        return validWeights.reduce((a, b) => (a || 0) + (b || 0), 0) / validWeights.length;
      }
      return 15.33; // Fallback to Mei weighted average
    }

    // For standard blocks (1 to 22)
    const monthData = cloudAbwHistory[monthKey] || {};
    const recordedVals = monthData[blockId] || [];
    const nonZeroVals = recordedVals.filter(v => typeof v === 'number' && v > 0);
    
    if (nonZeroVals.length > 0) {
      return nonZeroVals.reduce((a, b) => a + b, 0) / nonZeroVals.length;
    }

    // Fallback block configuration weights which are pre-aligned with their photo values
    const configWeight = BLOCKS_CONFIG.find(b => b.id === blockId);
    return configWeight ? configWeight.defaultAbw : 20.0;
  };

  // Seed default dataset if date hasn't been initialized yet
  const activeDateRecords = useMemo(() => {
    const getMockRecordForBlock = (blockId: string): BacklogRecord => {
      const b = BLOCKS_CONFIG.find(bc => bc.id === blockId)!;
      const base: BacklogRecord = {
        pus1_mula: "",
        pus1_tamat: "",
        pus1_mula_default: blockId === "1" ? "2026-06-02" : "",
        pus1_tamat_default: "",
        pus2_mula: "",
        pus2_tamat: "",
        hektar_siap: 0,
        capai_tandan: 0,
        backlog_diladang: 0,
        catatan: "",
        bil_buruh: b.defaultBuruh,
        tandan_harian: b.defaultTandanHarian,
        custom_abw: 0
      };

      if (blockId === '1') {
        base.pus1_mula = '2026-06-02'; base.pus1_tamat = '2026-06-18'; base.pus2_mula = '2026-06-19';
        base.hektar_siap = 14.00; base.capai_tandan = 113; base.backlog_diladang = 413;
      } else if (blockId === '2') {
        base.pus1_mula = '2026-06-03'; base.pus1_tamat = '2026-06-14'; base.pus2_mula = '2026-06-15';
        base.hektar_siap = 38.00; base.capai_tandan = 315; base.backlog_diladang = 565;
      } else if (blockId === '3') {
        base.pus1_mula = '2026-06-02'; base.pus1_tamat = '2026-06-14'; base.pus2_mula = '2026-06-17';
        base.hektar_siap = 30.00; base.capai_tandan = 200; base.backlog_diladang = 30;
      } else if (blockId === '5') {
        base.pus1_mula = '2026-06-03'; base.pus1_tamat = '2026-06-13'; base.pus2_mula = '2026-06-18';
        base.hektar_siap = 24.00; base.capai_tandan = 180; base.backlog_diladang = 120;
      } else if (blockId === '6') {
        base.pus1_mula = '2026-06-03'; base.pus1_tamat = '2026-06-13'; base.pus2_mula = '2026-06-17';
        base.hektar_siap = 28.00; base.capai_tandan = 210; base.backlog_diladang = 320;
      } else if (blockId === '7') {
        base.pus1_mula = '2026-06-03'; base.pus1_tamat = '2026-06-15'; base.pus2_mula = '2026-06-16';
        base.hektar_siap = 32.00; base.capai_tandan = 250; base.backlog_diladang = 430;
      } else if (blockId === '4') {
        base.pus1_mula = '2026-06-02'; base.pus1_tamat = '2026-06-17'; base.pus2_mula = '2026-06-18';
        base.hektar_siap = 23.00; base.capai_tandan = 323; base.backlog_diladang = 395;
      } else if (blockId === '8') {
        base.pus1_mula = '2026-06-02'; base.pus1_tamat = '2026-06-13'; base.pus2_mula = '2026-06-15';
        base.hektar_siap = 44.00; base.capai_tandan = 301; base.backlog_diladang = 370;
      } else if (blockId === '9') {
        base.pus1_mula = '2026-06-02'; base.pus1_tamat = '2026-06-16'; base.pus2_mula = '2026-06-17';
        base.hektar_siap = 35.00; base.capai_tandan = 280; base.backlog_diladang = 400;
      } else if (blockId === '10') {
        base.pus1_mula = '2026-06-01'; base.pus1_tamat = '2026-06-14'; base.pus2_mula = '2026-06-15';
        base.hektar_siap = 49.00; base.capai_tandan = 270; base.backlog_diladang = 425;
      } else if (blockId === '11') {
        base.pus1_mula = '2026-06-03'; base.pus1_tamat = '2026-06-15'; base.pus2_mula = '2026-06-16';
        base.hektar_siap = 24.00; base.capai_tandan = 205; base.backlog_diladang = 350;
      } else if (blockId === '12') {
        base.pus1_mula = '2026-06-06'; base.pus1_tamat = '2026-06-16'; base.pus2_mula = '2026-06-17';
        base.hektar_siap = 33.00; base.capai_tandan = 255; base.backlog_diladang = 380;
      } else if (blockId === '13') {
        base.pus1_mula = '2026-06-06'; base.pus1_tamat = '2026-06-16'; base.pus2_mula = '2026-06-20';
        base.hektar_siap = 11.00; base.capai_tandan = 230; base.backlog_diladang = 475;
      } else if (blockId === '14') {
        base.pus1_mula = '2026-06-02'; base.pus1_tamat = '2026-06-13'; base.pus2_mula = '2026-06-17';
        base.hektar_siap = 40.00; base.capai_tandan = 403; base.backlog_diladang = 224;
      } else if (blockId === '15') {
        base.pus1_mula = '2026-06-04'; base.pus1_tamat = '2026-06-15'; base.pus2_mula = '2026-06-18';
        base.hektar_siap = 35.00; base.capai_tandan = 285; base.backlog_diladang = 285;
      } else if (blockId === '16') {
        base.pus1_mula = '2026-06-03'; base.pus1_tamat = '2026-06-14'; base.pus2_mula = '2026-06-18';
        base.hektar_siap = 36.00; base.capai_tandan = 385; base.backlog_diladang = 385;
      } else if (blockId === '17') {
        base.pus1_mula = '2026-06-02'; base.pus1_tamat = '2026-06-13'; base.pus2_mula = '2026-06-14';
        base.hektar_siap = 48.00; base.capai_tandan = 452; base.backlog_diladang = 452;
      } else if (blockId === '18') {
        base.pus1_mula = '2026-06-04'; base.pus1_tamat = '2026-06-15'; base.pus2_mula = '2026-06-18';
        base.hektar_siap = 26.00; base.capai_tandan = 434; base.backlog_diladang = 485;
      } else if (blockId === '19') {
        base.pus1_mula = '2026-06-03'; base.pus1_tamat = '2026-06-13'; base.pus2_mula = '2026-06-18';
        base.hektar_siap = 30.00; base.capai_tandan = 411; base.backlog_diladang = 461;
      } else if (blockId === '20') {
        base.pus1_mula = '2026-06-05'; base.pus1_tamat = '2026-06-18'; base.pus2_mula = '2026-06-19';
        base.hektar_siap = 25.00; base.capai_tandan = 300; base.backlog_diladang = 284;
      } else if (blockId === '21') {
        base.pus1_mula = '2026-06-04'; base.pus1_tamat = '2026-06-10'; base.pus2_mula = '2026-06-19';
        base.hektar_siap = 16.00; base.capai_tandan = 270; base.backlog_diladang = 294;
      } else if (blockId === '22') {
        base.pus1_mula = '2026-06-06'; base.pus1_tamat = '2026-06-16'; base.pus2_mula = '2026-06-19';
        base.hektar_siap = 25.00; base.capai_tandan = 400; base.backlog_diladang = 452;
      } else if (blockId === '001LF') {
        base.pus1_mula = '2026-06-01'; base.pus1_tamat = '2026-06-10'; base.pus2_mula = '2026-06-17';
        base.hektar_siap = 18.00; base.capai_tandan = 160; base.backlog_diladang = 245;
        base.catatan = "tuai di blok 2";
      } else if (blockId === '002LF') {
        base.pus1_mula = '2026-06-11'; base.pus1_tamat = '2026-06-17'; base.pus2_mula = '2026-06-25';
        base.hektar_siap = 46.80; base.capai_tandan = 0; base.backlog_diladang = 0;
      }
      return base;
    };

    const records: Record<string, BacklogRecord> = backlogHistory[selectedDate] || {};
    const merged: Record<string, BacklogRecord & { abw: number }> = {};
    
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    const todayStr = localToday.toISOString().split('T')[0];

    BLOCKS_CONFIG.forEach(b => {
      let rec: BacklogRecord;

      if (records[b.id]) {
        rec = { ...records[b.id] };
      } else {
        // Find latest date in backlogHistory before selectedDate that has this block
        const allDates = Object.keys(backlogHistory).sort();
        const priorDates = allDates.filter(d => d < selectedDate);
        let foundPrior = false;

        for (let i = priorDates.length - 1; i >= 0; i--) {
          const priorDate = priorDates[i];
          if (backlogHistory[priorDate] && backlogHistory[priorDate][b.id]) {
            rec = { ...backlogHistory[priorDate][b.id] };
            foundPrior = true;
            break;
          }
        }

        if (!foundPrior) {
          // If no prior record was saved in database, and selectedDate is on/after 2026-06-22,
          // we use the 2026-06-22 mock dataset as our baseline prior/current!
          if (selectedDate >= '2026-06-22') {
            rec = getMockRecordForBlock(b.id);
          } else {
            // Default blank baseline
            rec = {
              pus1_mula: "",
              pus1_tamat: "",
              pus1_mula_default: b.id === "1" ? "2026-06-02" : "",
              pus1_tamat_default: "",
              pus2_mula: "",
              pus2_tamat: "",
              hektar_siap: 0,
              capai_tandan: 0,
              backlog_diladang: 0,
              catatan: "",
              bil_buruh: b.defaultBuruh,
              tandan_harian: b.defaultTandanHarian,
              custom_abw: 0
            };
          }
        }
      }

      // Jika tarikh yang dipilih adalah esok atau tarikh masa hadapan (kedepan), clearkan capai tandan & backlog tandan
      if (selectedDate > todayStr) {
        rec.capai_tandan = 0;
        rec.backlog_diladang = 0;
      }

      const abwVal = getDynamicBlockAbw(b.id, rec.custom_abw);

      // --- DYNAMIC TANDAN HARIAN TARGET CALCULATION ---
      let monthIdx = 5; // Default to June (0-indexed 5)
      if (selectedDate && typeof selectedDate === 'string' && selectedDate.includes('-')) {
        const parts = selectedDate.split("-");
        if (parts.length >= 2) {
          const parsed = parseInt(parts[1], 10);
          if (!isNaN(parsed)) {
            monthIdx = parsed - 1;
          }
        }
      }

      let pkt = "001";
      let luas = b.defaultHektar;
      if (b.group === "wan") {
        pkt = "002";
      } else if (b.group === "FELDA") {
        pkt = "003";
      }

      if (MASTER_DATA[b.id]) {
        luas = MASTER_DATA[b.id].luas;
        pkt = MASTER_DATA[b.id].pkt;
      }

      const targets = MONTHLY_TARGETS_2026[pkt] || [];
      const targetHek = targets[monthIdx] !== undefined ? targets[monthIdx] : 1.9;

      // Target Ton = targetHek * luas
      const targetMonthlyTonnage = targetHek * luas;

      // Divided by 26 working days
      const targetDailyTonnage = targetMonthlyTonnage / 26;

      // Tonnage to kg
      const targetDailyKg = targetDailyTonnage * 1000;

      // Convert to bunches using dynamic ABW
      const computedTandanHarian = abwVal > 0 ? Math.round(targetDailyKg / abwVal) : b.defaultTandanHarian;

      merged[b.id] = {
        ...rec,
        tandan_harian: computedTandanHarian,
        abw: abwVal
      };
    });

    return merged;
  }, [backlogHistory, selectedDate, cloudAbwHistory, cloudFeldaAbwHistory]);

  // Open modal/edit drawer for a block
  const handleEditClick = (block: BlockConfig) => {
    const record = activeDateRecords[block.id];
    setEditingBlock(block);
    setEditForm({
      pus1_mula: record.pus1_mula || "",
      pus1_tamat: record.pus1_tamat || "",
      pus2_mula: record.pus2_mula || "",
      pus2_tamat: record.pus2_tamat || "",
      hektar_siap: record.hektar_siap || 0,
      capai_tandan: record.capai_tandan || 0,
      backlog_diladang: record.backlog_diladang || 0,
      catatan: record.catatan || "",
      bil_buruh: record.bil_buruh !== undefined ? record.bil_buruh : block.defaultBuruh,
      tandan_harian: record.tandan_harian !== undefined ? record.tandan_harian : block.defaultTandanHarian,
      custom_abw: record.custom_abw || 0
    });
  };

  // Submit edits
  const handleEditSave = () => {
    if (!editingBlock) return;
    
    const updatedDateRecords = {
      ...backlogHistory[selectedDate],
      [editingBlock.id]: editForm
    };

    const updatedHistory = {
      ...backlogHistory,
      [selectedDate]: updatedDateRecords
    };

    setBacklogHistory(updatedHistory);
    saveAndSync(updatedHistory);
    setEditingBlock(null);
    setToastMessage({ type: 'success', text: `Data Backlog Blok ${editingBlock.label} berjaya dikemaskini.` });
  };

  // Grouped Calculations for Rendering summaries (exactly as in Excel screenshot!)
  const stats = useMemo(() => {
    const defaultGroupStats = () => ({
      buruh: 0,
      hektar: 0,
      hektarSiap: 0,
      tandanHarian: 0,
      capaiTandan: 0,
      backlog: 0,
      anggaranTan: 0
    });

    const groups: Record<string, ReturnType<typeof defaultGroupStats>> = {
      ADIB: defaultGroupStats(),
      ARIL: defaultGroupStats(),
      KIROMIN: defaultGroupStats(),
      wan: defaultGroupStats(),
      FELDA: defaultGroupStats()
    };

    BLOCKS_CONFIG.forEach(b => {
      const rec = activeDateRecords[b.id];
      const g = groups[b.group];
      
      const buruh = rec.bil_buruh !== undefined ? rec.bil_buruh : b.defaultBuruh;
      const tandanHarian = rec.tandan_harian !== undefined ? rec.tandan_harian : b.defaultTandanHarian;
      const hSiap = rec.hektar_siap || 0;
      const capai = rec.capai_tandan || 0;
      const backlog = rec.backlog_diladang || 0;
      const abwVal = rec.abw;
      const angTan = (backlog * abwVal) / 1000;

      g.buruh += buruh;
      g.hektar += b.defaultHektar;
      g.hektarSiap += hSiap;
      g.tandanHarian += tandanHarian;
      g.capaiTandan += capai;
      g.backlog += backlog;
      g.anggaranTan += angTan;
    });

    // PKT 001 = ADIB + ARIL + KIROMIN
    const pkt1 = defaultGroupStats();
    ['ADIB', 'ARIL', 'KIROMIN'].forEach(gKey => {
      const g = groups[gKey];
      pkt1.buruh += g.buruh;
      pkt1.hektar += g.hektar;
      pkt1.hektarSiap += g.hektarSiap;
      pkt1.tandanHarian += g.tandanHarian;
      pkt1.capaiTandan += g.capaiTandan;
      pkt1.backlog += g.backlog;
      pkt1.anggaranTan += g.anggaranTan;
    });

    // PKT 002 = wan
    const pkt2 = groups['wan'];

    // GRAND TOTAL = PKT 001 + PKT 002
    const grand = defaultGroupStats();
    [pkt1, pkt2].forEach(p => {
      grand.buruh += p.buruh;
      grand.hektar += p.hektar;
      grand.hektarSiap += p.hektarSiap;
      grand.tandanHarian += p.tandanHarian;
      grand.capaiTandan += p.capaiTandan;
      grand.backlog += p.backlog;
      grand.anggaranTan += p.anggaranTan;
    });

    return {
      groups,
      pkt1,
      pkt2,
      grand
    };
  }, [activeDateRecords]);

  // Utility to parse standard dates to dd.mm.yyyy layout as per image
  const formatTarikhDmy = (dateStr: string) => {
    if (!dateStr) return "-";
    const pts = dateStr.split("-");
    if (pts.length !== 3) return dateStr;
    return `${pts[2]}.${pts[1]}.${pts[0]}`;
  };

  // Check which round is active based on filled dates
  const calculateActivePus = (rec: BacklogRecord) => {
    if (rec.pus2_mula || rec.pus2_tamat) return 2;
    if (rec.pus1_mula || rec.pus1_tamat) return 1;
    return 2; // Default to 2 loop representation
  };

  // Generate beautiful WhatsApp message share link
  const whatsappUrl = useMemo(() => {
    const formattedDate = formatTarikhDmy(selectedDate);
    const text = `*LAPORAN TANDAN BACKLOG FPM*\n` +
      `*Tarikh Laporan:* ${formattedDate}\n\n` +
      `*1. RINGKASAN KESELURUHAN:*\n` +
      `• *Jumlah Backlog:* ${stats.grand.backlog} TBS\n` +
      `• *Anggaran Berat:* ${stats.grand.anggaranTan.toFixed(2)} Tan\n` +
      `• *Jumlah Hektar Siap:* ${stats.grand.hektarSiap.toFixed(2)} / ${stats.grand.hektar.toFixed(2)} Ha\n` +
      `• *Jumlah Buruh:* ${stats.grand.buruh} orang\n\n` +
      `*2. PECAHAN KUMPULAN:*\n` +
      `🟢 *ADIB:* ${stats.groups.ADIB.backlog} TBS (${stats.groups.ADIB.anggaranTan.toFixed(2)} Tan)\n` +
      `🟡 *ARIL:* ${stats.groups.ARIL.backlog} TBS (${stats.groups.ARIL.anggaranTan.toFixed(2)} Tan)\n` +
      `🔵 *KIROMIN:* ${stats.groups.KIROMIN.backlog} TBS (${stats.groups.KIROMIN.anggaranTan.toFixed(2)} Tan)\n` +
      `🟣 *WAN (PKT 2):* ${stats.groups.wan.backlog} TBS (${stats.groups.wan.anggaranTan.toFixed(2)} Tan)\n` +
      `🟠 *FELDA:* ${stats.groups.FELDA.backlog} TBS (${stats.groups.FELDA.anggaranTan.toFixed(2)} Tan)\n\n` +
      `*3. PECAHAN PERINGKAT:*\n` +
      `• *PKT 1 (ADIB/ARIL/KIROMIN):* ${stats.pkt1.backlog} TBS (${stats.pkt1.anggaranTan.toFixed(2)} Tan)\n` +
      `• *PKT 2 (WAN):* ${stats.pkt2.backlog} TBS (${stats.pkt2.anggaranTan.toFixed(2)} Tan)\n\n` +
      `Dihantar dari *FPM App - Sistem Laporan Backlog* 🌾`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }, [stats, selectedDate]);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION WITH FILTERS */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Laporan Tandan Backlog
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">
              Kementerian / Pengurusan Tandan Di Ladang
            </p>
          </div>
        </div>

        {/* Date Selector & Sync Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <Calendar size={13} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase text-slate-400">Tarikh Laporan:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-700 dark:text-slate-200 border-none focus:ring-0 cursor-pointer p-0 w-28"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-100 dark:border-slate-800 transition-all"
            title="Cetak Laporan"
          >
            <Printer size={14} />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl border border-green-500/20 transition-all flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider inline-flex"
            title="Kongsi Ringkasan ke WhatsApp"
          >
            <MessageCircle size={13} className="text-green-500" />
            <span>Kongsi WhatsApp</span>
          </a>

          <button
            onClick={() => setShowBacklogIntro(true)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 transition-all flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider"
            title="Info Ciri Baharu Backlog"
          >
            <Info size={13} />
            <span>Info Ciri Baharu</span>
          </button>
          
          {isSyncing && (
            <span className="px-2.5 py-1 text-[8px] font-black uppercase rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
              Menyimpan Cloud...
            </span>
          )}
        </div>
      </div>

      {/* ALERT FEEDBACK */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-2xl border text-[10px] font-bold flex items-center gap-2 ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400' 
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-400'
            }`}
          >
            <ClipboardCheck size={14} />
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE MAIN BACKLOG GRID */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[10px] text-left border-collapse min-w-[1200px]">
            <thead>
              {/* Main Headers Row 1 */}
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-100 dark:border-slate-800">
                <th rowSpan={2} className="px-3 py-3.5 border-r border-slate-100 dark:border-slate-800 w-24">KAWASAN JAGAN</th>
                <th rowSpan={2} className="px-2 py-3.5 border-r border-slate-100 dark:border-slate-800 text-center w-12">BLOK</th>
                <th rowSpan={2} className="px-2 py-3.5 border-r border-slate-100 dark:border-slate-800 text-center w-14">BIL BURUH</th>
                <th rowSpan={2} className="px-3 py-3.5 border-r border-slate-100 dark:border-slate-800 text-right w-16">HEKTAR</th>
                <th colSpan={2} className="px-2 py-1.5 border-b border-r border-slate-100 dark:border-slate-800 text-center">PUS 1</th>
                <th colSpan={2} className="px-2 py-1.5 border-b border-r border-slate-100 dark:border-slate-800 text-center">PUS 2</th>
                <th rowSpan={2} className="px-2 py-3.5 border-r border-slate-100 dark:border-slate-800 text-center w-12">PUS</th>
                <th rowSpan={2} className="px-2 py-3.5 border-r border-slate-100 dark:border-slate-800 text-right w-16">HEKTAR SIAP</th>
                <th rowSpan={2} className="px-2 py-3.5 border-r border-slate-100 dark:border-slate-800 text-center w-16">% SIAP PUS</th>
                <th rowSpan={2} className="px-2 py-3.5 border-r border-slate-100 dark:border-slate-800 text-center w-24">
                  TANDAN HARIAN 
                  <span className="block text-[8px] text-slate-400 font-bold">(2.00 TAN)</span>
                </th>
                <th rowSpan={2} className="px-2 py-3.5 border-r border-slate-100 dark:border-slate-800 text-center w-16">CAPAI TANDAN</th>
                <th rowSpan={2} className="px-2 py-3.5 border-r border-slate-100 dark:border-slate-800 text-center w-16">% CAPAI</th>
                <th rowSpan={2} className="px-3 py-3.5 border-r border-slate-100 dark:border-slate-800 text-center w-24 bg-rose-500/5 dark:bg-rose-500/5 font-black text-rose-700 dark:text-rose-400 text-xs">Backlog - Tandan</th>
                <th rowSpan={2} className="px-3 py-3.5 border-r border-slate-100 dark:border-slate-800 text-right w-24 bg-rose-500/10 dark:bg-rose-500/10 font-black text-rose-800 dark:text-rose-300 text-xs">Backlog - Tan</th>
                <th rowSpan={2} className="px-4 py-3.5 w-44">CATATAN / TINDAKAN</th>
              </tr>
              {/* Sub-headers Row 2 */}
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="px-2 py-1 text-center border-r border-slate-100 dark:border-slate-800 w-20">MULA</th>
                <th className="px-2 py-1 text-center border-r border-slate-100 dark:border-slate-800 w-20">TAMAT</th>
                <th className="px-2 py-1 text-center border-r border-slate-100 dark:border-slate-800 w-20">MULA</th>
                <th className="px-2 py-1 text-center border-r border-slate-100 dark:border-slate-800 w-20">TAMAT</th>
              </tr>
            </thead>

            {/* TABLE BODY CONTAINER */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/65">
              
              {/* GROUP 1: ADIB */}
              {BLOCKS_CONFIG.filter(b => b.group === 'ADIB').map((block, idx, arr) => {
                const rec = activeDateRecords[block.id];
                const activePus = calculateActivePus(rec);
                const pctSiap = block.defaultHektar > 0 ? ((rec.hektar_siap || 0) / block.defaultHektar) * 100 : 0;
                
                const buruh = rec.bil_buruh !== undefined ? rec.bil_buruh : block.defaultBuruh;
                const tandanHarian = rec.tandan_harian !== undefined ? rec.tandan_harian : block.defaultTandanHarian;
                const pctCapai = tandanHarian > 0 ? ((rec.capai_tandan || 0) / tandanHarian) * 100 : 0;
                const angTan = ((rec.backlog_diladang || 0) * rec.abw) / 1000;
                const isUpdatedOnDate = !!(backlogHistory[selectedDate] && backlogHistory[selectedDate][block.id]);

                return (
                  <tr 
                    key={block.id} 
                    className={`hover:bg-slate-500/[0.02] transition-colors group cursor-pointer ${
                      isUpdatedOnDate ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                    }`}
                    onClick={() => handleEditClick(block)}
                  >
                    {idx === 0 && (
                      <td rowSpan={arr.length} className="px-3 py-3 border-r border-slate-100 dark:border-slate-800 align-middle font-black text-slate-700 dark:text-slate-300">
                        ADIB
                      </td>
                    )}
                    <td className={`px-2 py-2.5 font-bold text-center border-r border-slate-100 dark:border-slate-800 transition-all ${
                      isUpdatedOnDate 
                        ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-black" 
                        : "bg-slate-500/[0.02] text-slate-700 dark:text-slate-300"
                    }`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isUpdatedOnDate && <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0 font-black animate-pulse" />}
                        <span>{block.label}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {buruh}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {block.defaultHektar.toFixed(2)}
                    </td>
                    
                    {/* Pus 1 Mula / Tamat */}
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus1_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus1_tamat)}
                    </td>
                    
                    {/* Pus 2 Mula / Tamat */}
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus2_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus2_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {activePus}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                      {rec.hektar_siap > 0 ? rec.hektar_siap.toFixed(2) : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-500">
                      {rec.hektar_siap > 0 ? `${pctSiap.toFixed(2)}%` : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {tandanHarian}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {rec.capai_tandan > 0 ? rec.capai_tandan : "-"}
                    </td>
                    <td className={`px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-bold ${pctCapai >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                      {rec.capai_tandan > 0 ? `${pctCapai.toFixed(2)}%` : "-"}
                    </td>
                    
                    {/* Backlog items */}
                    <td className="px-3 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-black text-rose-600 bg-rose-500/[0.02]">
                      {rec.backlog_diladang > 0 ? rec.backlog_diladang : "-"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 font-black text-rose-700 dark:text-rose-400 bg-rose-500/[0.04]">
                      {rec.backlog_diladang > 0 ? angTan.toFixed(2) : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] relative">
                      <div className="flex justify-between items-center w-full">
                        <span className="italic text-[9px]">{rec.catatan || "-"}</span>
                        <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity ml-1 shrink-0" />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* SUMMARY ADIB: 1A (YELLOW ROW) */}
              <tr className="bg-amber-500/10 dark:bg-amber-500/5 font-bold border-y border-amber-500/20">
                <td colSpan={2} className="px-3 py-2 text-right border-r border-amber-500/10 font-black text-amber-800 dark:text-amber-400">
                  1A
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ADIB.buruh}
                </td>
                <td className="px-3 py-2 text-right font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ADIB.hektar.toFixed(2)}
                </td>
                <td colSpan={5} className="bg-amber-500/[0.02] border-r border-amber-500/10" />
                <td className="px-2 py-2 text-right font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ADIB.hektarSiap > 0 ? stats.groups.ADIB.hektarSiap.toFixed(2) : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-600">
                  {stats.groups.ADIB.hektarSiap > 0 ? `${((stats.groups.ADIB.hektarSiap / stats.groups.ADIB.hektar) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ADIB.tandanHarian}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ADIB.capaiTandan > 0 ? stats.groups.ADIB.capaiTandan : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ADIB.capaiTandan > 0 ? `${((stats.groups.ADIB.capaiTandan / stats.groups.ADIB.tandanHarian) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-3 py-2 text-center font-mono font-black border-r border-amber-500/20 text-rose-600 bg-rose-500/[0.04]">
                  {stats.groups.ADIB.backlog > 0 ? stats.groups.ADIB.backlog : "-"}
                </td>
                <td className="px-3 py-2 text-right font-mono font-black border-r border-amber-500/20 text-rose-700 dark:text-rose-400 bg-rose-500/[0.08]">
                  {stats.groups.ADIB.backlog > 0 ? stats.groups.ADIB.anggaranTan.toFixed(2) : "-"}
                </td>
                <td colSpan={1} />
              </tr>

              {/* GROUP 2: ARIL */}
              {BLOCKS_CONFIG.filter(b => b.group === 'ARIL').map((block, idx, arr) => {
                const rec = activeDateRecords[block.id];
                const activePus = calculateActivePus(rec);
                const pctSiap = block.defaultHektar > 0 ? ((rec.hektar_siap || 0) / block.defaultHektar) * 100 : 0;
                
                const buruh = rec.bil_buruh !== undefined ? rec.bil_buruh : block.defaultBuruh;
                const tandanHarian = rec.tandan_harian !== undefined ? rec.tandan_harian : block.defaultTandanHarian;
                const pctCapai = tandanHarian > 0 ? ((rec.capai_tandan || 0) / tandanHarian) * 100 : 0;
                const angTan = ((rec.backlog_diladang || 0) * rec.abw) / 1000;
                const isUpdatedOnDate = !!(backlogHistory[selectedDate] && backlogHistory[selectedDate][block.id]);

                return (
                  <tr 
                    key={block.id} 
                    className={`hover:bg-slate-500/[0.02] transition-colors group cursor-pointer ${
                      isUpdatedOnDate ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                    }`}
                    onClick={() => handleEditClick(block)}
                  >
                    {idx === 0 && (
                      <td rowSpan={arr.length} className="px-3 py-3 border-r border-slate-100 dark:border-slate-800 align-middle font-black text-slate-700 dark:text-slate-300">
                        ARIL
                      </td>
                    )}
                    <td className={`px-2 py-2.5 font-bold text-center border-r border-slate-100 dark:border-slate-800 transition-all ${
                      isUpdatedOnDate 
                        ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-black" 
                        : "bg-slate-500/[0.02] text-slate-700 dark:text-slate-300"
                    }`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isUpdatedOnDate && <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0 font-black animate-pulse" />}
                        <span>{block.label}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {buruh}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {block.defaultHektar.toFixed(2)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus1_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus1_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus2_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus2_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {activePus}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                      {rec.hektar_siap > 0 ? rec.hektar_siap.toFixed(2) : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-500">
                      {rec.hektar_siap > 0 ? `${pctSiap.toFixed(2)}%` : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {tandanHarian}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {rec.capai_tandan > 0 ? rec.capai_tandan : "-"}
                    </td>
                    <td className={`px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-bold ${pctCapai >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {rec.capai_tandan > 0 ? `${pctCapai.toFixed(2)}%` : "-"}
                    </td>
                    
                    <td className="px-3 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-black text-rose-600 bg-rose-500/[0.02]">
                      {rec.backlog_diladang > 0 ? rec.backlog_diladang : "-"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 font-black text-rose-700 dark:text-rose-400 bg-rose-500/[0.04]">
                      {rec.backlog_diladang > 0 ? angTan.toFixed(2) : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] relative">
                      <div className="flex justify-between items-center w-full">
                        <span className="italic text-[9px]">{rec.catatan || "-"}</span>
                        <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity ml-1 shrink-0" />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* SUMMARY ARIL: 1B (YELLOW ROW) */}
              <tr className="bg-amber-500/10 dark:bg-amber-500/5 font-bold border-y border-amber-500/20">
                <td colSpan={2} className="px-3 py-2 text-right border-r border-amber-500/10 font-black text-amber-800 dark:text-amber-400">
                  1B
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ARIL.buruh}
                </td>
                <td className="px-3 py-2 text-right font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ARIL.hektar.toFixed(2)}
                </td>
                <td colSpan={5} className="bg-amber-500/[0.02] border-r border-amber-500/10" />
                <td className="px-2 py-2 text-right font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ARIL.hektarSiap > 0 ? stats.groups.ARIL.hektarSiap.toFixed(2) : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-600">
                  {stats.groups.ARIL.hektarSiap > 0 ? `${((stats.groups.ARIL.hektarSiap / stats.groups.ARIL.hektar) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ARIL.tandanHarian}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ARIL.capaiTandan > 0 ? stats.groups.ARIL.capaiTandan : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.ARIL.capaiTandan > 0 ? `${((stats.groups.ARIL.capaiTandan / stats.groups.ARIL.tandanHarian) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-3 py-2 text-center font-mono font-black border-r border-amber-500/20 text-rose-600 bg-rose-500/[0.04]">
                  {stats.groups.ARIL.backlog > 0 ? stats.groups.ARIL.backlog : "-"}
                </td>
                <td className="px-3 py-2 text-right font-mono font-black border-r border-amber-500/20 text-rose-700 dark:text-rose-400 bg-rose-500/[0.08]">
                  {stats.groups.ARIL.backlog > 0 ? stats.groups.ARIL.anggaranTan.toFixed(2) : "-"}
                </td>
                <td colSpan={1} />
              </tr>

              {/* GROUP 3: KIROMIN */}
              {BLOCKS_CONFIG.filter(b => b.group === 'KIROMIN').map((block, idx, arr) => {
                const rec = activeDateRecords[block.id];
                const activePus = calculateActivePus(rec);
                const pctSiap = block.defaultHektar > 0 ? ((rec.hektar_siap || 0) / block.defaultHektar) * 100 : 0;
                
                const buruh = rec.bil_buruh !== undefined ? rec.bil_buruh : block.defaultBuruh;
                const tandanHarian = rec.tandan_harian !== undefined ? rec.tandan_harian : block.defaultTandanHarian;
                const pctCapai = tandanHarian > 0 ? ((rec.capai_tandan || 0) / tandanHarian) * 100 : 0;
                const angTan = ((rec.backlog_diladang || 0) * rec.abw) / 1000;
                const isUpdatedOnDate = !!(backlogHistory[selectedDate] && backlogHistory[selectedDate][block.id]);

                return (
                  <tr 
                    key={block.id} 
                    className={`hover:bg-slate-500/[0.02] transition-colors group cursor-pointer ${
                      isUpdatedOnDate ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                    }`}
                    onClick={() => handleEditClick(block)}
                  >
                    {idx === 0 && (
                      <td rowSpan={arr.length} className="px-3 py-3 border-r border-slate-100 dark:border-slate-800 align-middle font-black text-slate-700 dark:text-slate-300">
                        KIROMIN
                      </td>
                    )}
                    <td className={`px-2 py-2.5 font-bold text-center border-r border-slate-100 dark:border-slate-800 transition-all ${
                      isUpdatedOnDate 
                        ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-black" 
                        : "bg-slate-500/[0.02] text-slate-700 dark:text-slate-300"
                    }`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isUpdatedOnDate && <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0 font-black animate-pulse" />}
                        <span>{block.label}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {buruh}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {block.defaultHektar.toFixed(2)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus1_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus1_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus2_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus2_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {activePus}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                      {rec.hektar_siap > 0 ? rec.hektar_siap.toFixed(2) : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-500">
                      {rec.hektar_siap > 0 ? `${pctSiap.toFixed(2)}%` : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {tandanHarian}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {rec.capai_tandan > 0 ? rec.capai_tandan : "-"}
                    </td>
                    <td className={`px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-bold ${pctCapai >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {rec.capai_tandan > 0 ? `${pctCapai.toFixed(2)}%` : "-"}
                    </td>
                    
                    <td className="px-3 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-black text-rose-600 bg-rose-500/[0.02]">
                      {rec.backlog_diladang > 0 ? rec.backlog_diladang : "-"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 font-black text-rose-700 dark:text-rose-400 bg-rose-500/[0.04]">
                      {rec.backlog_diladang > 0 ? angTan.toFixed(2) : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] relative">
                      <div className="flex justify-between items-center w-full">
                        <span className="italic text-[9px]">{rec.catatan || "-"}</span>
                        <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity ml-1 shrink-0" />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* SUMMARY KIROMIN: 1C (YELLOW ROW) */}
              <tr className="bg-amber-500/10 dark:bg-amber-500/5 font-bold border-y border-amber-500/20">
                <td colSpan={2} className="px-3 py-2 text-right border-r border-amber-500/10 font-black text-amber-800 dark:text-amber-400">
                  1C
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.KIROMIN.buruh}
                </td>
                <td className="px-3 py-2 text-right font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.KIROMIN.hektar.toFixed(2)}
                </td>
                <td colSpan={5} className="bg-amber-500/[0.02] border-r border-amber-500/10" />
                <td className="px-2 py-2 text-right font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.KIROMIN.hektarSiap > 0 ? stats.groups.KIROMIN.hektarSiap.toFixed(2) : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-600">
                  {stats.groups.KIROMIN.hektarSiap > 0 ? `${((stats.groups.KIROMIN.hektarSiap / stats.groups.KIROMIN.hektar) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.KIROMIN.tandanHarian}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.KIROMIN.capaiTandan > 0 ? stats.groups.KIROMIN.capaiTandan : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.KIROMIN.capaiTandan > 0 ? `${((stats.groups.KIROMIN.capaiTandan / stats.groups.KIROMIN.tandanHarian) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-3 py-2 text-center font-mono font-black border-r border-amber-500/20 text-rose-600 bg-rose-500/[0.04]">
                  {stats.groups.KIROMIN.backlog > 0 ? stats.groups.KIROMIN.backlog : "-"}
                </td>
                <td className="px-3 py-2 text-right font-mono font-black border-r border-amber-500/20 text-rose-700 dark:text-rose-400 bg-rose-500/[0.08]">
                  {stats.groups.KIROMIN.backlog > 0 ? stats.groups.KIROMIN.anggaranTan.toFixed(2) : "-"}
                </td>
                <td colSpan={1} />
              </tr>

              {/* PKT 001 HEADER / SUMMARY (BLUE ROW) */}
              <tr className="bg-emerald-600 text-white dark:bg-emerald-700 font-extrabold text-[11px] border-y border-emerald-600 dark:border-emerald-700">
                <td colSpan={2} className="px-3 py-3 text-right uppercase border-r border-emerald-500">
                  PKT 001
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.pkt1.buruh}
                </td>
                <td className="px-3 py-3 text-right font-mono border-r border-emerald-500">
                  {stats.pkt1.hektar.toFixed(2)}
                </td>
                <td colSpan={5} className="border-r border-emerald-500" />
                <td className="px-2 py-3 text-right font-mono border-r border-emerald-500">
                  {stats.pkt1.hektarSiap > 0 ? stats.pkt1.hektarSiap.toFixed(2) : "-"}
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.pkt1.hektarSiap > 0 ? `${((stats.pkt1.hektarSiap / stats.pkt1.hektar) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.pkt1.tandanHarian}
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.pkt1.capaiTandan > 0 ? stats.pkt1.capaiTandan : "-"}
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.pkt1.capaiTandan > 0 ? `${((stats.pkt1.capaiTandan / stats.pkt1.tandanHarian) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-3 py-3 text-center font-mono border-r border-emerald-500 bg-rose-600/25">
                  {stats.pkt1.backlog > 0 ? stats.pkt1.backlog : "-"}
                </td>
                <td className="px-3 py-3 text-right font-mono border-r border-emerald-500 bg-rose-600/35">
                  {stats.pkt1.backlog > 0 ? stats.pkt1.anggaranTan.toFixed(2) : "-"}
                </td>
                <td colSpan={1} />
              </tr>

              {/* GROUP 4: wan (PKT 002) */}
              {BLOCKS_CONFIG.filter(b => b.group === 'wan').map((block, idx, arr) => {
                const rec = activeDateRecords[block.id];
                const activePus = calculateActivePus(rec);
                const pctSiap = block.defaultHektar > 0 ? ((rec.hektar_siap || 0) / block.defaultHektar) * 100 : 0;
                
                const buruh = rec.bil_buruh !== undefined ? rec.bil_buruh : block.defaultBuruh;
                const tandanHarian = rec.tandan_harian !== undefined ? rec.tandan_harian : block.defaultTandanHarian;
                const pctCapai = tandanHarian > 0 ? ((rec.capai_tandan || 0) / tandanHarian) * 100 : 0;
                const angTan = ((rec.backlog_diladang || 0) * rec.abw) / 1000;
                const isUpdatedOnDate = !!(backlogHistory[selectedDate] && backlogHistory[selectedDate][block.id]);

                return (
                  <tr 
                    key={block.id} 
                    className={`hover:bg-slate-500/[0.02] transition-colors group cursor-pointer ${
                      isUpdatedOnDate ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                    }`}
                    onClick={() => handleEditClick(block)}
                  >
                    {idx === 0 && (
                      <td rowSpan={arr.length} className="px-3 py-3 border-r border-slate-100 dark:border-slate-800 align-middle font-black text-slate-700 dark:text-slate-300">
                        wan
                      </td>
                    )}
                    <td className={`px-2 py-2.5 font-bold text-center border-r border-slate-100 dark:border-slate-800 transition-all ${
                      isUpdatedOnDate 
                        ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-black" 
                        : "bg-slate-500/[0.02] text-slate-700 dark:text-slate-300"
                    }`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isUpdatedOnDate && <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0 font-black animate-pulse" />}
                        <span>{block.label}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {buruh}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {block.defaultHektar.toFixed(2)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus1_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus1_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus2_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {formatTarikhDmy(rec.pus2_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      {activePus}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                      {rec.hektar_siap > 0 ? rec.hektar_siap.toFixed(2) : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-500">
                      {rec.hektar_siap > 0 ? `${pctSiap.toFixed(2)}%` : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {tandanHarian}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {rec.capai_tandan > 0 ? rec.capai_tandan : "-"}
                    </td>
                    <td className={`px-2 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-bold ${pctCapai >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {rec.capai_tandan > 0 ? `${pctCapai.toFixed(2)}%` : "-"}
                    </td>
                    
                    <td className="px-3 py-2.5 font-mono text-center border-r border-slate-100 dark:border-slate-800 font-black text-rose-600 bg-rose-500/[0.02]">
                      {rec.backlog_diladang > 0 ? rec.backlog_diladang : "-"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-slate-100 dark:border-slate-800 font-black text-rose-700 dark:text-rose-400 bg-rose-500/[0.04]">
                      {rec.backlog_diladang > 0 ? angTan.toFixed(2) : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] relative">
                      <div className="flex justify-between items-center w-full">
                        <span className="italic text-[9px]">{rec.catatan || "-"}</span>
                        <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity ml-1 shrink-0" />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* SUMMARY PKT 002: (YELLOW ROW) */}
              <tr className="bg-amber-500/10 dark:bg-amber-500/5 font-bold border-y border-amber-500/20">
                <td colSpan={2} className="px-3 py-2 text-right border-r border-amber-500/10 font-black text-amber-800 dark:text-amber-400">
                  PKT 002
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.wan.buruh}
                </td>
                <td className="px-3 py-2 text-right font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.wan.hektar.toFixed(2)}
                </td>
                <td colSpan={5} className="bg-amber-500/[0.02] border-r border-amber-500/10" />
                <td className="px-2 py-2 text-right font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.wan.hektarSiap > 0 ? stats.groups.wan.hektarSiap.toFixed(2) : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-600">
                  {stats.groups.wan.hektarSiap > 0 ? `${((stats.groups.wan.hektarSiap / stats.groups.wan.hektar) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.wan.tandanHarian}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.wan.capaiTandan > 0 ? stats.groups.wan.capaiTandan : "-"}
                </td>
                <td className="px-2 py-2 text-center font-mono font-black border-r border-amber-500/10 text-slate-700 dark:text-slate-300">
                  {stats.groups.wan.capaiTandan > 0 ? `${((stats.groups.wan.capaiTandan / stats.groups.wan.tandanHarian) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-3 py-2 text-center font-mono font-black border-r border-amber-500/20 text-rose-600 bg-rose-500/[0.04]">
                  {stats.groups.wan.backlog > 0 ? stats.groups.wan.backlog : "-"}
                </td>
                <td className="px-3 py-2 text-right font-mono font-black border-r border-amber-500/20 text-rose-700 dark:text-rose-400 bg-rose-500/[0.08]">
                  {stats.groups.wan.backlog > 0 ? stats.groups.wan.anggaranTan.toFixed(2) : "-"}
                </td>
                <td colSpan={1} />
              </tr>

              {/* PKT 001 & 002 (BLUE ROW) */}
              <tr className="bg-emerald-600 text-white dark:bg-emerald-700 font-extrabold text-[11px] border-y border-emerald-500">
                <td colSpan={2} className="px-3 py-3 text-right uppercase border-r border-emerald-500">
                  PKT 001 & 002
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.grand.buruh}
                </td>
                <td className="px-3 py-3 text-right font-mono border-r border-emerald-500">
                  {stats.grand.hektar.toFixed(2)}
                </td>
                <td colSpan={5} className="border-r border-emerald-500" />
                <td className="px-2 py-3 text-right font-mono border-r border-emerald-500">
                  {stats.grand.hektarSiap > 0 ? stats.grand.hektarSiap.toFixed(2) : "-"}
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.grand.hektarSiap > 0 ? `${((stats.grand.hektarSiap / stats.grand.hektar) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.grand.tandanHarian}
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.grand.capaiTandan > 0 ? stats.grand.capaiTandan : "-"}
                </td>
                <td className="px-2 py-3 text-center font-mono border-r border-emerald-500">
                  {stats.grand.capaiTandan > 0 ? `${((stats.grand.capaiTandan / stats.grand.tandanHarian) * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-3 py-3 text-center font-mono border-r border-emerald-500 bg-rose-600/25">
                  {stats.grand.backlog > 0 ? stats.grand.backlog : "-"}
                </td>
                <td className="px-3 py-3 text-right font-mono border-r border-emerald-500 bg-rose-600/35">
                  {stats.grand.backlog > 0 ? stats.grand.anggaranTan.toFixed(2) : "-"}
                </td>
                <td colSpan={1} />
              </tr>

              {/* FELDA GROUPS (001LF / 002LF) (ORANGE ROW STYLE) */}
              {BLOCKS_CONFIG.filter(b => b.group === 'FELDA').map((block) => {
                const rec = activeDateRecords[block.id];
                const activePus = calculateActivePus(rec);
                const pctSiap = block.defaultHektar > 0 ? ((rec.hektar_siap || 0) / block.defaultHektar) * 100 : 0;
                
                const buruh = rec.bil_buruh !== undefined ? rec.bil_buruh : block.defaultBuruh;
                const tandanHarian = rec.tandan_harian !== undefined ? rec.tandan_harian : block.defaultTandanHarian;
                const pctCapai = tandanHarian > 0 ? ((rec.capai_tandan || 0) / tandanHarian) * 100 : 0;
                const angTan = ((rec.backlog_diladang || 0) * rec.abw) / 1000;
                const isUpdatedOnDate = !!(backlogHistory[selectedDate] && backlogHistory[selectedDate][block.id]);

                const feldaLabel = block.id === '001LF' ? 'ADIB/ARIL' : 'KIROMIN';

                return (
                  <tr 
                    key={block.id} 
                    className={`transition-colors group cursor-pointer border-y border-amber-500/10 ${
                      isUpdatedOnDate 
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300" 
                        : "bg-amber-120/10 dark:bg-amber-900/10 hover:bg-amber-500/5 text-amber-900 dark:text-amber-300"
                    }`}
                    onClick={() => handleEditClick(block)}
                  >
                    <td className="px-3 py-2.5 font-black border-r border-amber-500/10 align-middle">
                      {feldaLabel}
                    </td>
                    <td className={`px-2 py-2.5 font-bold text-center border-r border-amber-500/10 transition-all ${
                      isUpdatedOnDate 
                        ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-black" 
                        : "bg-amber-500/5"
                    }`}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isUpdatedOnDate && <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0 font-black animate-pulse" />}
                        <span>{block.label}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10">
                      {buruh}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-amber-500/10">
                      {block.defaultHektar.toFixed(2)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10 text-slate-500">
                      {formatTarikhDmy(rec.pus1_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10 text-slate-500">
                      {formatTarikhDmy(rec.pus1_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10 text-slate-500">
                      {formatTarikhDmy(rec.pus2_mula)}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10 text-slate-500">
                      {formatTarikhDmy(rec.pus2_tamat)}
                    </td>
                    
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10 font-bold">
                      {activePus}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-right border-r border-amber-500/10 font-semibold">
                      {rec.hektar_siap > 0 ? rec.hektar_siap.toFixed(2) : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10">
                      {rec.hektar_siap > 0 ? `${pctSiap.toFixed(2)}%` : "-"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10 font-semibold">
                      {tandanHarian}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-center border-r border-amber-500/10">
                      {rec.capai_tandan > 0 ? rec.capai_tandan : "-"}
                    </td>
                    <td className={`px-2 py-2.5 font-mono text-center border-r border-amber-500/10 font-bold ${pctCapai >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {rec.capai_tandan > 0 ? `${pctCapai.toFixed(2)}%` : "-"}
                    </td>
                    
                    <td className="px-3 py-2.5 font-mono text-center border-r border-amber-500/10 font-black text-rose-600 bg-rose-500/[0.02]">
                      {rec.backlog_diladang > 0 ? rec.backlog_diladang : "-"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right border-r border-amber-500/10 font-black text-rose-700 dark:text-rose-400 bg-rose-500/[0.04]">
                      {rec.backlog_diladang > 0 ? angTan.toFixed(2) : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] relative">
                      <div className="flex justify-between items-center w-full">
                        <span className="italic text-[9px]">{rec.catatan || "-"}</span>
                        <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity ml-1 shrink-0" />
                      </div>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>

      {/* EDITING DRAWER / MODAL POPUP */}
      <AnimatePresence>
        {editingBlock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[30px] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
                      Edit Backlog Blok {editingBlock.label}
                    </h3>
                    <p className="text-[9px] text-slate-400 uppercase font-black">
                      Kawasan: {editingBlock.group} | {formatTarikhDmy(selectedDate)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingBlock(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                {/* DATES GRID */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Pus 1 Mula</label>
                    <input 
                      type="date"
                      value={editForm.pus1_mula}
                      onChange={(e) => setEditForm({ ...editForm, pus1_mula: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Pus 1 Tamat</label>
                    <input 
                      type="date"
                      value={editForm.pus1_tamat}
                      onChange={(e) => setEditForm({ ...editForm, pus1_tamat: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Pus 2 Mula</label>
                    <input 
                      type="date"
                      value={editForm.pus2_mula}
                      onChange={(e) => setEditForm({ ...editForm, pus2_mula: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Pus 2 Tamat</label>
                    <input 
                      type="date"
                      value={editForm.pus2_tamat}
                      onChange={(e) => setEditForm({ ...editForm, pus2_tamat: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                {/* HEKTAR & METRICS INPUTS */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Hektar Siap (Maks: {editingBlock.defaultHektar.toFixed(2)})</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editForm.hektar_siap === 0 ? '' : editForm.hektar_siap}
                      placeholder="0.00"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditForm({ ...editForm, hektar_siap: Math.max(0, val) });
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Capai Tandan (Bunch)</label>
                    <input 
                      type="number"
                      value={editForm.capai_tandan === 0 ? '' : editForm.capai_tandan}
                      placeholder="0"
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setEditForm({ ...editForm, capai_tandan: Math.max(0, val) });
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Backlog Diladang (TBS)</label>
                    <input 
                      type="number"
                      value={editForm.backlog_diladang === 0 ? '' : editForm.backlog_diladang}
                      placeholder="0"
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setEditForm({ ...editForm, backlog_diladang: Math.max(0, val) });
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">
                      Custom ABW Override (kg)
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editForm.custom_abw === 0 ? '' : editForm.custom_abw}
                      placeholder={`Auto (${getDynamicBlockAbw(editingBlock.id).toFixed(1)} kg)`}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditForm({ ...editForm, custom_abw: Math.max(0, val) });
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* EDITABLE MASTER FIELDS */}
                <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-955/15 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[7px] font-black uppercase text-slate-400 mb-1">Bilangan Buruh</label>
                    <input 
                      type="number"
                      value={editForm.bil_buruh}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setEditForm({ ...editForm, bil_buruh: Math.max(0, val) });
                      }}
                      className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none px-1 py-1 text-[11px] text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[7px] font-black uppercase text-slate-400 mb-1">Tandan Harian Sasaran</label>
                    <input 
                      type="number"
                      value={editForm.tandan_harian}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setEditForm({ ...editForm, tandan_harian: Math.max(0, val) });
                      }}
                      className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none px-1 py-1 text-[11px] text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* CATATAN */}
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Catatan / Tindakan Susulan</label>
                  <textarea 
                    value={editForm.catatan}
                    onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })}
                    placeholder="Masukkan ulasan tindakan..."
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={() => setEditingBlock(null)}
                  className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleEditSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-black scroll-py-2 px-5 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
                >
                  <Check size={12} /> Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* POPUP INFO CIRI BAHARU BACKLOG */}
        {showBacklogIntro && (
          <div key="backlog-intro-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
            >
              {/* Header Gradient */}
              <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <ClipboardCheck size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                      KEMAS KINI BAHARU
                    </span>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide mt-1">
                      Ciri Baharu Laporan Backlog
                    </h3>
                  </div>
                </div>
                <button
                  onClick={handleCloseIntro}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-5 text-slate-600 dark:text-slate-300 max-h-[70vh] overflow-y-auto">
                <p className="text-xs leading-relaxed font-semibold">
                  Sistem kini dikemaskini dengan ciri baharu untuk membolehkan pengurusan dan pemantauan tandan backlog di ladang dengan lebih tepat dan selamat.
                </p>

                <div className="space-y-4">
                  {/* Feature 1 */}
                  <div className="flex gap-3 items-start p-3.5 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                    <div className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg mt-0.5">
                      <span className="font-bold text-xs">01</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        1. Backlog - Tandan (Sebelum ini: BACKLOG (TBS))
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Data ini merujuk kepada <strong>bilangan tandan</strong> buah kelapa sawit yang masih tertinggal/belum diangkut di dalam kawasan blok. Klik mana-mana baris blok untuk mengemas kini bilangan tandan backlog dengan mudah.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex gap-3 items-start p-3.5 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg mt-0.5">
                      <span className="font-bold text-xs">02</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        2. Backlog - Tan (Sebelum ini: ANGGARAN TAN LDK)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Sistem mengira <strong>anggaran berat backlog dalam Tan</strong> secara automatik berdasarkan purata berat tandan terkini (ABW) blok tersebut bagi tarikh laporan yang dipilih. Tiada pengiraan manual diperlukan lagi!
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex gap-3 items-start p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg mt-0.5">
                      <span className="font-bold text-xs">03</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        3. Integrasi Cloud Supabase
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Semua perubahan data anda akan <strong>disimpan secara automatik</strong> dan disegerakkan dengan pangkalan data Supabase secara real-time. Data tidak akan hilang walaupun anda menukar peranti atau melayari dari pelayar lain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
                <button
                  onClick={handleCloseIntro}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase font-black px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check size={14} /> Faham & Mula Guna
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
