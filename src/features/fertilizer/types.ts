
import { z } from 'zod';

export type PUS_TYPE = 1 | 2 | 3 | 4;

export const PUS_CONFIG = {
  1: {
    fertilizer: 'COMPACT FELDA 12',
    interval: 'FEB',
    category: 'COMPACT'
  },
  2: {
    fertilizer: 'FELDA Organic',
    interval: 'APRIL',
    category: 'ORGANIC'
  },
  3: {
    fertilizer: 'FELDA Organic',
    interval: 'JUN',
    category: 'ORGANIC'
  },
  4: {
    fertilizer: 'COMPACT FELDA 12',
    interval: 'OGOS',
    category: 'COMPACT'
  }
} as const;

export interface FertilizerMasterSchedule {
  id?: string;
  blok_code: string;
  luas_ha: number;
  dirian: number;
  pokok: number;
  pus1_beg: number;
  pus2_beg: number;
  pus3_beg: number;
  pus4_beg: number;
  compact_total_beg: number;
  organic_total_beg: number;
  grand_total_beg: number;
  created_at?: string;
  updated_at?: string;
}

export interface FertilizerDailyEntry {
  id?: string;
  entry_date: string;
  blok_code: string;
  pus: PUS_TYPE;
  interval_name: string;
  fertilizer_type: string;
  workers_count: number;
  total_beg_completed: number;
  productivity_beg_per_worker: number;
  target_beg_for_selected_pus: number;
  note?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const DailyEntrySchema = z.object({
  entry_date: z.string().min(1, 'Tarikh diperlukan'),
  blok_code: z.string().min(1, 'Blok diperlukan'),
  pus: z.number().min(1).max(4),
  workers_count: z.number().int().positive('Bilangan pekerja mesti positif'),
  total_beg_completed: z.number().nonnegative('Jumlah beg mesti positif'),
  note: z.string().optional()
});
