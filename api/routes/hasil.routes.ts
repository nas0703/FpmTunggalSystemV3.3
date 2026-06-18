import express from 'express';
import { getSupabase, isMissingTableError } from '../db.js';

const router = express.Router();

// --- HASIL ABW HISTORY ENDPOINTS ---

router.get("/hasil/abw", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    // Try fetching from the new table
    const { data, error } = await supabase.from('hasil_abw_history').select('*');
    
    if (error) {
      if (error.code === '42P01') {
         // Table does not exist yet! This is a soft fallback to empty data
         return res.json({ abwHistory: {}, feldaAbwHistory: {} });
      }
      throw error;
    }

    const payload = { abwHistory: {}, feldaAbwHistory: {} };
    if (data) {
      data.forEach(row => {
        if (row.category === 'abwHistory') payload.abwHistory = row.data;
        if (row.category === 'feldaAbwHistory') payload.feldaAbwHistory = row.data;
      });
    }

    res.json(payload);
  } catch (err: any) {
    console.error("GET /api/hasil/abw error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/hasil/abw", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { abwHistory, feldaAbwHistory } = req.body;

    if (abwHistory) {
      const { error: err1 } = await supabase.from('hasil_abw_history')
                                            .upsert({ category: 'abwHistory', data: abwHistory, updated_at: new Date().toISOString() }, { onConflict: 'category' });
      if (err1 && err1.code !== '42P01') console.error("Error upserting abwHistory:", err1);
    }
    
    if (feldaAbwHistory) {
      const { error: err2 } = await supabase.from('hasil_abw_history')
                                            .upsert({ category: 'feldaAbwHistory', data: feldaAbwHistory, updated_at: new Date().toISOString() }, { onConflict: 'category' });
      if (err2 && err2.code !== '42P01') console.error("Error upserting feldaAbwHistory:", err2);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/hasil/abw error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- HASIL BBC HISTORY ENDPOINTS ---

router.get("/hasil/bbc", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    // Try fetching from the new dedicated bbc table
    let { data, error } = await supabase.from('hasil_bbc_history').select('*');

    if (error) {
      if (error.code === '42P01') {
         // Table doesn't exist yet! Soft fallback to empty data
         return res.json({ bbcHistory: {}, feldaBbcHistory: {} });
      }
      throw error;
    }

    const payload = { bbcHistory: {}, feldaBbcHistory: {} };
    if (data) {
      data.forEach(row => {
        if (row.category === 'bbcHistory') payload.bbcHistory = row.data;
        if (row.category === 'feldaBbcHistory') payload.feldaBbcHistory = row.data;
      });
    }

    res.json(payload);
  } catch (err: any) {
    console.error("GET /api/hasil/bbc error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/hasil/bbc", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { bbcHistory, feldaBbcHistory } = req.body;

    // We store strictly to table `hasil_bbc_history`
    if (bbcHistory) {
      let { error: err1 } = await supabase.from('hasil_bbc_history')
                                            .upsert({ category: 'bbcHistory', data: bbcHistory, updated_at: new Date().toISOString() }, { onConflict: 'category' });
      if (err1) {
        if (err1.code === '42P01') {
          console.warn("hasil_bbc_history table does not exist. Run create_bbc_table.sql first.");
        } else {
          console.error("Error upserting bbcHistory to primary:", err1);
        }
      }
    }
    
    if (feldaBbcHistory) {
      let { error: err2 } = await supabase.from('hasil_bbc_history')
                                            .upsert({ category: 'feldaBbcHistory', data: feldaBbcHistory, updated_at: new Date().toISOString() }, { onConflict: 'category' });
      if (err2) {
        if (err2.code === '42P01') {
          console.warn("hasil_bbc_history table does not exist. Run create_bbc_table.sql first.");
        } else {
          console.error("Error upserting feldaBbcHistory to primary:", err2);
        }
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/hasil/bbc error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
