import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Leaf, Trophy, DownloadCloud, FileSpreadsheet, FileText as FileTextIcon, Camera, ScanLine, Search, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Target, BarChart3, Loader2, Share2, PieChart as PieChartIcon, X, ZoomIn, ZoomOut, MoveHorizontal, Printer, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, AreaChart, Area, ComposedChart, PieChart, Pie, Legend } from "recharts";
import { MASTER_DATA, CHART_COLORS, TARGET_ANNUAL_PKT1, TARGET_ANNUAL_PKT2, TARGET_ANNUAL_FELDA, YIELD_DATA_2025 } from "../../../utils/constants";
import { Transaction } from "../../../App";
import { AnimatePresence, motion } from "motion/react";

export const HasilBulananTable = ({
  analytics,
  dashboardDate = new Date().toISOString().split("T")[0],
  isDarkMode,
  onScreenshot,
  isCapturing,
  onExcel,
  onDownloadPdf,
  isDownloadingPdf = false,
  onPrint,
}: {
  analytics: any;
  dashboardDate?: string;
  isDarkMode: boolean;
  onScreenshot?: () => void;
  isCapturing?: boolean;
  onExcel?: () => void;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  onPrint?: () => void;
}) => {
  const [zoom, setZoom] = useState(85);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<"id" | "month" | "ytd" | "yoy">("id");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderScale = isFullscreen ? 3 : 1; // 3x resolution supersampling for perfect clarity

  useEffect(() => {
    const checkFit = () => {
      if (isFullscreen && contentRef.current && tableRef.current) {
        const prevTransform = tableRef.current.style.transform;
        tableRef.current.style.transform = "none";
        
        const containerWidth = contentRef.current.clientWidth;
        const containerHeight = contentRef.current.clientHeight;
        const tableWidth = tableRef.current.offsetWidth;
        const tableHeight = tableRef.current.offsetHeight;

        // Add padding to calculation
        const px = 16;
        const py = 16;

        const scaleX = (containerWidth - px) / Math.max(1, tableWidth);
        const scaleY = (containerHeight - py) / Math.max(1, tableHeight);
        const newScale = Math.min(scaleX, scaleY);

        setFitScale(newScale);
        tableRef.current.style.transform = prevTransform;
      } else {
        setFitScale(1);
      }
    };

    checkFit();

    // Add small delay to ensure rendering completes before check
    const timeoutProcess = setTimeout(checkFit, 50);
    window.addEventListener("resize", checkFit);

    return () => {
      clearTimeout(timeoutProcess);
      window.removeEventListener("resize", checkFit);
    };
  }, [isFullscreen, zoom, analytics]);

  if (!analytics || !analytics.month || !analytics.year || !analytics.day)
    return null;

  // Use dashboardDate to accurately align with the subset of data being viewed
  const dashboardFallback = dashboardDate || new Date().toISOString().split("T")[0];
  const [dbYear, dbMonth, dbDay] = dashboardFallback.split("-");
  const now = new Date(parseInt(dbYear), parseInt(dbMonth) - 1, parseInt(dbDay));
  
  const currentMonthIdx = now.getMonth();
  const currentDay = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    currentMonthIdx + 1,
    0,
  ).getDate();
  const daysPassedYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const totalDaysYear = 365;

  const monthNames = [
    "JANUARI",
    "FEBRUARI",
    "MAC",
    "APRIL",
    "MEI",
    "JUN",
    "JULAI",
    "OGOS",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DISEMBER",
  ];
  const currentMonthName = monthNames[currentMonthIdx];
  const dateStr = now.toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const getTahunTuai = (pkt: string) => {
    if (pkt === "001") return { tahun: "THN 15", target: "28.00" };
    if (pkt === "002") return { tahun: "THN 9", target: "28.00" };
    return pkt === "003"
      ? { tahun: "LF", target: "13.76" }
      : { tahun: "-", target: "-" };
  };

  const calculateRowData = (blokId: string, isLF: boolean = false) => {
    const dBlok = analytics.day.blokStats.find((b: any) => b.blok === blokId);
    const mBlok = analytics.month.blokStats.find((b: any) => b.blok === blokId);
    const yBlok = analytics.year.blokStats.find((b: any) => b.blok === blokId);

    const luas = isLF ? 98.51 : MASTER_DATA[blokId]?.luas || 0;
    const pkt = isLF ? "003" : MASTER_DATA[blokId]?.pkt || "";
    const infoTahun = getTahunTuai(pkt);

    // Anggaran Bulan Ini
    const targetHekMonth = mBlok?.targetHek || 0;
    const targetMtMonth = mBlok?.target_mt || 0;

    // Pencapaian Bulan Ini
    const hiMt = dBlok?.tan || 0;
    const hhiMt = mBlok?.tan || 0;
    const tHekMonth = luas > 0 ? hhiMt / luas : 0;
    const penerokaCount = MASTER_DATA[blokId]?.peneroka || 0;
    const tPenMonth = penerokaCount > 0 ? hhiMt / penerokaCount : 0;
    const pctCapaiMonth = targetMtMonth > 0 ? (hhiMt / targetMtMonth) * 100 : 0;

    // Capai 2025 (Reference)
    const yield2025 = YIELD_DATA_2025[currentMonthIdx];
    const capaiTan2025 = yield2025?.blok?.[blokId as keyof typeof yield2025.blok] || 0;
    const capai2025 = luas > 0 ? capaiTan2025 / luas : 0;

    // Hingga Bulan Ini (YTD)
    const targetHekYtd = yBlok?.targetHek || 0;
    const targetMtYtd = yBlok?.target_mt || 0;
    const actualMtYtd = yBlok?.tan || 0;
    const actualTHekYtd = luas > 0 ? actualMtYtd / luas : 0;
    const pctCapaiYtd = targetMtYtd > 0 ? (actualMtYtd / targetMtYtd) * 100 : 0;

    return {
      pkt,
      tahunTuai: infoTahun.tahun,
      targetTahun: infoTahun.target,
      blok: blokId,
      luas,
      peneroka: penerokaCount,
      capai2025,
      anggaranMonth: { mt: targetMtMonth, tHek: targetHekMonth },
      pencapaianMonth: {
        hiMt,
        hhiMt,
        tHek: hhiMt / (luas || 1),
        tPen: tPenMonth,
      },
      pctCapaiMonth,
      anggaranYtd: { mt: targetMtYtd, tHek: targetHekYtd },
      pencapaianYtd: { mt: actualMtYtd, tHek: actualTHekYtd },
      pctCapaiYtd,
      ytd2025: YIELD_DATA_2025.slice(0, currentMonthIdx + 1).reduce(
        (acc: number, curr: any, idx: number) => {
          const val = isLF ? curr.blok["88"] || 0 : curr.blok[blokId] || 0;
          if (idx === currentMonthIdx) {
            return acc + (val / daysInMonth) * currentDay;
          }
          return acc + val;
        },
        0,
      ),
    };
  };

 const renderRow = (
 data: any,
 isSubtotal: boolean = false,
 isGrandTotal: boolean = false,
 ) => {
 const yoyVal =
 data.ytd2025 > 0
 ? ((data.pencapaianYtd.mt - data.ytd2025) / data.ytd2025) * 100
 : 0;
  const yoyColor = yoyVal >= 0 ? (isGrandTotal ? "text-emerald-200 dark:text-emerald-800" : "text-emerald-600") : (isGrandTotal ? "text-rose-300 dark:text-rose-800" : "text-rose-600");
	const targetColor = isGrandTotal ? "text-emerald-200 dark:text-emerald-800" : "text-emerald-600 dark:text-emerald-400/70";
	const capaiColor = isGrandTotal ? "text-rose-300 dark:text-rose-800" : (isDarkMode ? "text-rose-400" : "text-rose-600");
	const tPenColor = isGrandTotal ? "text-emerald-200 dark:text-emerald-800" : "dark:text-emerald-100";

  let rowClass = "bg-white dark:bg-[#072d1f] text-emerald-900 dark:text-emerald-100 border-b border-emerald-100 dark:border-emerald-900/50";
  let monthRankTextColor = "";
  let ytdRankTextColor = "";

  if (isGrandTotal) {
    rowClass = "bg-emerald-800 text-white dark:bg-emerald-400 dark:text-emerald-950 font-black shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 relative";
  } else if (isSubtotal) {
    rowClass = "bg-emerald-50 dark:bg-emerald-900/60 font-bold text-emerald-900 dark:text-emerald-100 border-b-2 border-emerald-200 dark:border-emerald-800";
  } else if (data.blok !== "LF" && (sortBy === "month" || sortBy === "ytd")) {
    const calculateRankTextColor = (pct: number) => {
      if (pct >= 100) return "text-emerald-600 dark:text-emerald-400";
      if (pct >= 90) return "text-teal-600 dark:text-teal-400";
      if (pct >= 70) return "text-amber-500 dark:text-amber-400";
      return "text-rose-600 dark:text-rose-400";
    };

    if (sortBy === "month") {
       monthRankTextColor = calculateRankTextColor(data.pctCapaiMonth);
    } else if (sortBy === "ytd") {
       ytdRankTextColor = calculateRankTextColor(data.pctCapaiYtd);
    }
  }

  const zoomStyles = {
    padding: `${Math.max(2, 6 * ((zoom / 100) * renderScale))}px ${Math.max(3, 8 * ((zoom / 100) * renderScale))}px`,
    fontSize: `${Math.max(12, 16.5 * ((zoom / 100) * renderScale))}px`,
    fontWeight: "bold",
  };

  return (
    <tr
      key={data.blok}
      className={`${rowClass} transition-colors cursor-pointer ${!isGrandTotal && !isSubtotal ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/90 dark:bg-emerald-900/20" : ""}`}
    >
      <td
        style={zoomStyles}
        className="border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center uppercase"
      >
        {data.pkt}
      </td>
      <td
        style={zoomStyles}
        className="border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center uppercase"
      >
        {data.tahunTuai}
      </td>
      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center ${targetColor}`}
      >
        {data.targetTahun}
      </td>
      <td
        style={zoomStyles}
        className={`sticky left-0 border-r-2 border-emerald-400 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 text-center font-black shadow-[2px_0_5px_rgba(0,0,0,0.1)] z-10 ${rowClass}`}
      >
        {data.blok}
      </td>
      <td
        style={zoomStyles}
        className="border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-right pr-2 font-medium"
      >
        {data.luas.toFixed(2)}
      </td>
      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center font-bold dark:text-emerald-100 ${isGrandTotal ? "text-emerald-200 dark:text-emerald-800" : ""}`}
      >
        {data.peneroka > 0 ? data.peneroka : "-"}
      </td>
      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center font-bold ${capaiColor}`}
      >
        {data.capai2025.toFixed(2)}
      </td>

      {/* BULAN INI ANGGARAN */}
      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-right pr-2 ${!isGrandTotal && !isSubtotal ? "bg-emerald-50/30 dark:bg-emerald-900/90 dark:bg-emerald-900/20" : ""}`}
      >
        {data.anggaranMonth.mt.toFixed(2)}
      </td>
      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center ${!isGrandTotal && !isSubtotal ? "bg-emerald-50/30 dark:bg-emerald-900/90 dark:bg-emerald-900/20" : ""}`}
      >
        {data.anggaranMonth.tHek.toFixed(2)}
      </td>

      {/* BULAN INI PENCAPAIAN */}
      <td
        style={zoomStyles}
        className="border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-right pr-2 font-black"
      >
        {data.pencapaianMonth.hiMt.toFixed(2)}
      </td>
      <td
        style={zoomStyles}
        className="border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-right pr-2 font-black"
      >
        {data.pencapaianMonth.hhiMt.toFixed(2)}
      </td>
      <td
        style={zoomStyles}
        className="border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center font-black"
      >
        {data.pencapaianMonth.tHek.toFixed(2)}
      </td>
      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center font-black ${tPenColor}`}
      >
        {data.pencapaianMonth.tPen.toFixed(2)}
      </td>

      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center font-black`}
      >
        <span className={monthRankTextColor}>{data.pctCapaiMonth.toFixed(2)}</span>
      </td>

      {/* HINGGA BULAN INI ANGGARAN */}
      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-right pr-2 ${!isGrandTotal && !isSubtotal ? "bg-emerald-50/30 dark:bg-emerald-900/90 dark:bg-emerald-900/20" : ""}`}
      >
        {data.anggaranYtd.mt.toFixed(2)}
      </td>
      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center ${!isGrandTotal && !isSubtotal ? "bg-emerald-50/30 dark:bg-emerald-900/90 dark:bg-emerald-900/20" : ""}`}
      >
        {data.anggaranYtd.tHek.toFixed(2)}
      </td>

      {/* HINGGA BULAN INI PENCAPAIAN */}
      <td
        style={zoomStyles}
        className="border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-right pr-2 font-black"
      >
        {data.pencapaianYtd.mt.toFixed(2)}
      </td>
      <td
        style={zoomStyles}
        className="border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center font-black"
      >
        {data.pencapaianYtd.tHek.toFixed(2)}
      </td>

      <td
        style={zoomStyles}
        className={`border-r border-emerald-200 dark:border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-center font-black`}
      >
        <span className={ytdRankTextColor}>{data.pctCapaiYtd.toFixed(2)}</span>
      </td>
      <td
        style={zoomStyles}
        className={`text-center font-black ${yoyColor}`}
 >
 {yoyVal.toFixed(1)}%
 </td>
 </tr>
 );
 };

 const pkt1Rows = [
 "1",
 "2",
 "3",
 "4",
 "5",
 "6",
 "7",
 "8",
 "9",
 "10",
 "11",
 "12",
 "13",
 "14",
 "15",
 "16",
 "17",
 ].map((id) => calculateRowData(id));
 const pkt2Rows = ["18", "19", "20", "21", "22"].map((id) =>
 calculateRowData(id),
 );
 const lfRow = calculateRowData("88", true);

 const sortFn = (a: any, b: any) => {
 if (sortBy === "id") return parseInt(a.blok) - parseInt(b.blok);
 if (sortBy === "month")
 return b.pencapaianMonth.tHek - a.pencapaianMonth.tHek;
 if (sortBy === "ytd") return b.pencapaianYtd.tHek - a.pencapaianYtd.tHek;
 if (sortBy === "yoy") {
 const yoyA =
 a.ytd2025 > 0 ? (a.pencapaianYtd.mt - a.ytd2025) / a.ytd2025 : -1e9;
 const yoyB =
 b.ytd2025 > 0 ? (b.pencapaianYtd.mt - b.ytd2025) / b.ytd2025 : -1e9;
 return yoyB - yoyA;
 }
 return 0;
 };

 const sortedPkt1 = [...pkt1Rows].sort(sortFn);
 const sortedPkt2 = [...pkt2Rows].sort(sortFn);

 const calculateGroupTotal = (rows: any[], label: string) => {
 const totalLuas = rows.reduce((acc, curr) => acc + curr.luas, 0);
 const totalCapai2025 =
 rows.reduce((acc, curr) => acc + curr.capai2025 * curr.luas, 0) /
 (totalLuas || 1);

 const totalAnggaranMonthMt = rows.reduce(
 (acc, curr) => acc + curr.anggaranMonth.mt,
 0,
 );
 const totalAnggaranMonthTHek =
 rows.reduce((acc, curr) => acc + curr.anggaranMonth.tHek * curr.luas, 0) /
 (totalLuas || 1);

 const totalHiMt = rows.reduce(
 (acc, curr) => acc + curr.pencapaianMonth.hiMt,
 0,
 );
 const totalHhiMt = rows.reduce(
 (acc, curr) => acc + curr.pencapaianMonth.hhiMt,
 0,
 );
 const totalTHekMonth = totalLuas > 0 ? totalHhiMt / totalLuas : 0;
 const totalPeneroka = rows.reduce((acc, curr) => acc + curr.peneroka, 0);
 const totalTPenMonth = totalPeneroka > 0 ? totalHhiMt / totalPeneroka : 0;
 const totalPctCapaiMonth =
 totalAnggaranMonthMt > 0 ? (totalHhiMt / totalAnggaranMonthMt) * 100 : 0;

 const totalAnggaranYtdMt = rows.reduce(
 (acc, curr) => acc + curr.anggaranYtd.mt,
 0,
 );
 const totalAnggaranYtdTHek =
 rows.reduce((acc, curr) => acc + curr.anggaranYtd.tHek * curr.luas, 0) /
 (totalLuas || 1);
 const totalActualMtYtd = rows.reduce(
 (acc, curr) => acc + curr.pencapaianYtd.mt,
 0,
 );
 const totalActualTHekYtd = totalLuas > 0 ? totalActualMtYtd / totalLuas : 0;
 const totalPctCapaiYtd =
 totalAnggaranYtdMt > 0
 ? (totalActualMtYtd / totalAnggaranYtdMt) * 100
 : 0;
 const totalYtd2025 = rows.reduce((acc, curr) => acc + curr.ytd2025, 0);

 return {
 pkt: label,
 tahunTuai:
 label === "PKT 001" ? "1-17" : label === "PKT 002" ? "18-22" : "-",
 targetTahun: "-",
 blok: label,
 luas: totalLuas,
 peneroka: totalPeneroka,
 capai2025: totalCapai2025,
 anggaranMonth: { mt: totalAnggaranMonthMt, tHek: totalAnggaranMonthTHek },
 pencapaianMonth: {
 hiMt: totalHiMt,
 hhiMt: totalHhiMt,
 tHek: totalTHekMonth,
 tPen: totalTPenMonth,
 },
 pctCapaiMonth: totalPctCapaiMonth,
 anggaranYtd: { mt: totalAnggaranYtdMt, tHek: totalAnggaranYtdTHek },
 pencapaianYtd: { mt: totalActualMtYtd, tHek: totalActualTHekYtd },
 pctCapaiYtd: totalPctCapaiYtd,
 ytd2025: totalYtd2025,
 };
 };

 const pkt1Total = calculateGroupTotal(pkt1Rows, "PKT 001");
 const pkt2Total = calculateGroupTotal(pkt2Rows, "PKT 002");
 const pkt12Total = calculateGroupTotal(
 [...pkt1Rows, ...pkt2Rows],
 "PKT 1 DAN 2",
 );
 const grandTotal = calculateGroupTotal(
 [...pkt1Rows, ...pkt2Rows, lfRow],
 "JUMLAH BESAR",
 );

 const handleExportTableToExcel = async () => {
 try {
 const workbook = new ExcelJS.Workbook();
 const ws = workbook.addWorksheet("Laporan Hasil Bulanan");

 ws.pageSetup.orientation = "landscape";
 ws.pageSetup.fitToPage = true;
 ws.pageSetup.fitToWidth = 1;

 // 1. Titles
 ws.mergeCells("A1:S1");
 const title1 = ws.getCell("A1");
 title1.value = "FELDA PLANTATION MANAGEMENT SDN BHD";
 title1.font = { bold: true, size: 16 };
 title1.alignment = { horizontal: "center" };

 ws.mergeCells("A2:S2");
 const title2 = ws.getCell("A2");
 title2.value = "LAPORAN HASIL BULANAN MENGIKUT BLOK ${dbYear}";
 title2.font = { bold: true, size: 12 };
 title2.alignment = { horizontal: "center" };

 ws.mergeCells("A3:S3");
 const title3 = ws.getCell("A3");
 title3.value = `BULAN ${currentMonthName} SEHINGGA : ${dateStr}`;
 title3.font = { bold: true, size: 10 };
 title3.alignment = { horizontal: "center" };

 ws.addRow([]); // Blank Row 4

 // 2. Headers Row 1
 const headerRow1 = ws.getRow(5);
 ws.mergeCells("A5:A6");
 headerRow1.getCell(1).value = "PERINGKAT";
 ws.mergeCells("B5:B6");
 headerRow1.getCell(2).value = "TAHUN TUAI";
 ws.mergeCells("C5:C6");
 headerRow1.getCell(3).value = "TARGET TAHUN";
 ws.mergeCells("D5:D6");
 headerRow1.getCell(4).value = "BLOK";
 ws.mergeCells("E5:E6");
 headerRow1.getCell(5).value = "LUAS BUKAAN (HEK)";
 ws.mergeCells("F5:F6");
 headerRow1.getCell(6).value = "JUM PEN.";
 ws.mergeCells("G5:G6");
 headerRow1.getCell(7).value = "CAPAI T/HEK (2025)";

 ws.mergeCells("H5:I5");
 headerRow1.getCell(8).value = "ANGGARAN BULAN INI";
 ws.mergeCells("J5:N5");
 headerRow1.getCell(10).value = "PENCAPAIAN SEHINGGA HARI INI";
 ws.mergeCells("O5:P5");
 headerRow1.getCell(15).value = "ANGGARAN HINGGA BULAN INI";
 ws.mergeCells("Q5:T5");
 headerRow1.getCell(17).value = "PENCAPAIAN HINGGA BULAN INI";

 // 3. Headers Row 2
 const headerRow2 = ws.getRow(6);
 headerRow2.getCell(8).value = "MT";
 headerRow2.getCell(9).value = "T/HEK";

 headerRow2.getCell(10).value = "HI M/T";
 headerRow2.getCell(11).value = "HHI M/T";
 headerRow2.getCell(12).value = "T/HEK";
 headerRow2.getCell(13).value = "T.PEN M/T";
 headerRow2.getCell(14).value = "% CAPAI";

 headerRow2.getCell(15).value = "MT";
 headerRow2.getCell(16).value = "T/HEK";

 headerRow2.getCell(17).value = "M/T";
 headerRow2.getCell(18).value = "T/HEK";
 headerRow2.getCell(19).value = "% CAPAI";
 headerRow2.getCell(20).value = "YOY (%)";

 // 4. Style headers
 [5, 6].forEach((rowIdx) => {
 const row = ws.getRow(rowIdx);
 row.eachCell({ includeEmpty: true }, (cell) => {
 cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
 cell.fill = {
 type: "pattern",
 pattern: "solid",
 fgColor: { argb: "FF064E3B" },
 };
 cell.alignment = {
 horizontal: "center",
 vertical: "middle",
 wrapText: true,
 };
 cell.border = {
 top: { style: "thin" },
 left: { style: "thin" },
 bottom: { style: "thin" },
 right: { style: "thin" },
 };
 });
 });
 headerRow1.height = 25;
 headerRow2.height = 25;

 // 5. Columns width
 ws.columns = [
 { width: 12 },
 { width: 12 },
 { width: 15 },
 { width: 10 },
 { width: 18 },
 { width: 18 },
 { width: 10 },
 { width: 10 },
 { width: 10 },
 { width: 10 },
 { width: 10 },
 { width: 12 },
 { width: 10 },
 { width: 10 },
 { width: 10 },
 { width: 10 },
 { width: 10 },
 { width: 10 },
 { width: 10 },
 ];

 // 6. Append Row helper
 const appendRow = (
 data: any,
 isSubtotal = false,
 isGrandTotal = false,
 ) => {
 const yoyVal =
 data.ytd2025 > 0
 ? ((data.pencapaianYtd.mt - data.ytd2025) / data.ytd2025) * 100
 : 0;
 const row = ws.addRow([
 data.pkt,
 data.tahunTuai,
 data.targetTahun,
 data.blok,
 data.luas,
 data.peneroka > 0 ? data.peneroka : "-",
 data.capai2025,
 data.anggaranMonth.mt,
 data.anggaranMonth.tHek,
 data.pencapaianMonth.hiMt,
 data.pencapaianMonth.hhiMt,
 data.pencapaianMonth.tHek,
 data.pencapaianMonth.tPen,
 data.pctCapaiMonth,
 data.anggaranYtd.mt,
 data.anggaranYtd.tHek,
 data.pencapaianYtd.mt,
 data.pencapaianYtd.tHek,
 data.pctCapaiYtd,
 yoyVal,
 ]);

 row.eachCell((cell, colNumber) => {
 if (colNumber > 4 && colNumber !== 6) {
 cell.numFmt = "#,##0.00";
 if (colNumber === 14 || colNumber === 19 || colNumber === 20)
 cell.numFmt = '0.00"%"';
 }
 if (colNumber === 6 && cell.value !== "-") {
 cell.numFmt = "0";
 }
 cell.alignment = { horizontal: "center", vertical: "middle" };
 cell.border = {
 top: { style: "thin" },
 left: { style: "thin" },
 bottom: { style: "thin" },
 right: { style: "thin" },
 };

 if (isGrandTotal) {
 cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
 cell.fill = {
 type: "pattern",
 pattern: "solid",
 fgColor: { argb: "FF059669" },
 };
 } else if (isSubtotal) {
 cell.font = { bold: true, color: { argb: "FF064E3B" } };
 cell.fill = {
 type: "pattern",
 pattern: "solid",
 fgColor: { argb: "FFD1FAE5" },
 };
 } else if (
 data.blok !== "LF" &&
 (sortBy === "month" || sortBy === "ytd")
 ) {
 const pct =
 sortBy === "month" ? data.pctCapaiMonth : data.pctCapaiYtd;
 if (pct >= 100) {
 cell.fill = {
 type: "pattern",
 pattern: "solid",
 fgColor: { argb: "FF059669" },
 };
 cell.font = { color: { argb: "FFFFFFFF" } };
 } else if (pct >= 90) {
 cell.fill = {
 type: "pattern",
 pattern: "solid",
 fgColor: { argb: "FF6EE7B7" },
 };
 cell.font = { color: { argb: "FF022C22" } };
 } else if (pct >= 70) {
 cell.fill = {
 type: "pattern",
 pattern: "solid",
 fgColor: { argb: "FFFDE68A" },
 };
 cell.font = { color: { argb: "FF422006" } };
 } else {
 cell.fill = {
 type: "pattern",
 pattern: "solid",
 fgColor: { argb: "FFFB7185" },
 };
 cell.font = { color: { argb: "FFFFFFFF" } };
 }
 }
 });
 };

 // 7. Inject data
 sortedPkt1.forEach((r) => appendRow(r));
 appendRow(pkt1Total, true);
 sortedPkt2.forEach((r) => appendRow(r));
 appendRow(pkt2Total, true);
 appendRow(pkt12Total, true);
 appendRow(lfRow);
 appendRow(grandTotal, false, true);

 // 8. Download
 const buffer = await workbook.xlsx.writeBuffer();
 const blob = new Blob([buffer], {
 type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
 });
 saveAs(
 blob,
 `Laporan_Hasil_Bulanan_${dateStr.replace(/ /g, "_").replaceAll("/", "")}.xlsx`,
 );
 } catch (e) {
 console.error(e);
 alert("Gagal memuat turun Excel");
 }
 };

 return (
 <div
 id="hasil-bulanan-report"
 className="mt-8 md:mt-20 w-full px-4 mb-32 max-w-7xl mx-auto font-sans"
 >
 <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-6 gap-4 md:gap-6">
 <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
 <div className="flex flex-col items-center flex-shrink-0">
 <div className="bg-[#E11D48] text-white p-1.5 md:p-2 rounded-xl mb-1 shadow-md shadow-rose-900/20 ring-1 ring-[#E11D48]/30">
 <Leaf className="w-5 h-5 md:w-8 md:h-8" strokeWidth={2.5}/>
 </div>
 <span className="text-[7px] md:text-[10px] font-black tracking-widest text-[#E11D48]">
 FELDA
 </span>
 </div>
 <div className="flex flex-col">
 <h2 className="text-[11px] md:text-xl font-display font-black text-slate-800 dark:text-white tracking-tight leading-tight uppercase">
 FELDA PLANTATION MANAGEMENT SDN BHD
 </h2>
 <h3 className="text-[9px] md:text-sm font-bold dark:text-emerald-100 mt-0.5 uppercase tracking-wide">
 LAPORAN HASIL BULANAN MENGIKUT BLOK ${dbYear}
 </h3>
 <p className="text-[8px] md:text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
 BULAN {currentMonthName} SEHINGGA : {dateStr}
 </p>
 </div>
 </div>

 <div className="flex flex-col xs:flex-row items-center justify-center gap-2 w-full lg:w-auto no-screenshot">
 <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 md:p-1 rounded-xl border-emerald-200 dark:border-emerald-700 shadow-sm max-w-full no-scrollbar">
 {[
 { id: "id", label: "ASAL", icon: <Target size={10} /> },
 { id: "month", label: "BULAN", icon: <BarChart3 size={10} /> },
 { id: "ytd", label: "TAHUN", icon: <Trophy size={10} /> },
 { id: "yoy", label: "YOY", icon: <TrendingUp size={10} /> },
 ].map((btn) => (
 <button
 key={btn.id}
 onClick={() => setSortBy(btn.id as any)}
 className={`flex items-center gap-1 px-1.5 md:px-3 py-1.5 rounded-lg text-[8px] md:text-[10px] font-black transition-all whitespace-nowrap ${
 sortBy === btn.id
 ? "bg-emerald-800 dark:bg-emerald-400 text-white dark:text-slate-900 shadow-md shadow-slate-900/10 dark:shadow-white/10"
 : "dark:text-emerald-100 hover:bg-slate-200 dark:hover:bg-slate-700"
 }`}
 >
 {btn.icon}
 <span className="xs:inline">{btn.label}</span>
 </button>
 ))}

 <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>

 <div className="relative" ref={dropdownRef}>
 <button
 onClick={() => setShowDownloadMenu(!showDownloadMenu)}
 className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-100 shadow-sm transition-all active:scale-[0.95]"
 title="Muat Turun"
 >
 <DownloadCloud size={14} />
 </button>

 <AnimatePresence>
 {showDownloadMenu && (
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 10 }}
 className="absolute right-0 top-full mt-2 w-52 bg-white/95 dark:bg-[#072d1f]/98 backdrop-blur-xl rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-emerald-200 dark:border-slate-800 py-3 px-2 z-[100] ring-1 ring-black/5"
 >
 <div className="px-3 py-1.5 border-b border-emerald-100 dark:border-slate-800/50 mb-1">
 <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block">Fail Digital</span>
 </div>
 
 <div className="space-y-0.5">
 <button
 onClick={() => {
 handleExportTableToExcel();
 setShowDownloadMenu(false);
 }}
 className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-800 dark:text-emerald-100 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-left group"
 >
 <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center dark:text-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all">
 <FileSpreadsheet size={14} />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-bold uppercase tracking-tight">Excel</span>
 <span className="text-[7px] text-slate-400 leading-none">Data Mentah</span>
 </div>
 </button>

 <button
 onClick={() => {
 onDownloadPdf?.();
 setShowDownloadMenu(false);
 }}
 className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-800 dark:text-emerald-100 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-left group"
 >
 <div className="w-7 h-7 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
 <FileTextIcon size={14} />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-bold uppercase tracking-tight">PDF</span>
 <span className="text-[7px] text-slate-400 leading-none">Dokumen HD</span>
 </div>
 </button>

 <button
 onClick={() => {
 onScreenshot?.();
 setShowDownloadMenu(false);
 }}
 className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-800 dark:text-emerald-100 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-left group"
 >
 <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
 <Camera size={14} />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-bold uppercase tracking-tight">PNG</span>
 <span className="text-[7px] text-slate-400 leading-none">Imej Digital</span>
 </div>
 </button>
 </div>

 <div className="h-px bg-slate-100 dark:bg-slate-800/50 my-1.5 mx-1" />

 <button
 onClick={() => {
 onPrint?.();
 setShowDownloadMenu(false);
 }}
 className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-800 dark:text-emerald-100 hover:bg-slate-500/10 transition-all text-left group"
 >
 <div className="w-7 h-7 bg-slate-500/10 rounded-lg flex items-center justify-center text-emerald-700 dark:text-emerald-300 group-hover:bg-slate-600 group-hover:text-white transition-all">
 <Printer size={14} />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-bold uppercase tracking-tight">Cetak</span>
 <span className="text-[7px] text-slate-400 leading-none">Pencetak Fizikal</span>
 </div>
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>

 <div className="flex items-center gap-1 bg-white dark:bg-slate-800 py-2 px-1 md:p-1.5 rounded-xl border-emerald-200 dark:border-emerald-700 shadow-sm">
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
 </div>
 </div>

 {isFullscreen && (
 <div
 className="fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-sm cursor-pointer"
 onClick={() => setIsFullscreen(false)}
 />
 )}

 <div
 onClick={() => !isFullscreen && setIsFullscreen(true)}
 className={`transition-all duration-300 w-full ${
 isFullscreen
 ? "fixed inset-4 md:inset-8 z-[9999] bg-white dark:bg-[#072d1f] rounded-3xl shadow-2xl p-4 md:p-6 overflow-auto flex flex-col custom-scrollbar"
 : "bg-white dark:bg-[#072d1f] border-y border-x-0 sm:border sm:rounded-2xl border-emerald-200 dark:border-slate-800/40 dark:text-emerald-100 shadow-xl shadow-emerald-900/10 overflow-x-auto custom-scrollbar cursor-pointer hover:border-slate-300 dark:hover:border-emerald-700 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
 }`}
 >
 {isFullscreen && (
 <div className="flex justify-between items-center mb-4 no-screenshot sticky left-0 top-0 z-50">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-emerald-50 dark:bg-slate-800 rounded-full">
 <ScanLine
 size={16}
 className="text-emerald-500 dark:text-emerald-400"
 />
 </div>
 <p className="text-[10px] md:text-xs font-black dark:text-emerald-100 uppercase tracking-widest leading-tight">
 Fullscreen Mode
 <br />
 <span className="text-[8px] font-bold text-slate-400">
 Ready for Screenshot
 </span>
 </p>
 </div>
 <button
 onClick={(e) => {
 e.stopPropagation();
 setIsFullscreen(false);
 }}
 className="p-2 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-emerald-100 rounded-full transition-all"
 >
 <X size={16} />
 <span className="text-[10px] font-black uppercase tracking-widest pr-2">
 Tutup
 </span>
 </button>
 </div>
 )}
 <div
 ref={contentRef}
 className={
 isFullscreen
 ? "overflow-hidden flex-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60 dark:text-emerald-100 scrollbar-hide flex items-center justify-center bg-emerald-50/50 dark:bg-[#072d1f]/50"
 : ""
 }
 >
 <div
 style={{
 zoom: isFullscreen ? fitScale : 1,
 } as any}
 >
 <table
 ref={tableRef}
 className="w-full border-collapse bg-white dark:bg-emerald-950"
 style={{ minWidth: `${Math.max(2000, 2000 * ((zoom / 100) * renderScale))}px` }}
 >
 <thead className="sticky top-0 bg-emerald-900 text-[10px] uppercase font-black tracking-wider text-white z-30 shadow-md border-b-2 border-emerald-700">
 <tr>
 <th
 rowSpan={3}
 style={{ fontSize: `${Math.max(10, 14 * ((zoom / 100) * renderScale))}px` }}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-3 px-2 w-[4%] bg-emerald-900/90 dark:bg-emerald-900"
 >
 PKT
 </th>
 <th
 rowSpan={3}
 style={{ fontSize: `${Math.max(10, 14 * ((zoom / 100) * renderScale))}px` }}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-3 px-2 w-[8%] bg-emerald-900/90 dark:bg-emerald-900"
 >
 THN TUAI
 </th>
 <th
 rowSpan={3}
 style={{ fontSize: `${Math.max(10, 14 * ((zoom / 100) * renderScale))}px` }}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-3 px-2 w-[5%] bg-emerald-900/90 dark:bg-emerald-900"
 >
 TAR/MT
 </th>
 <th
 rowSpan={3}
 style={{ fontSize: `${Math.max(12, 16 * ((zoom / 100) * renderScale))}px` }}
 className="sticky left-0 border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-3 px-2 w-[5%] bg-emerald-900/95 dark:bg-emerald-950/95 z-40 shadow-md"
 >
 BLOK
 </th>
 <th
 rowSpan={3}
 style={{ fontSize: `${Math.max(10, 14 * ((zoom / 100) * renderScale))}px` }}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-3 px-2 w-[6%] bg-emerald-900/90 dark:bg-emerald-900"
 >
 LUAS
 </th>
 <th
 rowSpan={3}
 style={{ fontSize: `${Math.max(10, 14 * ((zoom / 100) * renderScale))}px` }}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-3 px-2 w-[4%] bg-emerald-900/90 dark:bg-emerald-900"
 >
 JUM PEN.
 </th>
 <th
 rowSpan={2}
 style={{ fontSize: `${Math.max(10, 14 * ((zoom / 100) * renderScale))}px` }}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-3 px-2 bg-emerald-900/90 dark:bg-emerald-900"
 >
 CAPAI
 </th>
 <th
 colSpan={7}
 style={{ fontSize: `${Math.max(11, 15 * ((zoom / 100) * renderScale))}px` }}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-3 px-2 bg-emerald-800 dark:bg-emerald-800"
 >
 BULAN INI
 </th>
 <th
 colSpan={6}
 style={{ fontSize: `${Math.max(11, 15 * ((zoom / 100) * renderScale))}px` }}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-3 px-2 bg-emerald-800 dark:bg-emerald-800"
 >
 HINGGA BULAN INI
 </th>
 </tr>
 <tr style={{ fontSize: `${Math.max(10, 14 * ((zoom / 100) * renderScale))}px` }}>
 <th
 colSpan={2}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-emerald-50 py-2 px-1 font-semibold bg-emerald-800/80"
 >
 ANGGARAN
 </th>
 <th
 colSpan={4}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-emerald-50 py-2 px-1 font-semibold bg-emerald-800/80"
 >
 PENCAPAIAN
 </th>
 <th
 rowSpan={2}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-emerald-50 py-3 px-2 font-semibold bg-emerald-800/80"
 >
 % CAPAI
 </th>
 <th
 colSpan={2}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-emerald-50 py-2 px-1 font-semibold bg-emerald-800/80"
 >
 ANGGARAN
 </th>
 <th
 colSpan={2}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-emerald-50 py-2 px-1 font-semibold bg-emerald-800/80"
 >
 PENCAPAIAN
 </th>
 <th
 rowSpan={2}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-emerald-50 py-3 px-2 font-semibold bg-emerald-800/80"
 >
 % CAPAI
 </th>
 <th
 rowSpan={2}
 className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 text-emerald-50 py-3 px-2 font-semibold bg-emerald-800/80"
 >
 YOY
 </th>
 </tr>
 <tr style={{ fontSize: `${Math.max(9, 12 * ((zoom / 100) * renderScale))}px` }}>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 py-2 px-1 min-w-[70px] bg-emerald-900/90 dark:bg-emerald-900">
 {currentMonthName} 2025 <br />
 T/HEK
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[60px] bg-emerald-800 dark:bg-emerald-800">
 M/T
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[50px] bg-emerald-800 dark:bg-emerald-800">
 T/HEK
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[60px] bg-emerald-800 dark:bg-emerald-800">
 H.I M/T
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[60px] bg-emerald-800 dark:bg-emerald-800">
 H.H.I M/T
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[50px] bg-emerald-800 dark:bg-emerald-800">
 T/HEK
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[50px] bg-emerald-800 dark:bg-emerald-800">
 T/PEN
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[60px] bg-emerald-800 dark:bg-emerald-800">
 M/T
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[50px] bg-emerald-800 dark:bg-emerald-800">
 T/HEK
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[60px] bg-emerald-800 dark:bg-emerald-800">
 M/T
 </th>
 <th className=" border-b border-r border-emerald-700/50 dark:border-emerald-800/40 dark:text-emerald-100 py-2 px-1 min-w-[50px] bg-emerald-800 dark:bg-emerald-800">
 T/HEK
 </th>
 </tr>
 </thead>
 <tbody className="text-[10px] text-slate-800 dark:text-emerald-100">
 {sortedPkt1.map((row) => renderRow(row))}
 {renderRow(pkt1Total, true)}
 {sortedPkt2.map((row) => renderRow(row))}
 {renderRow(pkt2Total, true)}
 {renderRow(pkt12Total, true)}
 {renderRow(lfRow)}
 {renderRow(grandTotal, false, true)}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 <div className="mt-8 flex justify-between items-center text-[10px] dark:text-emerald-100 font-bold uppercase tracking-widest px-2">
 <div className="flex gap-6">
 <span className="flex items-center gap-2">
 <div className="w-4 h-4 rounded-md bg-emerald-50 dark:bg-emerald-800/80 border border-emerald-200 dark:border-emerald-700 shadow-sm" />{" "}
 Sub-Total
 </span>
 <span className="flex items-center gap-2">
 <div className="w-4 h-4 rounded-md bg-emerald-800 dark:bg-emerald-400 border border-slate-900 dark:border-white shadow-md" />{" "}
 Jumlah Besar
 </span>
 </div>
 <p className="opacity-80">
 DIJANA SECARA AUTOMATIK OLEH SISTEM FPMSB TUNGGAL v3.3
 </p>
 </div>
 </div>
 );
};
