-- SQL Script to disable Supabase RLS policy for the table "hujan_rekod"
-- Sila salin dan jalankan kod SQL ini di dalam "SQL Editor" panel di dashboard Supabase anda.

-- 1. Matikan Row Level Security (RLS) pada jadual 'hujan_rekod'
ALTER TABLE "hujan_rekod" DISABLE ROW LEVEL SECURITY;
