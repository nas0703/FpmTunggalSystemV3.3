import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { TrendingUp, FileSpreadsheet, Plus, X } from 'lucide-react';
import { CHART_COLORS, ABW_DATA } from '../../../utils/constants';

export const AbwView: React.FC = () => {
  const [showABWModal, setShowABWModal] = useState(false);
  const [newAbwRecord, setNewAbwRecord] = useState<any>({ month: "" });
  
  const [abwHistory, setAbwHistory] = useState<Record<string, Record<string, number[]>>>(() => {
    const hist: any = {};
    ABW_DATA.forEach((d: any) => {
      hist[d.month] = {};
      for (let i = 1; i <= 22; i++) {
        if (d[i] !== undefined && d[i] !== 0) {
           hist[d.month][i] = [d[i]];
        } else {
           hist[d.month][i] = [];
        }
      }
    });

    const saved = localStorage.getItem("fpm_abw_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return hist;
  });

  const abwDataState = useMemo(() => {
    const result = [];
    const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
    for (const m of months) {
        if (!abwHistory[m]) continue;
        const record = { month: m } as any;
        let pkt1Sum = 0, pkt1Count = 0;
        let pkt2Sum = 0, pkt2Count = 0;
        for (let i = 1; i <= 22; i++) {
             const vals = abwHistory[m][i] || [];
             if (vals.length > 0) {
                 const avg = vals.reduce((a:number,b:number)=>a+b,0) / vals.length;
                 record[i] = avg;
                 if (i <= 17) {
                     pkt1Sum += avg;
                     pkt1Count++;
                 } else {
                     pkt2Sum += avg;
                     pkt2Count++;
                 }
             } else {
                 record[i] = 0;
             }
        }
        record.avg1 = pkt1Count > 0 ? pkt1Sum / pkt1Count : 0;
        record.avg2 = pkt2Count > 0 ? pkt2Sum / pkt2Count : 0;
        result.push(record);
    }
    
    setTimeout(() => {
        localStorage.setItem("fpm_abw_history", JSON.stringify(abwHistory));
    }, 100);
    return result;
  }, [abwHistory]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ABW Input Modal */}
      {showABWModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" />
                Tambah Data ABW
              </h3>
              <button onClick={() => setShowABWModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 transition-colors active:scale-95">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bulan</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  value={newAbwRecord.month || ""}
                  onChange={(e) => setNewAbwRecord({ ...newAbwRecord, month: e.target.value })}
                >
                  <option value="" disabled>Pilih Bulan</option>
                  <option value="Jan">Januari</option>
                  <option value="Feb">Februari</option>
                  <option value="Mac">Mac</option>
                  <option value="Apr">April</option>
                  <option value="Mei">Mei</option>
                  <option value="Jun">Jun</option>
                  <option value="Jul">Julai</option>
                  <option value="Ogo">Ogos</option>
                  <option value="Sep">September</option>
                  <option value="Okt">Oktober</option>
                  <option value="Nov">November</option>
                  <option value="Dis">Disember</option>
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Data PKT 001 (Blok 1-17)</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Array.from({length: 17}, (_, i) => String(i + 1)).map(blok => (
                    <div key={blok}>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Blok {blok}</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        value={newAbwRecord[blok] || ""}
                        onChange={(e) => setNewAbwRecord({ ...newAbwRecord, [blok]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mt-4">Data PKT 002 (Blok 18-22)</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Array.from({length: 5}, (_, i) => String(i + 18)).map(blok => (
                    <div key={blok}>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Blok {blok}</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        value={newAbwRecord[blok] || ""}
                        onChange={(e) => setNewAbwRecord({ ...newAbwRecord, [blok]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => {
                    if (!newAbwRecord.month) {
                      alert("Sila pilih bulan.");
                      return;
                    }
                    const month = newAbwRecord.month;
                    
                    setAbwHistory(prev => {
                        const newState = { ...prev };
                        if (!newState[month]) {
                            newState[month] = {};
                            for(let i=1; i<=22; i++) newState[month][i] = [];
                        } else {
                            // Deep copy the month
                            newState[month] = { ...newState[month] };
                        }
                        
                        // Parse string entries with commas (e.g. "21.5, 22.1")
                        for (let i = 1; i <= 22; i++) {
                            if (newAbwRecord[i]) {
                                const valStr = String(newAbwRecord[i]);
                                const parts = valStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
                                
                                if (parts.length > 0) {
                                    newState[month][i] = [...(newState[month][i] || []), ...parts];
                                }
                            }
                        }
                        return newState;
                    });
                    
                    setShowABWModal(false);
                    setNewAbwRecord({ month: "" });
                }}
                className="flex-1 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95"
              >
                Simpan Data
              </button>
              <button
                onClick={() => setShowABWModal(false)}
                className="px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABW Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-xl border border-slate-100 dark:border-slate-800">
         <div className="flex justify-between items-center mb-2">
             <h3 className="text-[14px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={16} />
               Prestasi ABW 2026 (PKT 001 vs PKT 002)
             </h3>
             <button 
              onClick={() => setShowABWModal(true)} 
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
             >
                <Plus size={14} /> KEMASKINI
             </button>
         </div>
         <div className="h-[300px] w-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={abwDataState} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: CHART_COLORS.gray, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: CHART_COLORS.gray }} dx={-10} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(value) => Number(value).toFixed(2)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--tw-prose-bg, white)", borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", fontWeight: "bold", fontSize: "12px", color: "#1e293b" }}
                  itemStyle={{ fontWeight: 800 }}
                  formatter={(value: any) => [Number(value).toFixed(2), undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: "bold", paddingTop: "20px" }} />
                <Line type="monotone" dataKey="avg1" name="Purata PKT 001" stroke={CHART_COLORS.emerald} strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: "#fff", stroke: CHART_COLORS.emerald }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="avg2" name="Purata PKT 002" stroke={CHART_COLORS.gray} strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: "#fff", stroke: CHART_COLORS.gray }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <TrendingUp size={120} />
        </div>
        
        <h3 className="text-[14px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-6">
          <FileSpreadsheet size={16} />
          Rekod ABW (kg) - Sepanjang Tahun
        </h3>

        <div className="overflow-x-auto rounded-xl border border-emerald-100 dark:border-emerald-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-800">PKT</th>
                <th className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-800">Blok</th>
                {abwDataState.map(d => <th key={d.month} className="px-4 py-3 border-b border-emerald-100 dark:border-emerald-800 text-center">{d.month} (kg)</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 dark:divide-emerald-800/50 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {/* PKT 001 */}
              {Array.from({length: 17}, (_, i) => String(i + 1)).map(blok => (
                <tr key={blok} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-colors">
                  {blok === "1" && <td rowSpan={17} className="px-4 py-2 border-r border-emerald-100 dark:border-emerald-800 text-center align-top pt-4">001</td>}
                  <td className="px-4 py-2 border-r border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-500">{blok}</td>
                  {abwDataState.map(d => (
                    <td key={`${d.month}-${blok}`} className="px-4 py-2 text-center text-slate-600 dark:text-slate-400">{(d as any)[blok]?.toFixed(2)}</td>
                  ))}
                </tr>
              ))}
              <tr className="bg-emerald-500 text-white dark:bg-emerald-600 shadow-sm relative z-10">
                <td colSpan={2} className="px-4 py-3 font-black text-right border-r border-emerald-400 dark:border-emerald-500 uppercase flex-1 whitespace-nowrap">Purata PKT 001</td>
                {abwDataState.map(d => (
                  <td key={`avg1-${d.month}`} className="px-4 py-3 text-center font-black">{d.avg1.toFixed(2)}</td>
                ))}
              </tr>
              
              {/* PKT 002 */}
              {Array.from({length: 5}, (_, i) => String(i + 18)).map(blok => (
                <tr key={blok} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-colors">
                  {blok === "18" && <td rowSpan={5} className="px-4 py-2 border-r border-emerald-100 dark:border-emerald-800 text-center align-top pt-4">002</td>}
                  <td className="px-4 py-2 border-r border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-500">{blok}</td>
                  {abwDataState.map(d => (
                    <td key={`${d.month}-${blok}`} className="px-4 py-2 text-center text-slate-600 dark:text-slate-400">{(d as any)[blok]?.toFixed(2)}</td>
                  ))}
                </tr>
              ))}
              <tr className="bg-emerald-500 text-white dark:bg-emerald-600 shadow-sm relative z-10">
                <td colSpan={2} className="px-4 py-3 font-black text-right border-r border-emerald-400 dark:border-emerald-500 uppercase whitespace-nowrap">Purata PKT 002</td>
                {abwDataState.map(d => (
                  <td key={`avg2-${d.month}`} className="px-4 py-3 text-center font-black">{d.avg2.toFixed(2)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
