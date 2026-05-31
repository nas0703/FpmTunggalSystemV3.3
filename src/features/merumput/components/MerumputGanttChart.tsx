import React, { useState } from 'react';
import { Calendar, Info, SlidersHorizontal } from 'lucide-react';
import { MerumputProgress } from '../types';

interface MerumputGanttChartProps {
  data: MerumputProgress[];
  isDarkMode?: boolean;
}

export const MerumputGanttChart: React.FC<MerumputGanttChartProps> = ({ data, isDarkMode }) => {
  const [selectedJenis, setSelectedJenis] = useState<string>('ALL');

  // Helper to partition and calculate progress with correct blocks (1-17 for PKT 1, 18-22 for PKT 2, 88/LF for FELDA)
  const getSubProgress = (startBlok: number, endBlok: number, isFelda: boolean, pusingan: number) => {
    const subData = data.filter(d => {
      if (d.pusingan !== pusingan) return false;
      if (selectedJenis !== 'ALL' && d.jenis !== selectedJenis) return false;

      const isRecordFelda = d.blok === '88' || d.blok === 'LF';
      if (isFelda) {
        return isRecordFelda;
      } else {
        if (isRecordFelda) return false;
        const bNum = parseInt(d.blok);
        return !isNaN(bNum) && bNum >= startBlok && bNum <= endBlok;
      }
    });
    
    const total = subData.reduce((acc, curr) => acc + curr.luas, 0);
    const completed = subData.reduce((acc, curr) => acc + curr.hek_siap, 0);
    return {
      pct: total > 0 ? parseFloat(((completed / total) * 100).toFixed(0)) : 0,
      total,
      completed
    };
  };

  // PKT 1 - Blocks 1 to 17
  const pkt1p1 = getSubProgress(1, 17, false, 1);
  const pkt1p2 = getSubProgress(1, 17, false, 2);

  // PKT 2 - Blocks 18 to 22
  const pkt2p1 = getSubProgress(18, 22, false, 1);
  const pkt2p2 = getSubProgress(18, 22, false, 2);

  // FELDA - Blocks 88 and LF
  const feldap1 = getSubProgress(0, 0, true, 1);
  const feldap2 = getSubProgress(0, 0, true, 2);

  const rows = [
    {
      label: 'PKT 1 P1',
      percentage: pkt1p1.pct,
      season: 1,
      theme: {
        trackBg: 'bg-emerald-500/10 dark:bg-emerald-500/5',
        barBg: 'bg-emerald-500 shadow-sm shadow-emerald-500/20',
        textColor: 'text-emerald-600 dark:text-emerald-400'
      }
    },
    {
      label: 'PKT 2 P1',
      percentage: pkt2p1.pct,
      season: 1,
      theme: {
        trackBg: 'bg-blue-500/10 dark:bg-blue-500/5',
        barBg: 'bg-blue-500 shadow-sm shadow-blue-500/20',
        textColor: 'text-blue-600 dark:text-blue-400'
      }
    },
    {
      label: 'FELDA P1',
      percentage: feldap1.pct,
      season: 1,
      theme: {
        trackBg: 'bg-amber-500/10 dark:bg-amber-500/5',
        barBg: 'bg-amber-500 shadow-sm shadow-amber-500/20',
        textColor: 'text-amber-650 dark:text-amber-400'
      }
    },
    {
      label: 'PKT 1 P2',
      percentage: pkt1p2.pct,
      season: 2,
      theme: {
        trackBg: 'bg-emerald-500/10 dark:bg-emerald-500/5',
        barBg: 'bg-emerald-400 shadow-sm shadow-emerald-400/20',
        textColor: 'text-emerald-500'
      }
    },
    {
      label: 'PKT 2 P2',
      percentage: pkt2p2.pct,
      season: 2,
      theme: {
        trackBg: 'bg-blue-500/10 dark:bg-blue-500/5',
        barBg: 'bg-blue-400 shadow-sm shadow-blue-400/20',
        textColor: 'text-blue-500'
      }
    },
    {
      label: 'FELDA P2',
      percentage: feldap2.pct,
      season: 2,
      theme: {
        trackBg: 'bg-amber-500/10 dark:bg-amber-500/5',
        barBg: 'bg-amber-400 shadow-sm shadow-amber-400/20',
        textColor: 'text-amber-500'
      }
    }
  ];

  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-[24px] shadow-lg space-y-3.5 text-left">
      {/* Header and Badge with Colored Red Circle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-500/30">
            <Calendar size={14} className="stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider font-display">
              Gantt Chart : Program Dan Kemajuan Kerja Merumput
            </h4>
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-full text-[8px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
          TAHUN 2026
        </div>
      </div>

      {/* Category selection for Gantt chart view */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-50 dark:bg-slate-950/25 p-2 rounded-xl border border-slate-100 dark:border-slate-800/45">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={11} className="text-teal-500" />
          <h4 className="text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            TAPISAN AKTIVITI GANTT
          </h4>
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'ALL', label: 'SEMUA ELEMEN' },
            { id: 'BULATAN & LORONG', label: 'BULATAN & LORONG' },
            { id: 'DADA (R&S)', label: 'DADA (R&S)' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedJenis(c.id)}
              className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border ${
                selectedJenis === c.id
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative border border-slate-100 dark:border-slate-800/60 rounded-xl p-2.5 overflow-x-auto min-w-full">
        {/* Matrix Gantt Box - Width reduced by 40% (from 580px to 350px) with original comfortable row spacing */}
        <div className="min-w-[350px] space-y-4">
          
          {rows.map((row, index) => {
            // Season 1: columns 1-6 (left 50%); Season 2: columns 7-12 (right 50%)
            const isSeason1 = row.season === 1;
            const progressPct = row.percentage;
            
            return (
              <div key={index} id={`gantt-row-${index}`} className="flex items-center text-xs">
                {/* Row Label - Readable space and size */}
                <span className="w-16 shrink-0 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  {row.label}
                </span>

                {/* Timeline Grid (12 Columns with monthly grids) */}
                <div className="flex-1 relative h-6 flex items-center">
                  {/* Grid background month separators (Dotted grid vertical lines matching screenshots perfectly) */}
                  <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="border-r border-dotted border-slate-200 dark:border-slate-800 h-full last:border-r-0" />
                    ))}
                  </div>

                  {/* Planned Target Timeline Background and Actual Solid Progress Pill */}
                  <div className="absolute inset-0 grid grid-cols-2 h-full py-1">
                    {isSeason1 ? (
                      // Pusingan 1 (Jan-Jun) track
                      <div className="col-start-1 col-span-1 h-full relative">
                        <div className={`absolute inset-y-0.5 left-0 right-0 rounded-full h-4 ${row.theme.trackBg} flex items-center`}>
                          {progressPct > 0 && (
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${row.theme.barBg}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          )}
                          <span className={`absolute left-full ml-1.5 text-[9px] font-black ${row.theme.textColor}`}>
                            {progressPct}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Pusingan 2 (Jul-Dis) track
                      <div className="col-start-2 col-span-1 h-full relative">
                        <div className={`absolute inset-y-0.5 left-0 right-0 rounded-full h-4 ${row.theme.trackBg} flex items-center`}>
                          {progressPct > 0 && (
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${row.theme.barBg}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          )}
                          <span className={`absolute left-full ml-1.5 text-[9px] font-black ${row.theme.textColor}`}>
                            {progressPct}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}

          {/* Month Labels X-Axis at bottom */}
          <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="w-16 shrink-0"></span>
            <div className="flex-1 grid grid-cols-12 text-center select-none">
              {months.map((m, i) => (
                <span key={i} className="truncate">
                  {m}
                </span>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Legends info */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40" />
          <span>TEMPOH SASARAN (P1 / P2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>TEMPOH PELAKSANAAN LUAR</span>
        </div>
      </div>

      {/* Info card box */}
      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 flex items-start gap-2 border border-slate-100 dark:border-slate-800/40">
        <Info size={14} className="text-teal-500 shrink-0 mt-0.5" />
        <p className="text-[9px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          <strong>Perancangan Pusingan:</strong> Pusingan 1 (P1) disasarkan siap dalam tempoh Januari sehingga Jun. Selebihnya, Pusingan 2 (P2) disasarkan siap dari Julai sehingga Disember. Peratusan dihitung dinamik.
        </p>
      </div>
    </div>
  );
};
