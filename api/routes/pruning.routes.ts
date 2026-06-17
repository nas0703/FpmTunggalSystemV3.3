import express from 'express';
import { getSupabase, isMissingTableError } from '../db.js';

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('hantaran_pruning')
      .select('*')
      .order('blok', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) return res.json([]); // Table doesn't exist yet
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/batch", async (req, res) => {
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

router.post("/", async (req, res) => {
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

export default router;
