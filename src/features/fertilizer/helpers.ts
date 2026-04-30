
import { PUS_CONFIG, PUS_TYPE } from './types';

/**
 * Mendapatkan maklumat konfigurasi berasaskan PUS
 */
export const getPusInfo = (pus: number) => {
  return PUS_CONFIG[pus as PUS_TYPE] || {
    fertilizer: 'TIDAK DIKETAHUI',
    interval: '-',
    category: '-'
  };
};

/**
 * Mengira produktiviti harian
 */
export const calculateProductivity = (totalBeg: number, workers: number): number => {
  if (workers <= 0) return 0;
  return parseFloat((totalBeg / workers).toFixed(2));
};

/**
 * Threshold Status logic
 * Hijau: >= 90%
 * Kuning: 70% - 89%
 * Merah: < 70%
 */
export const getProgressStatus = (percentage: number) => {
  if (percentage >= 90) return { label: 'On Track', color: 'bg-emerald-500', text: 'text-emerald-500' };
  if (percentage >= 70) return { label: 'Warning', color: 'bg-amber-500', text: 'text-amber-500' };
  return { label: 'Behind', color: 'bg-rose-500', text: 'text-rose-500' };
};

/**
 * Mengira progress peratusan
 */
export const calculateProgress = (actual: number, target: number): number => {
  if (target <= 0) return 0;
  return parseFloat(((actual / target) * 100).toFixed(1));
};
