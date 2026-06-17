import express from 'express';
import { getSupabase, isMissingTableError } from '../db';

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

export default router;
