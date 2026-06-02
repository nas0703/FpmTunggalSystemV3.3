-- SQL Script to fix Supabase RLS policy for the table "hujan_rekod"
-- Sila salin dan jalankan kod SQL ini di dalam "SQL Editor" panel di dashboard Supabase anda.

-- 1. Pastikan Row Level Security (RLS) aktif pada jadual 'hujan_rekod'
ALTER TABLE "hujan_rekod" ENABLE ROW LEVEL SECURITY;

-- 2. Gugurkan polisi lama jika wujud
DROP POLICY IF EXISTS "Enable all access for hujan_rekod" ON "hujan_rekod";

-- 3. Cipta polisi baru untuk membenarkan semua operasi (SELECT, INSERT, UPDATE, DELETE) dari aplikasi (anon/authenticated)
CREATE POLICY "Enable all access for hujan_rekod" ON "hujan_rekod"
FOR ALL
USING (true)
WITH CHECK (true);
