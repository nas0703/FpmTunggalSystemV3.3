-- SQL Script to disable Row Level Security (RLS) on all tables inside Supabase.
-- Run this in your Supabase SQL Editor to make sure the app can read, write, edit, and delete without restriction!

ALTER TABLE IF EXISTS "fertilizer_master_schedule" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "fertilizer_daily_entries" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "fertilizer_inventory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "fertilizer_inventory_transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "hantaran_pruning" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "monthly_targets" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "merumput_progress" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "merumput_inventory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "merumput_inventory_transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "hujan_rekod" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "hasil_abw_history" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "hantaran" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "hantaran_hasil" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "annual_yield" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "block_annual_yields" DISABLE ROW LEVEL SECURITY;
