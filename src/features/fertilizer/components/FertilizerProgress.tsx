
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ExcelJS from 'exceljs';
import { 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Users, 
  Package, 
  ArrowRight,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  CircleDashed,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { calculateProgress, getProgressStatus } from '../helpers';

// ... (keep the rest of imports and component setup, modify within component to add export function and button)

export const FertilizerProgress: React.FC = () => {
  const [master, setMaster] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [activePus, setActivePus] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, eRes] = await Promise.all([
          fetch('/api/fertilizer/master'),
          fetch('/api/fertilizer/entries')
        ]);
        const [mData, eData] = await Promise.all([
          mRes.json().then(d => Array.isArray(d) ? d : []),
          eRes.json().then(d => Array.isArray(d) ? d : [])
        ]);
        setMaster(mData);
        setEntries(eData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const today = new Date().toISOString().split('T')[0];
  const entriesArray = Array.isArray(entries) ? entries : [];
  const masterArray = Array.isArray(master) ? master : [];

  const processedData = masterArray
    .filter(m => m.blok_code.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(m => {
      const pEntries = entriesArray.filter(e => e.blok_code === m.blok_code && e.pus === activePus);
      const target = m[`pus${activePus}_beg`] || 0;
      
      const taburHariIni = pEntries.filter(e => e.entry_date === today).reduce((acc, curr) => acc + curr.total_beg_completed, 0);
      const buruhHariIni = pEntries.filter(e => e.entry_date === today).reduce((acc, curr) => acc + curr.workers_count, 0);
      
      const taburHinggaKini = pEntries.reduce((acc, curr) => acc + curr.total_beg_completed, 0);
      const buruhHinggaKini = pEntries.reduce((acc, curr) => acc + curr.workers_count, 0);
      
      const peratus = calculateProgress(taburHinggaKini, target);
      
      const compactDate = (ts: number) => {
        const d = new Date(ts);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
      };

      const dates = pEntries.map(e => new Date(e.entry_date).getTime());
      const tarikhMula = dates.length > 0 ? compactDate(Math.min(...dates)) : '-';
      const tarikhTamat = peratus >= 100 ? (dates.length > 0 ? compactDate(Math.max(...dates)) : '-') : 'DALAM PROSES';

      return {
        blok: m.blok_code,
        target,
        taburHariIni,
        buruhHariIni,
        buruhHinggaKini,
        taburHinggaKini,
        peratus,
        tarikhMula,
        tarikhTamat,
        status: peratus >= 100 ? 'Siap' : taburHinggaKini > 0 ? 'Proses' : 'Belum'
      };
    })
    .filter(row => {
      if (filterStatus === 'completed') return row.peratus >= 100;
      if (filterStatus === 'incomplete') return row.peratus < 100;
      return true;
    })
    .sort((a, b) => {
      // Sort numerically by block code
      return parseInt(a.blok) - parseInt(b.blok);
    });

  const totals = {
    target: processedData.reduce((acc, curr) => acc + curr.target, 0),
    taburHariIni: processedData.reduce((acc, curr) => acc + curr.taburHariIni, 0),
    taburHinggaKini: processedData.reduce((acc, curr) => acc + curr.taburHinggaKini, 0),
    buruhHariIni: processedData.reduce((acc, curr) => acc + curr.buruhHariIni, 0),
    buruhHinggaKini: processedData.reduce((acc, curr) => acc + curr.buruhHinggaKini, 0),
  };

  const handleExportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet(`Laporan Baja PUS ${activePus}`);

      ws.pageSetup.orientation = "landscape";
      ws.pageSetup.fitToPage = true;
      ws.pageSetup.fitToWidth = 1;

      // Title
      ws.mergeCells("A1:K1");
      const titleCell = ws.getCell("A1");
      titleCell.value = `LAPORAN BAJA PUS ${activePus}`;
      titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF000000" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(1).height = 30;

      // Date
      ws.mergeCells("A2:K2");
      const dateCell = ws.getCell("A2");
      dateCell.value = `DIJANA PADA: ${new Date().toLocaleDateString("ms-MY")} ${new Date().toLocaleTimeString("ms-MY")}`;
      dateCell.font = { name: "Arial", size: 10, italic: true };
      dateCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(2).height = 20;

      // Header Row 1
      ws.mergeCells("A4:A5");
      ws.getCell("A4").value = "BLOK";
      ws.mergeCells("B4:B5");
      ws.getCell("B4").value = "TARGET (BEG)";
      
      ws.mergeCells("C4:D4");
      ws.getCell("C4").value = "TABUR (BEG)";
      ws.getCell("C5").value = "HI";
      ws.getCell("D5").value = "HHI";

      ws.mergeCells("E4:F4");
      ws.getCell("E4").value = "BURUH";
      ws.getCell("E5").value = "HI";
      ws.getCell("F5").value = "HHI";

      ws.mergeCells("G4:G5");
      ws.getCell("G4").value = "% CAPAI";

      ws.mergeCells("H4:I4");
      ws.getCell("H4").value = "TARIKH";
      ws.getCell("H5").value = "MULA";
      ws.getCell("I5").value = "TAMAT";

      ws.mergeCells("J4:J5");
      ws.getCell("J4").value = "STATUS";

      // Style Headers
      const headerRows = [ws.getRow(4), ws.getRow(5)];
      headerRows.forEach(row => {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF064E3B" } // Dark green
          };
          cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Columns Width
      ws.columns = [
        { width: 10 }, // A
        { width: 15 }, // B
        { width: 10 }, // C
        { width: 10 }, // D
        { width: 10 }, // E
        { width: 10 }, // F
        { width: 12 }, // G
        { width: 15 }, // H
        { width: 15 }, // I
        { width: 15 }, // J
      ];

      // Add Data
      let currentRow = 6;
      processedData.forEach(row => {
        const rowData = [
          row.blok,
          row.target,
          row.taburHariIni,
          row.taburHinggaKini,
          row.buruhHariIni || 0,
          row.buruhHinggaKini || 0,
          row.peratus,
          row.tarikhMula,
          row.tarikhTamat,
          row.status
        ];

        const wsRow = ws.addRow(rowData);
        wsRow.eachCell((cell, colNumber) => {
          cell.font = { name: "Arial", size: 10 };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          
          if (colNumber === 2 || colNumber === 3 || colNumber === 4 || colNumber === 5 || colNumber === 6) {
             cell.numFmt = "#,##0";
             cell.alignment = { horizontal: "right", vertical: "middle" };
          }
          if (colNumber === 7) {
             cell.numFmt = "0.00";
          }
        });
        
        if (row.peratus >= 100) {
           wsRow.eachCell(cell => {
             cell.fill = {
               type: "pattern",
               pattern: "solid",
               fgColor: { argb: "FFECFDF5" }
             };
           });
        }
        
        currentRow++;
      });

      // Add Totals Row
      const totalsRow = ws.addRow([
        "JUM",
        totals.target,
        totals.taburHariIni,
        totals.taburHinggaKini,
        totals.buruhHariIni,
        totals.buruhHinggaKini,
        calculateProgress(totals.taburHinggaKini, totals.target),
        "",
        "",
        ""
      ]);
      
      totalsRow.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0F172A" } // Dark Slate
        };
        cell.alignment = { horizontal: colNumber > 1 ? "right" : "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (colNumber === 2 || colNumber === 3 || colNumber === 4 || colNumber === 5 || colNumber === 6) {
             cell.numFmt = "#,##0";
        }
        if (colNumber === 7) {
             cell.numFmt = "0.00";
        }
      });

      // Save file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Baja_PUS_${activePus}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      alert("Ralat semasa memuat turun Excel.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input 
              type="text" 
              placeholder="Cari Blok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2 py-1 text-[7px] font-black uppercase tracking-widest rounded transition-all ${
                filterStatus === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2 py-1 text-[7px] font-black uppercase tracking-widest rounded transition-all ${
                filterStatus === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              100%
            </button>
            <button
              onClick={() => setFilterStatus('incomplete')}
              className={`px-2 py-1 text-[7px] font-black uppercase tracking-widest rounded transition-all ${
                filterStatus === 'incomplete' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Belum Siap
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-full md:w-auto">
          {[1, 2, 3, 4].map(p => (
            <button
              key={p}
              onClick={() => setActivePus(p)}
              className={`flex-1 md:flex-none px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded transition-all ${
                activePus === p 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              P{p}
            </button>
          ))}
          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>
          <button
            onClick={handleExportToExcel}
            className="flex items-center justify-center gap-1 flex-1 md:flex-none px-3 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-all"
            title="Muat Turun Excel"
          >
            <Download size={12} />
            <span className="hidden md:inline">MUAT TURUN</span>
          </button>
        </div>
      </div>

      {/* Summary Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#064E3B] p-4 rounded-[20px] text-white shadow-lg">
           <p className="text-[8px] font-black uppercase opacity-60 leading-none tracking-widest">Sasaran (Target)</p>
           <p className="text-xl font-black mt-1.5">{totals.target.toLocaleString()} <span className="text-[10px] opacity-70">BEG</span></p>
        </div>
        <div className="bg-emerald-600 p-4 rounded-[20px] text-white shadow-lg shadow-emerald-500/20">
           <p className="text-[8px] font-black uppercase opacity-60 leading-none tracking-widest">Siap Hari Ini</p>
           <p className="text-xl font-black mt-1.5">{totals.taburHariIni.toLocaleString()} <span className="text-[10px] opacity-70">BEG</span></p>
        </div>
        <div className="bg-slate-900 p-4 rounded-[20px] text-white shadow-lg">
           <p className="text-[8px] font-black uppercase opacity-60 leading-none tracking-widest">Terkumpul HHI</p>
           <p className="text-xl font-black mt-1.5">{totals.taburHinggaKini.toLocaleString()} <span className="text-[10px] opacity-70">BEG</span></p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative flex flex-col justify-center">
           <p className="text-[8px] font-black text-slate-400 uppercase leading-none tracking-widest">Prestasi PUS {activePus}</p>
           <p className="text-xl font-black text-[#064E3B] dark:text-emerald-400 mt-1.5">{calculateProgress(totals.taburHinggaKini, totals.target)}%</p>
           <div className="absolute bottom-0 left-0 h-1 bg-emerald-500" style={{ width: `${calculateProgress(totals.taburHinggaKini, totals.target)}%` }} />
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#064E3B] text-emerald-100 font-black uppercase tracking-widest text-[7px] md:text-[8px]">
                <th rowSpan={2} className="py-3 px-1 md:px-2 border-b border-emerald-900/50 align-bottom">Blok</th>
                <th rowSpan={2} className="py-3 px-1 md:px-2 border-b border-emerald-900/50 text-right align-bottom">
                  Target<br/><span className="text-[5px] md:text-[6px]">(Beg)</span>
                </th>
                <th colSpan={2} className="pt-3 pb-1 px-1 md:px-2 text-center border-x border-emerald-900/50 shadow-inner">Tabur</th>
                <th colSpan={2} className="pt-3 pb-1 px-1 md:px-2 text-center border-r border-emerald-900/50 overflow-hidden">Buruh</th>
                <th rowSpan={2} className="py-3 px-1 md:px-2 border-b border-emerald-900/50 text-center align-bottom">% Capai</th>
                <th colSpan={2} className="pt-3 pb-1 px-1 md:px-2 text-center border-l border-emerald-900/50">Tarikh</th>
              </tr>
              <tr className="bg-[#059669] text-white font-black uppercase tracking-widest text-[7px] md:text-[8px]">
                <th className="pb-2 px-1 md:px-2 border-emerald-900/50 text-right border-l border-emerald-900/50">HI</th>
                <th className="pb-2 px-1 md:px-2 border-emerald-900/50 text-right border-r border-emerald-900/50">HHI</th>
                <th className="pb-2 px-1 md:px-2 border-emerald-900/50 text-right">HI</th>
                <th className="pb-2 px-1 md:px-2 border-emerald-900/50 text-right border-r border-emerald-900/50">HHI</th>
                <th className="pb-2 px-1 md:px-2 border-emerald-900/50 text-center border-l border-emerald-900/50">Mula</th>
                <th className="pb-2 px-1 md:px-2 border-emerald-900/50 text-center">Tamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {processedData.map((row, idx) => {
                const statusInfo = getProgressStatus(row.peratus);
                return (
                  <tr key={idx} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all ${row.peratus >= 100 ? 'bg-emerald-50/10' : ''}`}>
                    <td className="py-1.5 px-1 md:px-2 border-r border-transparent">
                      <div className="flex items-center gap-1.5">
                         <div className={`w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center font-black text-[8px] md:text-[9px] border ${
                           row.peratus >= 100 ? 'bg-emerald-500 text-white border-emerald-400' :
                           row.peratus > 0 ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                         }`}>
                           {row.blok}
                         </div>
                      </div>
                    </td>
                    <td className="py-1.5 px-1 md:px-2 text-right text-[8px] md:text-[9px] font-black text-slate-600 dark:text-slate-400">{row.target.toLocaleString()}</td>
                    
                    {/* TABUR */}
                    <td className="py-1.5 px-1 md:px-2 text-right border-l border-slate-50 dark:border-slate-800/50">
                      {row.taburHariIni > 0 ? (
                        <div className="flex items-center justify-end gap-0.5 md:gap-1">
                           <ArrowUpRight size={8} className="text-emerald-500 hidden md:block" />
                           <span className="text-[8px] md:text-[9px] font-black text-emerald-600">{row.taburHariIni}</span>
                        </div>
                      ) : <span className="text-slate-300 text-[8px] md:text-[9px]">-</span>}
                    </td>
                    <td className="py-1.5 px-1 md:px-2 text-right text-[8px] md:text-[9px] font-black text-slate-800 dark:text-white border-r border-slate-50 dark:border-slate-800/50">{row.taburHinggaKini.toLocaleString()}</td>
                    
                    {/* BURUH */}
                    <td className="py-1.5 px-1 md:px-2 text-right text-[8px] md:text-[9px] font-bold text-slate-500">{row.buruhHariIni || '-'}</td>
                    <td className="py-1.5 px-1 md:px-2 text-right text-[8px] md:text-[9px] font-bold text-slate-500 border-r border-slate-50 dark:border-slate-800/50">{row.buruhHinggaKini || '-'}</td>
                    
                    {/* % CAPAI */}
                    <td className="py-1.5 px-1 md:px-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[8px] md:text-[9px] font-black ${statusInfo.text}`}>{row.peratus}%</span>
                        <div className="w-8 md:w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className={`h-full ${statusInfo.color}`} style={{ width: `${Math.min(100, row.peratus)}%` }} />
                        </div>
                      </div>
                    </td>
                    
                    {/* TARIKH */}
                    <td className="py-1.5 px-0.5 text-[7px] md:text-[8px] font-bold text-slate-500 text-center whitespace-nowrap border-l border-slate-50 dark:border-slate-800/50">{row.tarikhMula}</td>
                    <td className="py-1.5 px-0.5 text-center">
                       {row.tarikhTamat === 'DALAM PROSES' ? (
                         <div className="inline-flex items-center justify-center min-w-[32px] px-1 py-0.5 bg-amber-100 text-amber-600 rounded text-[6px] md:text-[7px] font-black uppercase">
                            PROSES
                         </div>
                       ) : (
                         <div className="inline-flex items-center justify-center min-w-[32px] px-1 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[6px] md:text-[7px] font-black uppercase">
                            {row.tarikhTamat}
                         </div>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black uppercase text-[7px] md:text-[8px] sticky bottom-0">
               <tr>
                 <td className="py-2 px-1 md:px-2">JUM</td>
                 <td className="py-2 px-1 md:px-2 text-right">{totals.target.toLocaleString()}</td>
                 <td className="py-2 px-1 md:px-2 text-right text-emerald-400">{totals.taburHariIni.toLocaleString()}</td>
                 <td className="py-2 px-1 md:px-2 text-right text-purple-400">{totals.taburHinggaKini.toLocaleString()}</td>
                 <td className="py-2 px-1 md:px-2 text-right">{totals.buruhHariIni.toLocaleString()}</td>
                 <td className="py-2 px-1 md:px-2 text-right">{totals.buruhHinggaKini.toLocaleString()}</td>
                 <td className="py-2 px-1 md:px-2 text-center" colSpan={3}>
                    <div className="flex items-center justify-center gap-1">
                       <TrendingUp size={8} className="text-purple-400 hidden md:block" />
                       {calculateProgress(totals.taburHinggaKini, totals.target)}%
                    </div>
                 </td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
