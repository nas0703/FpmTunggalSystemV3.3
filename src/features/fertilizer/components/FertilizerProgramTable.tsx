
import React from 'react';
import ExcelJS from 'exceljs';
import { FileText, Download } from 'lucide-react';
import { FERTILIZER_PROGRAM_2026 } from '../program_data';

export const FertilizerProgramTable: React.FC = () => {
  const handleExportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet("Program Baja 2026");

      ws.pageSetup.orientation = "landscape";
      ws.pageSetup.fitToPage = true;
      ws.pageSetup.fitToWidth = 1;

      // Title
      ws.mergeCells("A1:H1");
      const titleCell = ws.getCell("A1");
      titleCell.value = "PROGRAM BAJA 2026 - JADUAL INDUK PEMBAJAAN (BEG)";
      titleCell.font = { name: "Arial", size: 14, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(1).height = 30;

      // Date
      ws.mergeCells("A2:H2");
      const dateCell = ws.getCell("A2");
      dateCell.value = `DIJANA PADA: ${new Date().toLocaleDateString("ms-MY")} ${new Date().toLocaleTimeString("ms-MY")}`;
      dateCell.font = { name: "Arial", size: 10, italic: true };
      dateCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(2).height = 20;

      // Header Row
      const headerRow = ws.addRow([
        "BLOK", "LUAS (HA)", "POKOK", "PUS 1 (FEB)", "PUS 2 (APR)", "PUS 3 (JUN)", "PUS 4 (AUG)", "JUMLAH"
      ]);
      
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF0F172A" } // Dark Slate
        };
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });
      ws.getRow(4).height = 25;

      // Columns Width
      ws.columns = [
        { width: 10 }, // Blok
        { width: 12 }, // Luas
        { width: 12 }, // Pokok
        { width: 15 }, // PUS 1
        { width: 15 }, // PUS 2
        { width: 15 }, // PUS 3
        { width: 15 }, // PUS 4
        { width: 15 }, // Jumlah
      ];

      // Add Data
      FERTILIZER_PROGRAM_2026.forEach(row => {
        const total = row.pus1 + row.pus2 + row.pus3 + row.pus4;
        const wsRow = ws.addRow([
          row.blok,
          row.luas,
          row.pokok,
          row.pus1,
          row.pus2,
          row.pus3,
          row.pus4,
          total
        ]);

        wsRow.eachCell((cell, colNumber) => {
          cell.font = { name: "Arial", size: 10 };
          cell.alignment = { horizontal: colNumber === 1 ? "center" : "right", vertical: "middle" };
          cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          
          if (colNumber === 2) {
             cell.numFmt = "0.000";
          } else if (colNumber > 2) {
             cell.numFmt = "#,##0";
          }
        });
      });

      // Add Footer
      const totalPus1 = FERTILIZER_PROGRAM_2026.reduce((a, b) => a + b.pus1, 0);
      const totalPus2 = FERTILIZER_PROGRAM_2026.reduce((a, b) => a + b.pus2, 0);
      const totalPus3 = FERTILIZER_PROGRAM_2026.reduce((a, b) => a + b.pus3, 0);
      const totalPus4 = FERTILIZER_PROGRAM_2026.reduce((a, b) => a + b.pus4, 0);
      const totalAll = totalPus1 + totalPus2 + totalPus3 + totalPus4;

      const footerRow = ws.addRow([
        "JUMLAH KESELURUHAN (BEG)", "", "", totalPus1, totalPus2, totalPus3, totalPus4, totalAll
      ]);
      ws.mergeCells(`A${footerRow.number}:C${footerRow.number}`);

      footerRow.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber > 3) {
            cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
            cell.alignment = { horizontal: colNumber === 1 ? "left" : "right", vertical: "middle" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        }
        if (colNumber > 3) {
            cell.numFmt = "#,##0";
        }
      });

      // Save file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Program_Baja_2026_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      alert("Ralat semasa memuat turun Excel.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Program Baja 2026</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Jadual Induk Pembajaan (Beg)</p>
        </div>
        <button onClick={handleExportToExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all">
          <Download size={12} />
          Export
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-[9px] text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-black uppercase tracking-widest">
            <tr>
              <th className="p-2 border-b border-slate-100 dark:border-slate-800">Blok</th>
              <th className="p-2 border-b border-slate-100 dark:border-slate-800 text-right">Luas (Ha)</th>
              <th className="p-2 border-b border-slate-100 dark:border-slate-800 text-right">Pokok</th>
              <th className="p-2 border-b border-slate-100 dark:border-slate-800 text-center bg-purple-500/5 text-purple-600 dark:text-purple-400">PUS 1 (Feb)</th>
              <th className="p-2 border-b border-slate-100 dark:border-slate-800 text-center bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">PUS 2 (Apr)</th>
              <th className="p-2 border-b border-slate-100 dark:border-slate-800 text-center bg-blue-500/5 text-blue-600 dark:text-blue-400">PUS 3 (Jun)</th>
              <th className="p-2 border-b border-slate-100 dark:border-slate-800 text-center bg-amber-500/5 text-amber-600 dark:text-amber-400">PUS 4 (Aug)</th>
              <th className="p-2 border-b border-slate-100 dark:border-slate-800 text-right font-black text-slate-800 dark:text-white">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {FERTILIZER_PROGRAM_2026.map((row, idx) => {
              const total = row.pus1 + row.pus2 + row.pus3 + row.pus4;
              return (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-2 font-black text-slate-800 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                      {row.blok}
                    </div>
                  </td>
                  <td className="p-2 text-right font-bold text-slate-500">{row.luas.toFixed(3)}</td>
                  <td className="p-2 text-right font-bold text-slate-500">{row.pokok.toLocaleString()}</td>
                  <td className="p-2 text-center font-black text-purple-600 dark:text-purple-400 bg-purple-500/[0.02]">{row.pus1}</td>
                  <td className="p-2 text-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.02]">{row.pus2}</td>
                  <td className="p-2 text-center font-black text-blue-600 dark:text-blue-400 bg-blue-500/[0.02]">{row.pus3}</td>
                  <td className="p-2 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-500/[0.02]">{row.pus4}</td>
                  <td className="p-2 text-right font-black text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                    {total.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-900 text-white font-black uppercase text-[9px]">
            <tr>
              <td className="p-2" colSpan={3}>Jumlah Keseluruhan (Beg)</td>
              <td className="p-2 text-center">{FERTILIZER_PROGRAM_2026.reduce((a, b) => a + b.pus1, 0).toLocaleString()}</td>
              <td className="p-2 text-center">{FERTILIZER_PROGRAM_2026.reduce((a, b) => a + b.pus2, 0).toLocaleString()}</td>
              <td className="p-2 text-center">{FERTILIZER_PROGRAM_2026.reduce((a, b) => a + b.pus3, 0).toLocaleString()}</td>
              <td className="p-2 text-center">{FERTILIZER_PROGRAM_2026.reduce((a, b) => a + b.pus4, 0).toLocaleString()}</td>
              <td className="p-2 text-right text-emerald-400">
                {FERTILIZER_PROGRAM_2026.reduce((a, b) => a + (b.pus1 + b.pus2 + b.pus3 + b.pus4), 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-purple-500 shadow-sm">
            <FileText size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-800 dark:text-white uppercase leading-none">Nota Program</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Data diselaraskan mengikut Luas (Ha) dan Pokok setiap blok.</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="px-2 py-1 bg-purple-500 text-white rounded-md text-[8px] font-black uppercase">Compact Felda 12</div>
          <div className="px-2 py-1 bg-emerald-500 text-white rounded-md text-[8px] font-black uppercase">Felda Organic</div>
        </div>
      </div>
    </div>
  );
};
