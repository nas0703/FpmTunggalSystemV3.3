import express from 'express';
import { getSupabase, isMissingTableError } from '../db';

const router = express.Router();

// --- FERTILIZER (BAJA) MODULE ROUTES ---

router.get("/fertilizer/master", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_master_schedule')
      .select('*')
      .order('blok_code', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) return res.json([]);
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/fertilizer/master/batch", async (req, res) => {
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

router.get("/fertilizer/entries", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_daily_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) return res.json([]);
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/fertilizer/entries", async (req, res) => {
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

router.put("/fertilizer/entries/:id", async (req, res) => {
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

router.delete("/fertilizer/entries/:id", async (req, res) => {
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

router.post("/fertilizer/entries/batch", async (req, res) => {
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

router.get("/fertilizer/inventory", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) return res.json([]);
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/fertilizer/inventory", async (req, res) => {
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

router.get("/fertilizer/inventory/transactions", async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabase
      .from('fertilizer_inventory_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      if (isMissingTableError(error)) return res.json([]);
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/fertilizer/inventory/:id/transaction", async (req, res) => {
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

router.delete("/fertilizer/inventory/transactions/:id", async (req, res) => {
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

export default router;
