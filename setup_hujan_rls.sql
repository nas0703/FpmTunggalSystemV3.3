-- SQL Script to create and secure "hujan_rekod" table in Supabase
-- Sila salin dan jalankan kod SQL ini di dalam "SQL Editor" panel di dashboard Supabase anda.

-- 1. Cipta jadual 'hujan_rekod' jika belum wujud
CREATE TABLE IF NOT EXISTS "hujan_rekod" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "bulan" VARCHAR(10) NOT NULL,
  "tahun" VARCHAR(4) NOT NULL,
  "jumlah" DECIMAL DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT "hujan_rekod_unique" UNIQUE ("bulan", "tahun")
);

-- 2. Pastikan Row Level Security (RLS) aktif pada jadual 'hujan_rekod'
ALTER TABLE "hujan_rekod" ENABLE ROW LEVEL SECURITY;

-- 3. Gugurkan polisi lama jika wujud
DROP POLICY IF EXISTS "Enable all access for hujan_rekod" ON "hujan_rekod";

-- 4. Cipta polisi baru untuk membenarkan semua operasi (SELECT, INSERT, UPDATE, DELETE) dari aplikasi (anon/authenticated)
CREATE POLICY "Enable all access for hujan_rekod" ON "hujan_rekod"
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Cipta index untuk carian cepat
CREATE INDEX IF NOT EXISTS "idx_hujan_rekod_tahun" ON "hujan_rekod"("tahun");

