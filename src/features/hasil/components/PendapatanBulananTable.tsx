import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MASTER_DATA } from "../../../utils/constants";
import { Printer, Download, Share2, ZoomIn, ZoomOut, MoveHorizontal } from "lucide-react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface PendapatanBulananTableProps {
  analytics: any;
  dashboardDate: string;
  setDashboardDate?: (val: string) => void;
  isDarkMode: boolean;
  onScreenshot?: () => void;
  isCapturing?: boolean;
}

export const PendapatanBulananTable: React.FC<PendapatanBulananTableProps> = ({
  analytics,
  dashboardDate,
  setDashboardDate,
  isDarkMode,
  onScreenshot,
  isCapturing,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);

  if (!analytics || !analytics.month || !analytics.month.blokStats) return null;

  const blokStats = analytics.month.blokStats;
  const monthNames = [
    "JANUARI", "FEBRUARI", "MAC", "APRIL", "MEI", "JUN", 
    "JULAI", "OGOS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DISEMBER"
  ];
  const [reportYear, reportMonth] = dashboardDate.split("-");
  const monthName = monthNames[parseInt(reportMonth, 10) - 1];

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value; // YYYY-MM
    if (newMonth && setDashboardDate) {
      setDashboardDate(`${newMonth}-01`); // Set to 1st of the month
    }
  };

  const getPriceForPkt = (pkt: string) => {
    if (pkt === "001") return analytics.month.pkt1_avg_price || analytics.month.avgPrice || 1020.50;
    if (pkt === "002") return analytics.month.pkt2_avg_price || analytics.month.avgPrice || 1015.00;
    return analytics.month.felda_avg_price || analytics.month.avgPrice || 1010.00;
  };

  // Prepare Data
  const rows = blokStats
    .filter((b: any) => b.blok !== "88") // exclude FELDA/dummy if not peneroka, or keep depending on logic. The screenshot shows PKT 001 (1-17), 002 (18-22).
    .map((b: any) => {
      const peneroka = MASTER_DATA[b.blok]?.peneroka || 1;
      const tHek = b.luas > 0 ? b.tan / b.luas : 0;
      const tPen = b.tan / peneroka;
      const basePrice = getPriceForPkt(b.pkt);
      const totalSales = b.tan * basePrice;
      const price = b.tan > 0 ? totalSales / b.tan : 0;
      const purataSependapatan = peneroka > 0 ? totalSales / peneroka : 0;

      return {
        ...b,
        peneroka,
        tHek,
        tPen,
        price,
        totalSales,
        purataSependapatan
      };
    })
    .sort((a: any, b: any) => parseInt(a.blok) - parseInt(b.blok));

  const pkt1Rows = rows.filter((r: any) => r.pkt === "001");
  const pkt2Rows = rows.filter((r: any) => r.pkt === "002");

  const sumPkt1 = {
    luas: pkt1Rows.reduce((acc: number, r: any) => acc + r.luas, 0),
    peneroka: pkt1Rows.reduce((acc: number, r: any) => acc + r.peneroka, 0),
    tan: pkt1Rows.reduce((acc: number, r: any) => acc + r.tan, 0),
    totalSales: pkt1Rows.reduce((acc: number, r: any) => acc + r.totalSales, 0),
  };
  const pkt1AvgPrice = sumPkt1.tan > 0 ? sumPkt1.totalSales / sumPkt1.tan : 0;
  const pkt1THek = sumPkt1.luas > 0 ? sumPkt1.tan / sumPkt1.luas : 0;
  const pkt1TPen = sumPkt1.peneroka > 0 ? sumPkt1.tan / sumPkt1.peneroka : 0;
  const pkt1Sependapatan = sumPkt1.peneroka > 0 ? sumPkt1.totalSales / sumPkt1.peneroka : 0;

  const sumPkt2 = {
    luas: pkt2Rows.reduce((acc: number, r: any) => acc + r.luas, 0),
    peneroka: pkt2Rows.reduce((acc: number, r: any) => acc + r.peneroka, 0),
    tan: pkt2Rows.reduce((acc: number, r: any) => acc + r.tan, 0),
    totalSales: pkt2Rows.reduce((acc: number, r: any) => acc + r.totalSales, 0),
  };
  const pkt2AvgPrice = sumPkt2.tan > 0 ? sumPkt2.totalSales / sumPkt2.tan : 0;
  const pkt2THek = sumPkt2.luas > 0 ? sumPkt2.tan / sumPkt2.luas : 0;
  const pkt2TPen = sumPkt2.peneroka > 0 ? sumPkt2.tan / sumPkt2.peneroka : 0;
  const pkt2Sependapatan = sumPkt2.peneroka > 0 ? sumPkt2.totalSales / sumPkt2.peneroka : 0;
  
  const handleExportExcel = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Pendapatan Peneroka");

      // Title rows
      worksheet.mergeCells('A1', 'J1');
      worksheet.getCell('A1').value = "FELDA PLANTATION MANAGEMENT TUNGGAL";
      worksheet.getCell('A1').font = { bold: true, size: 12 };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2', 'J2');
      worksheet.getCell('A2').value = "LAPORAN PENDAPATAN BULANAN PENEROKA";
      worksheet.getCell('A2').font = { bold: true, size: 12 };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A3', 'J3');
      worksheet.getCell('A3').value = `BULAN : ${monthName} ${reportYear}`;
      worksheet.getCell('A3').font = { bold: true, size: 11 };
      worksheet.getCell('A3').alignment = { horizontal: 'center' };

      // Headers
      const startHeaderRow = 5;
      worksheet.mergeCells(`A${startHeaderRow}`, `A${startHeaderRow+1}`);
      worksheet.getCell(`A${startHeaderRow}`).value = "Pkt";

      worksheet.mergeCells(`B${startHeaderRow}`, `B${startHeaderRow+1}`);
      worksheet.getCell(`B${startHeaderRow}`).value = "Blok";

      worksheet.mergeCells(`C${startHeaderRow}`, `C${startHeaderRow+1}`);
      worksheet.getCell(`C${startHeaderRow}`).value = "Luas\n(Hek)";
      worksheet.getCell(`C${startHeaderRow}`).alignment = { wrapText: true, horizontal: "center", vertical: 'middle' };

      worksheet.mergeCells(`D${startHeaderRow}`, `D${startHeaderRow+1}`);
      worksheet.getCell(`D${startHeaderRow}`).value = "Jum Pen.";

      worksheet.mergeCells(`E${startHeaderRow}`, `G${startHeaderRow}`);
      worksheet.getCell(`E${startHeaderRow}`).value = "Pencapaian Hasil";
      worksheet.getCell(`E${startHeaderRow}`).alignment = { horizontal: 'center' };

      worksheet.getCell(`E${startHeaderRow+1}`).value = "M/Tan";
      worksheet.getCell(`F${startHeaderRow+1}`).value = "T / Hek";
      worksheet.getCell(`G${startHeaderRow+1}`).value = "T / Pen";

      worksheet.mergeCells(`H${startHeaderRow}`, `H${startHeaderRow+1}`);
      worksheet.getCell(`H${startHeaderRow}`).value = "Jumlah Nilai\nJualan\n( RM )";
      worksheet.getCell(`H${startHeaderRow}`).alignment = { wrapText: true, horizontal: "center", vertical: 'middle' };

      worksheet.mergeCells(`I${startHeaderRow}`, `I${startHeaderRow+1}`);
      worksheet.getCell(`I${startHeaderRow}`).value = "Purata\nHarga /\nTan\n(RM)";
      worksheet.getCell(`I${startHeaderRow}`).alignment = { wrapText: true, horizontal: "center", vertical: 'middle' };

      worksheet.mergeCells(`J${startHeaderRow}`, `J${startHeaderRow+1}`);
      worksheet.getCell(`J${startHeaderRow}`).value = "Purata\nPendapatan\nKasar\nSepeneroka";
      worksheet.getCell(`J${startHeaderRow}`).alignment = { wrapText: true, horizontal: "center", vertical: 'middle' };

      // Styling headers
      for (let c = 1; c <= 10; c++) {
          for(let r = startHeaderRow; r <= startHeaderRow+1; r++) {
              const cell = worksheet.getCell(r, c);
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE599' } };
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
              cell.font = { bold: true };
              if (!cell.alignment) cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
      }

      // Columns width
      worksheet.getColumn(1).width = 10;
      worksheet.getColumn(2).width = 8;
      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 10;
      worksheet.getColumn(5).width = 12;
      worksheet.getColumn(6).width = 10;
      worksheet.getColumn(7).width = 10;
      worksheet.getColumn(8).width = 16;
      worksheet.getColumn(9).width = 12;
      worksheet.getColumn(10).width = 16;

      let currentRow = startHeaderRow + 2;

      // PKT 1 rows
      pkt1Rows.forEach((row, idx) => {
          worksheet.getCell(`A${currentRow}`).value = idx === 0 ? "001\n(14)" : "";
          if (idx === 0) worksheet.getCell(`A${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          
          worksheet.getCell(`B${currentRow}`).value = parseInt(row.blok);
          worksheet.getCell(`C${currentRow}`).value = row.luas;
          worksheet.getCell(`D${currentRow}`).value = row.peneroka;
          worksheet.getCell(`E${currentRow}`).value = row.tan;
          worksheet.getCell(`F${currentRow}`).value = row.tHek;
          worksheet.getCell(`G${currentRow}`).value = row.tPen;
          worksheet.getCell(`H${currentRow}`).value = row.totalSales;
          worksheet.getCell(`I${currentRow}`).value = row.price;
          worksheet.getCell(`J${currentRow}`).value = row.purataSependapatan;
          
          worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`G${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`H${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`I${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`J${currentRow}`).numFmt = '#,##0.00';
          
          for(let c=1; c<=10; c++) worksheet.getCell(currentRow, c).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          currentRow++;
      });
      // PKT 1 SUM
      worksheet.getCell(`A${currentRow}`).value = "001";
      worksheet.getCell(`B${currentRow}`).value = "1-17";
      worksheet.getCell(`C${currentRow}`).value = sumPkt1.luas;
      worksheet.getCell(`D${currentRow}`).value = sumPkt1.peneroka;
      worksheet.getCell(`E${currentRow}`).value = sumPkt1.tan;
      worksheet.getCell(`F${currentRow}`).value = pkt1THek;
      worksheet.getCell(`G${currentRow}`).value = pkt1TPen;
      worksheet.getCell(`H${currentRow}`).value = sumPkt1.totalSales;
      worksheet.getCell(`I${currentRow}`).value = pkt1AvgPrice;
      worksheet.getCell(`J${currentRow}`).value = pkt1Sependapatan;
      for(let c=1; c<=10; c++) {
          const cell = worksheet.getCell(currentRow, c);
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE599' } };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      }
      worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`G${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`H${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`I${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`J${currentRow}`).numFmt = '#,##0.00';
      currentRow++;

      // PKT 2 rows
      pkt2Rows.forEach((row, idx) => {
          worksheet.getCell(`A${currentRow}`).value = idx === 0 ? "002\n(8)" : "";
          if (idx === 0) worksheet.getCell(`A${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          
          worksheet.getCell(`B${currentRow}`).value = parseInt(row.blok);
          worksheet.getCell(`C${currentRow}`).value = row.luas;
          worksheet.getCell(`D${currentRow}`).value = row.peneroka;
          worksheet.getCell(`E${currentRow}`).value = row.tan;
          worksheet.getCell(`F${currentRow}`).value = row.tHek;
          worksheet.getCell(`G${currentRow}`).value = row.tPen;
          worksheet.getCell(`H${currentRow}`).value = row.totalSales;
          worksheet.getCell(`I${currentRow}`).value = row.price;
          worksheet.getCell(`J${currentRow}`).value = row.purataSependapatan;
          
          worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`G${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`H${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`I${currentRow}`).numFmt = '#,##0.00';
          worksheet.getCell(`J${currentRow}`).numFmt = '#,##0.00';

          for(let c=1; c<=10; c++) worksheet.getCell(currentRow, c).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          currentRow++;
      });
      // PKT 2 SUM
      worksheet.getCell(`A${currentRow}`).value = "002";
      worksheet.getCell(`B${currentRow}`).value = "18-22";
      worksheet.getCell(`C${currentRow}`).value = sumPkt2.luas;
      worksheet.getCell(`D${currentRow}`).value = sumPkt2.peneroka;
      worksheet.getCell(`E${currentRow}`).value = sumPkt2.tan;
      worksheet.getCell(`F${currentRow}`).value = pkt2THek;
      worksheet.getCell(`G${currentRow}`).value = pkt2TPen;
      worksheet.getCell(`H${currentRow}`).value = sumPkt2.totalSales;
      worksheet.getCell(`I${currentRow}`).value = pkt2AvgPrice;
      worksheet.getCell(`J${currentRow}`).value = pkt2Sependapatan;
      for(let c=1; c<=10; c++) {
          const cell = worksheet.getCell(currentRow, c);
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE599' } };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      }
      worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`G${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`H${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`I${currentRow}`).numFmt = '#,##0.00';
      worksheet.getCell(`J${currentRow}`).numFmt = '#,##0.00';

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Laporan_Pendapatan_Peneroka_${dashboardDate}.xlsx`);
  };

  return (
    <div className="mt-4 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row gap-4 md:justify-between items-center bg-slate-50 dark:bg-black/20 dashboard-controls">
        <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
          <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest leading-none bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded-xl">Bulan:</span>
          <input 
            type="month"
            value={`${reportYear}-${reportMonth}`}
            onChange={handleMonthChange}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            {onScreenshot && (
              <button
                onClick={onScreenshot}
                disabled={isCapturing}
                className={`flex items-center gap-2 px-3 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${
                  isCapturing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Kongsi (PNG) ke WhatsApp"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}
            <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl transition-colors shadow-sm font-black text-xs uppercase tracking-widest"
                title="Muat Turun Excel (.xlsx)"
            >
                <Download size={16} />
                <span className="hidden sm:inline">Excel</span>
            </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 p-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 overflow-x-auto dashboard-controls">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 py-2 px-1 md:p-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm">
          <button
            onClick={() => setZoom(Math.max(30, zoom - 10))}
            className="p-1.5 md:p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-all dark:text-emerald-100 active:scale-95"
            title="Zum Keluar"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[10px] md:text-sm font-black min-w-[4ch] text-center text-emerald-800 dark:text-emerald-400">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-1.5 md:p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-all dark:text-emerald-100 active:scale-95"
            title="Zum Masuk"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        <button onClick={() => setZoom(100)} className="text-[9px] px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm uppercase tracking-widest cursor-pointer">RESET</button>
      </div>

      <div className="overflow-x-auto custom-scrollbar relative bg-slate-100 dark:bg-[#0f172a] p-4 flex justify-center items-start min-h-[400px]">
        <div 
            ref={tableRef}
            className="flex-shrink-0 transition-transform origin-top select-auto"
            style={{ 
                transform: `scale(${zoom / 100})`, 
                width: 'max-content'
            }}
        >
            <div id="hasil-bulanan-report" className="bg-white text-black p-6 border shadow-sm">
                <div className="text-center mb-6">
                    <h2 className="text-lg font-black uppercase font-sans tracking-wide m-0 leading-tight">
                        FELDA PLANTATION MANAGEMENT TUNGGAL
                    </h2>
                    <h3 className="text-base font-black uppercase tracking-wide m-0 leading-tight">
                        LAPORAN PENDAPATAN BULANAN PENEROKA
                    </h3>
                    <h4 className="text-sm font-bold uppercase tracking-wider m-0 mt-1">
                        BULAN : {monthName} {reportYear}
                    </h4>
                </div>

                <table className="w-full border-collapse text-xs font-sans border-2 border-black">
                    <thead>
                        <tr className="bg-[#FFE599] border-black">
                            <th className="border border-black p-2 font-bold text-center align-middle" rowSpan={2}>Pkt</th>
                            <th className="border border-black p-2 font-bold text-center align-middle" rowSpan={2}>Blok</th>
                            <th className="border border-black p-2 font-bold text-center align-middle w-16" rowSpan={2}>Luas<br/>(Hek)</th>
                            <th className="border border-black p-2 font-bold text-center align-middle" rowSpan={2}>Jum Pen.</th>
                            <th className="border border-black p-1 font-bold text-center" colSpan={3}>Pencapaian Hasil</th>
                            <th className="border border-black p-2 font-bold text-center align-middle w-24" rowSpan={2}>Jumlah Nilai<br/>Jualan<br/>( RM )</th>
                            <th className="border border-black p-2 font-bold text-center align-middle w-20" rowSpan={2}>Purata<br/>Harga /<br/>Tan<br/>(RM)</th>
                            <th className="border border-black p-2 font-bold text-center align-middle w-28" rowSpan={2}>Purata<br/>Pendapatan<br/>Kasar<br/>Sepeneroka</th>
                        </tr>
                        <tr className="bg-[#FFE599] border-black">
                            <th className="border border-black p-1 font-bold text-center">M/Tan</th>
                            <th className="border border-black p-1 font-bold text-center">T / Hek</th>
                            <th className="border border-black p-1 font-bold text-center">T / Pen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pkt1Rows.map((row: any, idx: number) => (
                            <tr key={row.blok} className="hover:bg-slate-50 transition-colors">
                                {idx === 0 && (
                                    <td className="border border-[#e2e8f0] border-r-black border-l-black p-1 text-center font-bold align-middle" rowSpan={pkt1Rows.length}>
                                        001<br/>(14)
                                    </td>
                                )}
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{parseInt(row.blok)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.luas.toFixed(2)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.peneroka}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.tan.toFixed(2)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.tHek.toFixed(2)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.tPen.toFixed(2)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-right">{row.totalSales.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-right">{row.price.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-right">{row.purataSependapatan.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                            </tr>
                        ))}
                        {/* PKT 1 TOTAL */}
                        <tr className="bg-[#FFE599] border-black font-bold">
                            <td className="border border-black p-1 text-center">001</td>
                            <td className="border border-black p-1 text-center">1-17</td>
                            <td className="border border-black p-1 text-center">{sumPkt1.luas.toFixed(2)}</td>
                            <td className="border border-black p-1 text-center">{sumPkt1.peneroka}</td>
                            <td className="border border-black p-1 text-center">{sumPkt1.tan.toFixed(2)}</td>
                            <td className="border border-black p-1 text-center">{pkt1THek.toFixed(2)}</td>
                            <td className="border border-black p-1 text-center">{pkt1TPen.toFixed(2)}</td>
                            <td className="border border-black p-1 text-right">{sumPkt1.totalSales.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                            <td className="border border-black p-1 text-right">{pkt1AvgPrice.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                            <td className="border border-black p-1 text-right">{pkt1Sependapatan.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                        </tr>

                        {pkt2Rows.map((row: any, idx: number) => (
                            <tr key={row.blok} className="hover:bg-slate-50 transition-colors">
                                {idx === 0 && (
                                    <td className="border border-[#e2e8f0] border-r-black border-l-black p-1 text-center font-bold align-middle" rowSpan={pkt2Rows.length}>
                                        002<br/>(8)
                                    </td>
                                )}
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{parseInt(row.blok)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.luas.toFixed(2)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.peneroka}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.tan.toFixed(2)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.tHek.toFixed(2)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-center">{row.tPen.toFixed(2)}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-right">{row.totalSales.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-right">{row.price.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                                <td className="border border-[#e2e8f0] border-x-black p-1 text-right">{row.purataSependapatan.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                            </tr>
                        ))}
                        {/* PKT 2 TOTAL */}
                        <tr className="bg-[#FFE599] border-black font-bold">
                            <td className="border border-black p-1 text-center">002</td>
                            <td className="border border-black p-1 text-center">18-22</td>
                            <td className="border border-black p-1 text-center">{sumPkt2.luas.toFixed(2)}</td>
                            <td className="border border-black p-1 text-center">{sumPkt2.peneroka}</td>
                            <td className="border border-black p-1 text-center">{sumPkt2.tan.toFixed(2)}</td>
                            <td className="border border-black p-1 text-center">{pkt2THek.toFixed(2)}</td>
                            <td className="border border-black p-1 text-center">{pkt2TPen.toFixed(2)}</td>
                            <td className="border border-black p-1 text-right">{sumPkt2.totalSales.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                            <td className="border border-black p-1 text-right">{pkt2AvgPrice.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                            <td className="border border-black p-1 text-right">{pkt2Sependapatan.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};
