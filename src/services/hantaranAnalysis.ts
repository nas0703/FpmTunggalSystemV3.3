import { supabase } from '../config/supabaseClient'; // Placeholder for Supabase client

export interface HantaranData {
  wilayah: string;
  ladang: string;
  resit_no: string;
  lori_no: string;
  blok: string;
  berat_tan: number;
  bts_count: number;
}

export interface AnalysisResult {
  status: 'Normal' | 'Warning' | 'Alert';
  recommendation: string;
  metrics: {
    totalBerat: number;
    avgBtsWeight: number; // Purata berat setandan (BJR)
    totalBts: number;
    anomalies: string[];
  };
}

/**
 * Mencari anomali dan menganalisis prestasi hantaran mengikut standard industri.
 * Terutamanya memantau Berat Janjang Purata (BJR/ABW) di Peringkat 1 & 2.
 */
export async function analyzeHantaran(month?: number, year?: number): Promise<string> {
  try {
    // 1. Dapatkan data daripada Supabase (RLS diaktifkan secara lalai)
    let query = supabase.from('hantaran').select('*');
    
    // 2. Simulasi tapisan mengikut bulan/tahun (andaian ada column 'tarikh')
    // if (month && year) {
    //   query = query.filter('tarikh', 'gte', `${year}-${month}-01`);
    // }

    const { data: hantaran, error } = await query;

    if (error) throw error;
    if (!hantaran || hantaran.length === 0) {
       return JSON.stringify({
           status: 'Warning',
           recommendation: 'Tiada data hantaran ditemui untuk tempoh ini.',
           metrics: { totalBerat: 0, avgBtsWeight: 0, totalBts: 0, anomalies: [] }
       });
    }

    // 3. Pemprosesan Data (Kalkulasi metrik)
    let totalBerat = 0;
    let totalBts = 0;
    const anomalies: string[] = [];

    hantaran.forEach((rekod: HantaranData) => {
        totalBerat += rekod.berat_tan;
        totalBts += rekod.bts_count;

        // Semak anomali: Contohnya berat > 30 tan untuk 1 buah lori adalah tidak biasa
        if (rekod.berat_tan > 30) {
            anomalies.push(`Resit ${rekod.resit_no} (Lori ${rekod.lori_no}) mencatat berat anomali: ${rekod.berat_tan} Tan.`);
        }
    });

    // BJR = Berat Janjang Purata (Average Bunch Weight) dalam KG
    // berat_tan * 1000 = KG
    const avgBtsWeight = totalBts > 0 ? (totalBerat * 1000) / totalBts : 0;

    // 4. Analisis Berdasarkan Edge Cases (Threshold BJR untuk Peringkat 1/2)
    let status: 'Normal' | 'Warning' | 'Alert' = 'Normal';
    let recommendation = '';

    if (avgBtsWeight < 15) {
        status = 'Alert';
        recommendation = 'BJR/ABW di bawah tahap kritikal (kurang 15kg/tandan). Periksa kualiti pendebungaan atau kekurangan nutrien/baja di blok Peringkat 1 & 2 dengan kadar SEGERA.';
    } else if (avgBtsWeight >= 15 && avgBtsWeight < 18) {
        status = 'Warning';
        recommendation = 'BJR/ABW pada paras sederhana. Sila pantau pusingan tuai dan pastikan tiada buah putik dituai di Peringkat 1 & 2.';
    } else {
        status = 'Normal';
        recommendation = 'Prestasi BJR optimum (>18kg/tandan). Teruskan rutin pembajaan dan amalan pertanian yang baik (GAP).';
    }

    if (anomalies.length > 0) {
        status = 'Alert';
        recommendation += ' Laporan juga mengesan kes-kes lori yang melebihi muatan biasa (over-capacity). Sila semak dengan kilang buah (POM).';
    }

    // 5. Kembalikan jawapan dalam format JSON berstruktur untuk frontend
    const result: AnalysisResult = {
        status,
        recommendation,
        metrics: {
            totalBerat,
            avgBtsWeight: Number(avgBtsWeight.toFixed(2)),
            totalBts,
            anomalies
        }
    };

    return JSON.stringify(result, null, 2);

  } catch (error: any) {
    console.error('Database Error:', error);
    return JSON.stringify({
        status: 'Alert',
        recommendation: `Ralat sistem dikesan: ${error.message}. Sila semak Row Level Security (RLS) di Supabase.`,
        metrics: null
    });
  }
}
