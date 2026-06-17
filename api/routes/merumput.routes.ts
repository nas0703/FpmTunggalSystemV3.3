import express from 'express';
import { getSupabase, isMissingTableError } from '../db.js';
import { getLocalMerumputProgress, saveLocalMerumputProgress, getLocalMerumputInventory, saveLocalMerumputInventory, getLocalMerumputTransactions, saveLocalMerumputTransactions } from '../local.js';

const router = express.Router();

// --- MERUMPUT MODULE ENDPOINTS ---

router.get("/merumput/progress", async (req, res) => {
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

router.post("/merumput/progress/batch", async (req, res) => {
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

router.post("/merumput/progress", async (req, res) => {
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

router.get("/merumput/inventory", async (req, res) => {
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

router.post("/merumput/inventory", async (req, res) => {
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

router.get("/merumput/inventory/transactions", async (req, res) => {
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

router.post("/merumput/inventory/:id/transaction", async (req, res) => {
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

router.delete("/merumput/inventory/transactions/:id", async (req, res) => {
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

    await supabase.from('merumput_inventory').update({ quantity: revertedQty, updated_at: new Date().toISOString() }).eq('id', tx.inventory_id);
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


export default router;
