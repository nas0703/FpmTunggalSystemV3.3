/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import {
  motion,
  AnimatePresence,
  Reorder,
  useDragControls,
} from "motion/react";
import { parseReceipt } from "./utils/ocrParser";
import { supabase } from "./services/supabaseClient";
import { HISTORICAL_BLOCK_YIELDS } from "./utils/historicalYieldData";
import {
  ScanLine,
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Leaf,
  FileText,
  Loader2,
  Lock,
  Delete,
  History,
  Calendar,
  Trophy,
  Droplets,
  Factory,
  Camera,
  Download,
  Upload,
  Sun,
  Moon,
  Percent,
  Zap,
  FileSpreadsheet,
  Package,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Map as MapIcon,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  LogOut,
  Plus,
  X,
  Trash2,
  CircleDollarSign,
  MoveHorizontal,
  ZoomIn,
  ZoomOut,
  Minus,
  User,
  Settings,
  HelpCircle,
  Info,
  CloudUpload,
  DownloadCloud,
  FileText as FileTextIcon,
  Printer,
  PieChart as PieChartIcon,
  Share2,
  CloudRain,
  Clipboard,
  ClipboardCheck,
  Scissors,
  Share,
  MessageCircle,
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import pptxgen from "pptxgenjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Brush,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  ReferenceLine,
  ComposedChart,
  PieChart,
  Pie,
} from "recharts";

import { FertilizerModule } from "./features/fertilizer/FertilizerModule";
import { FertilizerInput } from "./features/fertilizer/components/FertilizerInput";
import { PruningModule } from "./features/pruning/PruningModule";
import { AbwView } from "./features/hasil/components/AbwView";
import { BbcView } from "./features/hasil/components/BbcView";
import { LaporanView } from "./features/hasil/components/LaporanView";
import { Header } from "./layout/Header";
import { BottomNav } from "./layout/BottomNav";
import { LoginScreen } from "./features/auth/components/LoginScreen";
import { SettingsModal } from "./components/common/modals/SettingsModal";
import { NewFeaturesModal } from "./components/common/modals/NewFeaturesModal";
import { DeleteRecordModal } from "./components/common/modals/DeleteRecordModal";
import { ExportModal } from "./components/common/modals/ExportModal";
import { ShareModal } from "./components/common/modals/ShareModal";

import { useAuth } from "./features/auth/hooks/useAuth";
import { useAppUIState } from "./hooks/useAppUIState";

import { HasilBulananTable } from "./features/dashboard/components/HasilBulananTable";
import { ReportSummarySection } from "./features/dashboard/components/ReportSummarySection";
import { FloatingInput } from "./components/ui/FloatingInput";

import { DigitalClock } from "./components/common/DigitalClock";
import { LaporanHujanView } from "./features/hasil/components/LaporanHujanView";
import { SejarahTab } from "./features/sejarah/components/SejarahTab";
import { InputTab } from "./features/input/components/InputTab";
import { ReportTab } from "./components/common/ReportTab";

import { PruningInput } from "./features/pruning/components/PruningInput";

import {
  CHART_COLORS,
  TARGET_ANNUAL_PKT1,
  TARGET_ANNUAL_PKT2,
  TARGET_ANNUAL_FELDA,
  MONTHLY_TARGETS_2026,
  MASTER_DATA,
  YIELD_DATA_2025,
  ABW_DATA,
  EFB_DATA_2026,
} from "./utils/constants";

export interface Transaction {
  id?: string | number;
  no_resit: string;
  no_akaun_terima?: string;
  no_lori: string;
  no_seal?: string;
  no_nota_hantaran?: string;
  kpg?: string;
  blok: string;
  tan: number;
  muda: number;
  reject?: number;
  sample?: number;
  rm_mt?: number;
  hasil_rm?: number;
  thek?: number;
  tarikh: string;
  masa_masuk?: string;
  created_at?: string;
  peringkat?: string;
  is_efb?: boolean;
}

const initialHujanData = [
  { bulan: 'JAN', '2021': 901.00, '2022': 123.00, '2023': 504.50, '2024': 836.00, '2025': 447.50, '2026': 29.50 },
  { bulan: 'FEB', '2021': 0.00, '2022': 181.00, '2023': 269.00, '2024': 72.50, '2025': 168.50, '2026': 67.00 },
  { bulan: 'MAC', '2021': 100.00, '2022': 127.50, '2023': 284.00, '2024': 75.00, '2025': 576.50, '2026': 41.00 },
  { bulan: 'APR', '2021': 257.00, '2022': 245.50, '2023': 98.50, '2024': 223.00, '2025': 278.00, '2026': null },
  { bulan: 'MEI', '2021': 192.50, '2022': 251.00, '2023': 94.50, '2024': 250.50, '2025': 240.00, '2026': null },
  { bulan: 'JUN', '2021': 135.00, '2022': 184.50, '2023': 202.00, '2024': 211.00, '2025': 133.50, '2026': null },
  { bulan: 'JUL', '2021': 235.00, '2022': 186.50, '2023': 184.00, '2024': 92.00, '2025': 140.50, '2026': null },
  { bulan: 'OGOS', '2021': 326.00, '2022': 261.00, '2023': 226.00, '2024': 133.50, '2025': 186.00, '2026': null },
  { bulan: 'SEPT', '2021': 152.00, '2022': 194.00, '2023': 231.00, '2024': 277.00, '2025': 261.50, '2026': null },
  { bulan: 'OKT', '2021': 179.50, '2022': 271.00, '2023': 170.00, '2024': 331.00, '2025': 98.00, '2026': null },
  { bulan: 'NOV', '2021': 452.50, '2022': 301.00, '2023': 243.00, '2024': 243.00, '2025': 199.50, '2026': null },
  { bulan: 'DIS', '2021': 181.00, '2022': 228.00, '2023': 378.00, '2024': 164.00, '2025': 234.00, '2026': null },
  { bulan: 'JUMLAH', '2021': 3111.50, '2022': 2554.00, '2023': 2884.50, '2024': 2908.50, '2025': 2963.50, '2026': 137.50 },
];

// --- SUB-COMPONENTS ---

export default function App() {
  const [hujanData, setHujanData] = useState<any[]>(() => {
    const saved = localStorage.getItem('hujanData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialHujanData;
      }
    }
    return initialHujanData;
  });

  useEffect(() => {
    localStorage.setItem('hujanData', JSON.stringify(hujanData));
  }, [hujanData]);

  useEffect(() => {
    const fetchHujanFromSupabase = async () => {
      try {
        const { data, error } = await supabase.from('hujan_rekod').select('*');
        if (error) {
           console.log("No hujan_rekod table found or error fetching:", error.message);
           return;
        }
        
        if (data && data.length > 0) {
          setHujanData(prev => {
            // Kita mulakan dari prev (yang mungkin ada local storage data)
            let newData = [...prev];
            
            // Masukkan setiap rekod dari supabase ke dalam newData
            data.forEach((rekod: any) => {
              newData = newData.map(item => {
                if (item.bulan.toUpperCase() === rekod.bulan.toUpperCase()) {
                  // Tolong cast tahun sebagai string untuk elak ralat jika Supabase return integer
                  const tahunKey = String(rekod.tahun);
                  return { ...item, [tahunKey]: rekod.jumlah };
                }
                return item;
              });
            });

            // Recalculate JUMLAH supaya data konsisten
            const yearsList = ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'];
            newData = newData.map(item => {
              if (item.bulan === 'JUMLAH') {
                const newJumlahRow = { ...item };
                yearsList.forEach(y => {
                  let yTotal = 0;
                  let hasDataForYear = false;
                  newData.forEach(dataItem => {
                    if (dataItem.bulan !== 'JUMLAH' && dataItem[y] != null) {
                      yTotal += dataItem[y];
                      hasDataForYear = true;
                    }
                  });
                  newJumlahRow[y] = hasDataForYear ? yTotal : null;
                });
                return newJumlahRow;
              }
              return item;
            });

            return newData;
          });
        }
      } catch (err) {
        console.error("Error connecting to supabase for hujan:", err);
      }
    };

    fetchHujanFromSupabase();
  }, []);

  const {
    activeTab,
    setActiveTab,
    direction,
    setDirection,
    handleTabChange,
    handleMainTabSwipe,
  } = useAppUIState();

  const {
    authRole,
    pin,
    loginError,
    handlePinPress,
    handleDeletePress,
    handleLogout
  } = useAuth({
    onLoginSuccess: (role) => {
      setActiveTab(role === "staff" ? "scan" : "dashboard");
    },
    onLogout: () => {
      setActiveTab("scan");
    }
  });

  const [dashboardDate, setDashboardDate] = useState(() => {
    const now = new Date();
    // Offset for Malaysia Time (UTC+8)
    const myTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    // getUTCHours() on myTime will give the Malaysia local hour
    const hours = myTime.getUTCHours();

    if (hours < 7) {
      // If before 7 AM, use yesterday
      const yesterday = new Date(myTime.getTime() - 24 * 60 * 60 * 1000);
      return yesterday.toISOString().split("T")[0];
    }
    return myTime.toISOString().split("T")[0];
  });
  const [showReportDatePicker, setShowReportDatePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewFeaturesModal, setShowNewFeaturesModal] = useState(false);
  const [historyFilterDate, setHistoryFilterDate] = useState<string>("");

  // Recent Updates / What's New Data
  const recentUpdates = [
    {
      version: "VER 3.3",
      date: "27 April 2026",
      items: [
        {
          title: "Muat Turun Pelbagai Format",
          desc: "Keupayaan untuk memuat turun jadual analisis ke dalam format Excel, PDF, PNG, dan Cetakan terus.",
          icon: <DownloadCloud size={16} className="text-emerald-500" />,
          iconBg: "bg-emerald-500/10",
        },
        {
          title: "Paparan Kompak Pro",
          desc: "Rekaan 30% lebih padat dengan pengepala jadual bersepadu untuk pemantauan prestasi blok yang lebih efisien.",
          icon: <LayoutDashboard size={16} className="text-teal-500" />,
          iconBg: "bg-teal-500/10",
        },
        {
          title: "Analisis KPG=KPA %",
          desc: "Ketepatan data kini dipaparkan dalam bentuk peratusan dinamik pada kad ringkasan dan senarai blok.",
          icon: <Percent size={16} className="text-amber-500" />,
          iconBg: "bg-amber-500/10",
        },
        {
          title: "Ranking Dinamik",
          desc: "Sistem ranking blok yang lebih responsif berdasarkan prestasi bulanan dan tahunan.",
          icon: <Trophy size={16} className="text-blue-500" />,
          iconBg: "bg-blue-500/10",
        },
        {
          title: "Muat Naik Resit (OCR)",
          desc: "Kini anda boleh memuat naik gambar resit dari galeri. Sistem akan mengekstrak data secara automatik.",
          icon: <CloudUpload size={16} className="text-purple-500" />,
          iconBg: "bg-purple-500/10",
        },
      ],
    },
    {
      version: "VER 3.2",
      date: "Mac 2026",
      items: [
        {
          title: "Modul Pruning (Pemangkasan)",
          desc: "Sistem pengurusan rekod pemangkasan blok dengan status progres visual.",
          icon: <Scissors size={14} className="text-slate-400" />,
        },
        {
          title: "Tangkapan Skrin HD",
          desc: "Fungsi simpan paparan dashboard sebagai imej berkualiti tinggi untuk perkongsian.",
          icon: <Camera size={14} className="text-rose-400" />,
        },
      ],
    },
  ];
  const [isNavigating, setIsNavigating] = useState(false);
  const [showRCReportModal, setShowRCReportModal] = useState(false);
  const [activeHasilTab, setActiveHasilTab] = useState<'kpi' | 'laporan' | 'analitik' | 'abw' | 'bbc' | 'hujan'>('kpi');
  
  const [reportType, setReportType] = useState<
    | "hasil"
    | "muda"
    | "kpa_kpg"
    | "harga"
    | "efb"
    | "efc_format"
    | "baja"
    | "pruning"
  >("hasil");
  const [reportTabs, setReportTabs] = useState<any[]>(() => {
    const defaultTabs = [
      { id: "pruning", label: "Pruning" },
      { id: "hasil", label: "Hasil" },
      { id: "baja", label: "Baja" },
      { id: "muda", label: "Bts Muda" },
      { id: "kpa_kpg", label: "Kpg=Kpa" },
      { id: "efb", label: "Efb" },
      { id: "harga", label: "Harga Bts" },
    ];

    const saved = localStorage.getItem("report_tabs_order");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure 'pruning' exists in the saved tabs
        const hasPruning = parsed.some((t: any) => t.id === "pruning");
        if (!hasPruning) {
          // Splice it at the beginning or merge
          return [{ id: "pruning", label: "Pruning" }, ...parsed];
        }
        return parsed;
      } catch (e) {
        return defaultTabs;
      }
    }
    return defaultTabs;
  });

  useEffect(() => {
    localStorage.setItem("report_tabs_order", JSON.stringify(reportTabs));
  }, [reportTabs]);

  const [isReordering, setIsReordering] = useState(false);
  const longPressTimer = useRef<any>(null);
  const dragControls = useDragControls();

  const [swipeDirection, setSwipeDirection] = useState<"left" | "right">(
    "left",
  );
  const [showRanking, setShowRanking] = useState(false);
  const [rankingPeriod, setRankingPeriod] = useState<"month" | "year" | "yoy">(
    "month",
  );
  const [chartPeriod, setChartPeriod] = useState<
    "day" | "month" | "year" | "history" | "monthly_trend"
  >("month");
  const [chartMetric, setChartMetric] = useState<
    "yield" | "muda" | "kpg" | "efb"
  >("yield");
  const [showYtdChart, setShowYtdChart] = useState(true);
  const [showMonthlyTrendChart, setShowMonthlyTrendChart] = useState(true);
  const [showPriceTrendChart, setShowPriceTrendChart] = useState(true);
  const [showThekChart, setShowThekChart] = useState(true);
  const [showRankingCollapsed, setShowRankingCollapsed] = useState(false);
  const [showTrendCollapsed, setShowTrendCollapsed] = useState(false);
  const [showSummaryCollapsed, setShowSummaryCollapsed] = useState(false);
  const [showDetailsCollapsed, setShowDetailsCollapsed] = useState(false);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>("all");
  const [selectedPactFilter, setSelectedPactFilter] = useState<string>("all");
  const [configStatus, setConfigStatus] = useState<{
    supabase: boolean;
    googleSheets: boolean;
  } | null>(null);

  const monthlyTrendRef = useRef<HTMLDivElement>(null);
  const thekChartRef = useRef<HTMLDivElement>(null);

  // Sync chart metric and period with report type
  useEffect(() => {
    let targetMetric: "yield" | "muda" | "kpg" | "efb" = "yield";
    if (reportType === "muda") targetMetric = "muda";
    else if (reportType === "kpa_kpg") targetMetric = "kpg";
    else if (reportType === "efb") targetMetric = "efb";

    setChartMetric(targetMetric);

    // If switching away from hasil and in history mode, reset to month
    if (reportType !== "hasil" && chartPeriod === "history") {
      setChartPeriod("month");
    }
  }, [reportType]);

  const [formData, setFormData] = useState({
    no_resit: "",
    no_akaun_terima: "",
    no_lori: "",
    no_seal: "",
    no_nota_hantaran: "",
    kpg: "",
    blok: "",
    tan: "",
    muda: "",
    reject: "0.00",
    sample: "0",
    rm_mt: "",
    tarikh: "",
    masa_masuk: "",
    is_efb: false,
    is_baja: false,
    is_pruning: false,
    is_hujan: false,
  });
  const [rawData, setRawData] = useState<Transaction[]>([]);
  const [blockAnnualData, setBlockAnnualData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [sharePreviewData, setSharePreviewData] = useState<{
    file: File;
    url: string;
    name: string;
  } | null>(null);
  const [showOcrActions, setShowOcrActions] = useState(false);
  const [exportFilter, setExportFilter] = useState<"all" | "date" | "month">(
    "all",
  );
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [exportDate, setExportDate] = useState(
    new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  );
  const [exportMonth, setExportMonth] = useState(
    new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 7),
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewFeatures, setShowNewFeatures] = useState(false);
  const [expandedTrendChart, setExpandedTrendChart] = useState<
    "overall" | "pkt1" | "pkt2" | "felda" | null
  >(null);
  const [dashboardTrendView, setDashboardTrendView] = useState<
    "overall" | "pkt1" | "pkt2" | "felda"
  >("overall");
  const [isThekExpanded, setIsThekExpanded] = useState(false);
  const [showFSA13Report, setShowFSA13Report] = useState(true);

  const [isPieExpanded, setIsPieExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [thekSortMode, setThekSortMode] = useState<"blok" | "desc" | "asc">(
    "blok",
  );
  const [thekHistoryView, setThekHistoryView] = useState<
    "overall" | "pkt1" | "pkt2" | "felda"
  >("overall");
  const [exportColumns, setExportColumns] = useState<string[]>([
    "tarikh",
    "no_resit",
    "no_lori",
    "blok",
    "tan",
    "muda",
    "kpg",
  ]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });
  const [isSharingBts, setIsSharingBts] = useState(false);

  const handleShareBtsReport = async () => {
    try {
      setIsSharingBts(true);
      const element = document.getElementById("laporan-harga-bts");
      if (!element) return;

      const { toBlob } = await import("html-to-image");

      // Temporary hide the share button during screenshot
      const shareBtn = element.querySelector(".share-bts-btn") as HTMLElement;
      if (shareBtn) shareBtn.style.display = "none";

      // Hide past months and limit to 10 recent days to only capture "bulan semasa"
      const firstRowWithMonth = element.querySelector("tr[data-month]");
      const latestMonth = firstRowWithMonth
        ? firstRowWithMonth.getAttribute("data-month")
        : null;
      const hiddenRows: HTMLElement[] = [];

      if (latestMonth) {
        const allRows = element.querySelectorAll("tr[data-month]");
        let visibleDataDays = 0;

        allRows.forEach((row) => {
          const isMonthHeader = row.querySelector("td[colspan='3']") !== null;

          if (row.getAttribute("data-month") !== latestMonth) {
            // Hide past months entirely
            const htmlRow = row as HTMLElement;
            htmlRow.style.setProperty("display", "none", "important");
            hiddenRows.push(htmlRow);
          } else if (!isMonthHeader) {
            // Count actual data days, hide if more than 10
            visibleDataDays++;
            if (visibleDataDays > 10) {
              const htmlRow = row as HTMLElement;
              htmlRow.style.setProperty("display", "none", "important");
              hiddenRows.push(htmlRow);
            }
          }
        });
      }

      const blob = await toBlob(element, {
        pixelRatio: 2,
        backgroundColor: isDarkMode ? "#0f172a" : "#ffffff", // slate-900 / white
      });

      if (shareBtn) shareBtn.style.display = "flex";

      // Restore past months visibility
      hiddenRows.forEach((row) => {
        row.style.removeProperty("display");
      });

      if (!blob) throw new Error("Gagal menjana imej");

      const file = new File([blob], "laporan_harga_bts.png", {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Laporan Harga BTS",
          text: "Laporan Harga BTS Terkini",
        });
      } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "laporan_harga_bts.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error sharing report:", error);
      alert("Ralat semasa menjana imej laporan.");
    } finally {
      setIsSharingBts(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const safeFetch = async (
    url: string,
    options?: RequestInit,
    retries = 3,
  ): Promise<any> => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");

      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(text || `Ralat pelayan (${res.status})`);
        }
        return text;
      }

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || `Ralat pelayan (${res.status})`,
        );
      }
      return data;
    } catch (e: any) {
      if (
        retries > 0 &&
        (e.message?.includes("fetch") || e.name === "TypeError")
      ) {
        console.warn(`Fetch failed, retrying... (${retries} left)`, e);
        await new Promise((r) => setTimeout(r, 1000));
        return safeFetch(url, options, retries - 1);
      }
      throw e;
    }
  };

  const fetchData = async (silent = false) => {
    try {
      if (!silent) showToast("success", "Mengambil data terbaru...");

      // Parallel fetch for better performance
      const [data, blockYields] = await Promise.all([
        safeFetch("/api/hantaran"),
        safeFetch("/api/block-annual-yields"),
      ]);

      if (Array.isArray(data)) {
        const parsedData = data.map((item: any) => {
          const rawBlok = String(item.blok || "").trim();
          const cleanBlok = rawBlok
            ? parseInt(rawBlok.replace(/[^0-9]/g, ""), 10).toString()
            : "";

          // Normalize date to YYYY-MM-DD
          let normalizedDate = "";
          const currentYearVal = new Date().getFullYear().toString();
          if (item.tarikh) {
            const datePart = item.tarikh.split(/T| /)[0];
            const separator = datePart.includes("-")
              ? "-"
              : datePart.includes("/")
                ? "/"
                : "";
            if (separator) {
              const parts = datePart.split(separator);
              if (parts.length === 3) {
                if (parts[0].length === 4) {
                  // YYYY-MM-DD or YYYY/MM/DD
                  if (parts[0] !== currentYearVal) parts[0] = currentYearVal; // Auto-correct OCR year
                  normalizedDate = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
                } else if (parts[2].length === 4) {
                  // DD-MM-YYYY or DD/MM/YYYY
                  if (parts[2] !== currentYearVal) parts[2] = currentYearVal; // Auto-correct OCR year
                  normalizedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                }
              }
            }
          }

          // Fallback to created_at if tarikh is missing or invalid
          if (!normalizedDate && item.created_at) {
            const myT = new Date(
              new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
            );
            normalizedDate = myT.toISOString().split("T")[0];
            if (myT.getUTCHours() < 8) {
              const [y, m, d] = normalizedDate.split("-");
              const p = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d)));
              p.setUTCDate(p.getUTCDate() - 1);
              normalizedDate = p.toISOString().split("T")[0];
            }
          }

          const rawKpg = String(item.kpg || "")
            .trim()
            .replace(",", ".");
          const cleanKpg = rawKpg.replace(/[^0-9.]/g, "");

          const rawTan = String(item.tan || "")
            .trim()
            .replace(",", ".");
          const cleanTan = parseFloat(rawTan.replace(/[^0-9.]/g, "")) || 0;

          const rawMuda = String(item.muda || "")
            .trim()
            .replace(",", ".");
          const cleanMuda = parseFloat(rawMuda.replace(/[^0-9.]/g, "")) || 0;

          const cleanReject =
            parseFloat(String(item.reject || "0").replace(",", ".")) || 0;
          const cleanSample = parseInt(String(item.sample || "0")) || 0;
          const cleanRmMt =
            parseFloat(String(item.rm_mt || "0").replace(",", ".")) || 0;
          const cleanHasilRm =
            parseFloat(String(item.hasil_rm || "0").replace(",", ".")) ||
            cleanTan * cleanRmMt;

          return {
            ...item,
            tan: cleanTan,
            muda: cleanMuda,
            kpg: cleanKpg,
            blok: cleanBlok,
            tarikh: normalizedDate.trim(),
            no_akaun_terima: item.no_akaun_terima || "",
            reject: cleanReject,
            sample: cleanSample,
            rm_mt: cleanRmMt,
            hasil_rm: parseFloat(cleanHasilRm.toFixed(2)),
          };
        });
        setRawData(parsedData);
      } else {
        setRawData([]);
      }

      if (Array.isArray(blockYields)) {
        setBlockAnnualData(blockYields);

        // Seed if empty and data provided
        if (blockYields.length === 0 && HISTORICAL_BLOCK_YIELDS.length > 0) {
          console.log("Seeding historical block yields...");
          await seedHistoricalData();
        }
      }
    } catch (e: any) {
      console.error("Fetch error:", e);
      showToast(
        "error",
        e.message ||
          "Gagal memuat turun data. Sila periksa sambungan internet.",
      );
    }
  };

  const seedHistoricalData = async () => {
    try {
      await safeFetch("/api/seed-historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: HISTORICAL_BLOCK_YIELDS }),
      });
      console.log("Historical data seeded successfully");
      const blockYields = await safeFetch("/api/block-annual-yields");
      if (Array.isArray(blockYields)) setBlockAnnualData(blockYields);
    } catch (e) {
      console.error("Failed to seed historical data:", e);
    }
  };

  const handleDeleteRecord = async (no_resit: string) => {
    try {
      setIsProcessing(true);
      await safeFetch(`/api/hantaran/${no_resit}`, {
        method: "DELETE",
      });

      showToast("success", `Rekod ${no_resit} telah dipadam.`);
      setRecordToDelete(null);
      fetchData(true);
    } catch (e: any) {
      console.error("Delete error:", e);
      showToast("error", e.message || "Gagal memadam data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAllRecords = async () => {
    try {
      setIsProcessing(true);
      await safeFetch("/api/hantaran/all", {
        method: "DELETE",
      });

      showToast("success", "Semua rekod telah dipadam.");
      setShowDeleteAllModal(false);
      fetchData(true);
    } catch (e: any) {
      console.error("Delete all error:", e);
      showToast("error", e.message || "Gagal memadam semua data.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-scroll active report type into center on mount
  React.useEffect(() => {
    if (activeTab === "dashboard") {
      const activeBtn = document.querySelector(
        `button[data-report-id="${reportType}"]`,
      );
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab, reportType]);

  const handleSwipe = (direction: "left" | "right") => {
    if (isNavigating) return;

    setSwipeDirection(direction);
    const types = reportTabs.map((r) => r.id);
    const currentIndex = types.indexOf(reportType);

    if (currentIndex === -1) return;

    setIsNavigating(true);
    let nextIndex;
    // When content is swiped LEFT, we want to go to the NEXT tab (index + 1)
    if (direction === "left") {
      nextIndex = (currentIndex + 1) % types.length;
    } else {
      nextIndex = (currentIndex - 1 + types.length) % types.length;
    }

    const nextType = types[nextIndex];
    setReportType(nextType);

    // Reset navigating lock after animation duration
    setTimeout(() => {
      setIsNavigating(false);
    }, 400);
  };

  const checkConfig = async () => {
    try {
      const data = await safeFetch("/api/config-check");
      setConfigStatus(data);
    } catch (e) {
      console.error("Config check failed", e);
    }
  };

  useEffect(() => {
    if (authRole) {
      fetchData(true);
      checkConfig();
    }
  }, [authRole]);

  useEffect(() => {
    if (!authRole) return;

    const channel = supabase
      .channel("hantaran-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hantaran_hasil" },
        (payload) => {
          console.log("🔥 Real-time event:", payload.eventType, payload);

          if (payload.eventType === "INSERT") {
            setRawData((prev) => {
              const exists = prev.find((p) => p.id === payload.new.id);
              if (exists) return prev;
              showToast("success", `Data baru: Resit ${payload.new.no_resit}`);
              return [payload.new as Transaction, ...prev];
            });
          }

          if (payload.eventType === "DELETE") {
            setRawData((prev) => prev.filter((p) => p.id !== payload.old.id));
            showToast("error", "Rekod telah dipadam.");
          }

          if (payload.eventType === "UPDATE") {
            setRawData((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? (payload.new as Transaction) : p,
              ),
            );
            showToast(
              "success",
              `Rekod dikemaskini: Resit ${payload.new.no_resit}`,
            );
          }
        },
      )
      .subscribe((status, err) => {
        console.log(`Supabase real-time status: ${status}`, err || "");
        
        if (status === "SUBSCRIBED") {
          console.log("✅ Supabase real-time connected successfully.");
        }
        
        if (status === "CHANNEL_ERROR") {
          console.error("❌ Supabase subscription error:", err);
          // Don't show toast immediately to avoid spamming if it retries
        }
        
        if (status === "TIMED_OUT") {
          console.warn("⚠️ Supabase subscription timed out. Retrying...");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Generate Regional Controller Report (WhatsApp Format)
  const generateRCReport = () => {
    if (!analytics || !analytics.day || !analytics.month || !analytics.year)
      return "Memuatkan data...";

    const today = analytics.displayDate
      ? new Date(analytics.displayDate)
      : new Date();
    const currentYearNum = today.getFullYear();
    const prevYearNum = currentYearNum - 1;
    const dateStr = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const luasPkt1 = Object.values(MASTER_DATA)
      .filter((b) => b.pkt === "001")
      .reduce((acc, curr) => acc + curr.luas, 0);
    const luasPkt2 = Object.values(MASTER_DATA)
      .filter((b) => b.pkt === "002")
      .reduce((acc, curr) => acc + curr.luas, 0);
    const totalLuas = luasPkt1 + luasPkt2;

    const sections = [
      {
        name: "Peringkat 1",
        pkt: "001",
        area: luasPkt1,
        blocks: Array.from({ length: 17 }, (_, i) => String(i + 1)),
        ttnYield: TARGET_ANNUAL_PKT1,
        ttn2025Yield: 27.0,
        category: "Lot Peneroka\nMatang Utama\n(Tahun 15)",
      },
      {
        name: "Peringkat 2",
        pkt: "002",
        area: luasPkt2,
        blocks: ["18", "19", "20", "21", "22"],
        ttnYield: TARGET_ANNUAL_PKT2,
        ttn2025Yield: 26.8,
        category: "Lot peneroka\nMatang Utama\n(Tahun 9)",
      },
    ];

    let report = `*FPMSB TUNGGAL*\nLaporan Hasil Harian (mengikut FSA 13)\nHasil Hingga : ${dateStr}\n..............................................................\n`;

    sections.forEach((sec) => {
      report += `${sec.category}\n${sec.name} : (${sec.area.toFixed(2)} Ha)\n\n`;

      sec.blocks.forEach((blkId) => {
        const bMonth = analytics.month.blokStats.find(
          (b: any) => b.blok === blkId,
        );
        const label = blkId.padStart(2, "0");
        const yieldVal = bMonth?.yieldHek || 0;
        const tanVal = bMonth?.tan || 0;
        report += `${label}-\t${yieldVal.toFixed(2)}\tT/Ha\t(\t${tanVal.toFixed(2)}\tM/t\t)\n`;
      });
      report += `\n`;

      // H.I
      const d = analytics.day;
      const dTan = sec.pkt === "001" ? d.pkt1_tan || 0 : d.pkt2_tan || 0;
      const dTarget =
        sec.pkt === "001" ? d.pkt1_target || 0 : d.pkt2_target || 0;
      const dYield = sec.area > 0 ? dTan / sec.area : 0;
      const dTargetYield = sec.area > 0 ? dTarget / sec.area : 0;
      const dPct = dTarget > 0 ? (dTan / dTarget) * 100 : 0;
      report += `H.I\nT-\t${dTarget.toFixed(2)}\tM/t @\t${dTargetYield.toFixed(2)}\tT/Ha\t\t\nC-\t${dTan.toFixed(2)}\tM/t @\t${dYield.toFixed(2)}\tT/Ha (\t${dPct.toFixed(2)}%\t)\n\n`;

      // B.I
      const m = analytics.month;
      const mTan = sec.pkt === "001" ? m.pkt1_tan || 0 : m.pkt2_tan || 0;
      const mTarget =
        sec.pkt === "001" ? m.pkt1_target || 0 : m.pkt2_target || 0;
      const mYield = sec.area > 0 ? mTan / sec.area : 0;
      const mTargetYield = sec.area > 0 ? mTarget / sec.area : 0;
      const mPct = mTarget > 0 ? (mTan / mTarget) * 100 : 0;
      report += `B.I\nT-\t${mTarget.toFixed(2)}\tM/t @\t${mTargetYield.toFixed(2)}\tT/Ha\t\t\nC-\t${mTan.toFixed(2)}\tM/t @\t${mYield.toFixed(2)}\tT/Ha (\t${mPct.toFixed(2)}%\t)\n\n`;

      // H.B.I
      const y = analytics.year;
      const yTan = sec.pkt === "001" ? y.pkt1_tan || 0 : y.pkt2_tan || 0;
      const yTarget =
        sec.pkt === "001" ? y.pkt1_target || 0 : y.pkt2_target || 0;
      const yYield = sec.area > 0 ? yTan / sec.area : 0;
      const yTargetYield = sec.area > 0 ? yTarget / sec.area : 0;
      const yPct = yTarget > 0 ? (yTan / yTarget) * 100 : 0;
      const ttnTan = sec.ttnYield * sec.area;
      report += `H.B.I ${currentYearNum}\nT :\t${yTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${yTargetYield.toFixed(2)}\tT/Ha\t\t\nC-\t${yTan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${yYield.toFixed(2)}\tT/Ha (\t${yPct.toFixed(2)}%\t)\nTTn-\t${ttnTan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${sec.ttnYield.toFixed(1)}\tT/Ha \t\t\n\n`;

      // H.B.I prev
      const yEmpty = analytics.year;
      const y25Tan =
        sec.pkt === "001" ? yEmpty.pkt1_ytd2025 || 0 : yEmpty.pkt2_ytd2025 || 0;
      const y25Yield = sec.area > 0 ? y25Tan / sec.area : 0;
      const y25Target = yTarget * 0.98;
      const y25TargetYield = sec.area > 0 ? y25Target / sec.area : 0;
      const ttn25Yield = sec.ttn2025Yield;
      const ttn25Tan = ttn25Yield * sec.area;
      report += `H.B.I ${prevYearNum}\nT-\t${y25Target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${y25TargetYield.toFixed(2)}\tT/Ha\t\t\nC-\t${y25Tan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${y25Yield.toFixed(2)}\tT/Ha\t\t\nTTn-\t${ttn25Tan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${ttn25Yield.toFixed(2)}\tT/Ha\n..................................................................\n`;
    });

    const dAll = analytics.day;
    const mAll = analytics.month;
    const yAll = analytics.year;

    const dOTan = (dAll.pkt1_tan || 0) + (dAll.pkt2_tan || 0);
    const dOTarget = (dAll.pkt1_target || 0) + (dAll.pkt2_target || 0);
    const dOYield = totalLuas > 0 ? dOTan / totalLuas : 0;
    const dOTargetYield = totalLuas > 0 ? dOTarget / totalLuas : 0;
    const dOPct = dOTarget > 0 ? (dOTan / dOTarget) * 100 : 0;

    const mOTan = (mAll.pkt1_tan || 0) + (mAll.pkt2_tan || 0);
    const mOTarget = (mAll.pkt1_target || 0) + (mAll.pkt2_target || 0);
    const mOYield = totalLuas > 0 ? mOTan / totalLuas : 0;
    const mOTargetYield = totalLuas > 0 ? mOTarget / totalLuas : 0;
    const mOPct = mOTarget > 0 ? (mOTan / mOTarget) * 100 : 0;

    const yOTan = (yAll.pkt1_tan || 0) + (yAll.pkt2_tan || 0);
    const yOTarget = (yAll.pkt1_target || 0) + (yAll.pkt2_target || 0);
    const yOYield = totalLuas > 0 ? yOTan / totalLuas : 0;
    const yOTargetYield = totalLuas > 0 ? yOTarget / totalLuas : 0;
    const yOPct = yOTarget > 0 ? (yOTan / yOTarget) * 100 : 0;
    const ttnOTan = TARGET_ANNUAL_PKT1 * luasPkt1 + TARGET_ANNUAL_PKT2 * luasPkt2;
    const ttnOYield = totalLuas > 0 ? ttnOTan / totalLuas : 28.0;

    report += `Hasil Keseluruhan FPMSB Tunggal\nLuas: (${totalLuas.toFixed(2)} Hek)\n\n`;
    report += `H.I\nT-\t${dOTarget.toFixed(2)}\tM/t @\t${dOTargetYield.toFixed(2)}\tT/Ha\t\t\nC-\t${dOTan.toFixed(2)}\tM/t @\t${dOYield.toFixed(3)}\tT/Ha (\t${dOPct.toFixed(2)}%\t)\n\n`;
    report += `B.I\nT-\t${mOTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${mOTargetYield.toFixed(2)}\tT/Ha\t\t\nC-\t${mOTan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${mOYield.toFixed(2)}\tT/Ha (\t${mOPct.toFixed(2)}%\t)\n\n`;
    report += `H.B.I ${currentYearNum}\nT-\t${yOTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${yOTargetYield.toFixed(2)}\tT/Ha\t\t\nC-\t${yOTan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${yOYield.toFixed(2)}\tT/Ha (\t${yOPct.toFixed(2)}%\t)\nTTn-\t${ttnOTan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${ttnOYield.toFixed(1)}\tT/Ha \t\t\n\n`;

    const y25OTan = (yAll.pkt1_ytd2025 || 0) + (yAll.pkt2_ytd2025 || 0);
    const y25OYield = totalLuas > 0 ? y25OTan / totalLuas : 0;
    const y25OTarget = yOTarget * 0.98;
    const y25OTargetYield = totalLuas > 0 ? y25OTarget / totalLuas : 0;
    const ttn25OTan = 27.0 * luasPkt1 + 26.0 * luasPkt2;
    const ttn25OYield = totalLuas > 0 ? ttn25OTan / totalLuas : 26.5;

    report += `H.B.I 2025\nT-\t${y25OTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${y25OTargetYield.toFixed(2)}\tT/Ha\t\t\nC-\t${y25OTan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${y25OYield.toFixed(2)}\tT/Ha\nTTn-\t${ttn25OTan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\tM/t @\t${ttn25OYield.toFixed(2)}\tT/Ha`;

    return report;
  };

  const handleCopyReport = () => {
    const report = generateRCReport();
    navigator.clipboard.writeText(report);
    if (typeof window !== "undefined" && "vibrate" in navigator)
      navigator.vibrate(50);
    showToast("success", "Laporan disalin ke papan klip.");
  };

  const tableToCaptureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureTableScreenshot = async () => {
    const node = document.getElementById("hasil-bulanan-report");
    if (!node) {
      showToast("error", "Laporan tidak dijumpai.");
      return;
    }

    try {
      setIsCapturing(true);
      showToast("success", "Sedang menjana imej HD penuh... Sila tunggu.");

      // Delay to ensure all fonts and styles are loaded
      await new Promise((r) => setTimeout(r, 1000));

      const { toPng } = await import("html-to-image");

      const elementsToHide = node.querySelectorAll<HTMLElement>(
        "button, .no-screenshot, .dashboard-controls",
      );
      const originalDisplays = new Map<HTMLElement, string>();

      elementsToHide.forEach((el) => {
        originalDisplays.set(el, el.style.display);
        el.style.setProperty("display", "none", "important");
      });

      let dataUrl = "";
      try {
        // Find the scrollable table container if it exists
        const tableContainer = node.querySelector(
          ".overflow-x-auto, .overflow-auto",
        ) as HTMLElement;
        const originalOverflow = tableContainer
          ? tableContainer.style.overflow
          : "";
        const originalWidth = tableContainer ? tableContainer.style.width : "";
        const originalMaxWidth = tableContainer
          ? tableContainer.style.maxWidth
          : "";
        const originalPosition = node.style.position;
        const originalWidthNode = node.style.width;

        const parentWithTransform = node.parentElement;
        let originalTransform = "";
        if (parentWithTransform && parentWithTransform.style.transform) {
          originalTransform = parentWithTransform.style.transform;
          parentWithTransform.style.transform = "none";
        }

        if (tableContainer) {
          tableContainer.style.setProperty("overflow", "visible", "important");
          tableContainer.style.setProperty("width", "auto", "important");
          tableContainer.style.setProperty("max-width", "none", "important");
        }

        // Set the report node to fit its content
        node.style.setProperty("width", "max-content", "important");
        node.style.setProperty("position", "relative", "important");

        dataUrl = await toPng(node, {
          backgroundColor: isDarkMode ? "#0F172A" : "#FFFFFF",
          quality: 1.0,
          pixelRatio: 4, // Increase for higher resolution
          width: node.scrollWidth,
          height: node.scrollHeight,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            margin: "0",
            width: `${node.scrollWidth}px`, // Force width consistency
          },
        });

        if (tableContainer) {
          tableContainer.style.overflow = originalOverflow;
          tableContainer.style.width = originalWidth;
          tableContainer.style.maxWidth = originalMaxWidth;
        }
        node.style.position = originalPosition;
        node.style.width = originalWidthNode;
        if (parentWithTransform && originalTransform) {
          parentWithTransform.style.transform = originalTransform;
        }
      } finally {
        elementsToHide.forEach((el) => {
          const origDisplay = originalDisplays.get(el);
          if (origDisplay !== undefined) {
            el.style.display = origDisplay;
          } else {
            el.style.removeProperty("display");
          }
        });
      }

      if (!dataUrl || dataUrl.length < 100 || dataUrl === "data:,")
        throw new Error("Data imej tidak sah");

      const fileName = `REPORT_FPMSB_${new Date().toISOString().split("T")[0]}.png`;

      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: "image/png" });

        setSharePreviewData({
          file,
          url: dataUrl,
          name: fileName,
        });
        showToast("success", "Imej sedia untuk dikongsi!");
      } catch (error) {
        console.error("Error preparing image for share:", error);
        showToast("error", "Gagal menyediakan imej.");
      }
    } catch (error) {
      console.error("Screenshot error:", error);
      showToast(
        "error",
        'Gagal menjana imej HD. Sila gunakan "Cetak PDF" sebagai alternatif.',
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownloadPdf = async () => {
    const node = document.getElementById("hasil-bulanan-report");
    if (!node) {
      showToast("error", "Laporan tidak dijumpai.");
      return;
    }

    try {
      setIsDownloadingPdf(true);
      showToast("success", "Sedang menjana dokumen PDF... Sila tunggu.");

      // Delay to ensure all fonts and styles are loaded
      await new Promise((r) => setTimeout(r, 1000));

      const { jsPDF } = await import("jspdf");
      const { toPng } = await import("html-to-image");

      const elementsToHide = node.querySelectorAll<HTMLElement>(
        "button, .no-screenshot, .dashboard-controls",
      );
      const originalDisplays = new Map<HTMLElement, string>();

      elementsToHide.forEach((el) => {
        originalDisplays.set(el, el.style.display);
        el.style.setProperty("display", "none", "important");
      });

      try {
        const tableContainer = node.querySelector(
          ".overflow-x-auto, .overflow-auto",
        ) as HTMLElement;
        const originalOverflow = tableContainer
          ? tableContainer.style.overflow
          : "";
        const originalWidth = tableContainer ? tableContainer.style.width : "";
        const originalMaxWidth = tableContainer
          ? tableContainer.style.maxWidth
          : "";
        const originalPosition = node.style.position;
        const originalWidthNode = node.style.width;

        if (tableContainer) {
          tableContainer.style.setProperty("overflow", "visible", "important");
          tableContainer.style.setProperty("width", "auto", "important");
          tableContainer.style.setProperty("max-width", "none", "important");
        }

        node.style.setProperty("width", "max-content", "important");
        node.style.setProperty("position", "relative", "important");

        const width = node.scrollWidth;
        const height = node.scrollHeight;

        const dataUrl = await toPng(node, {
          backgroundColor: "#FFFFFF", // Use white background for PDF
          quality: 1.0,
          pixelRatio: 2,
          width: width,
          height: height,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            margin: "0",
            padding: "24px",
          },
        });

        // Calculate PDF dimensions (adding padding)
        const pdfWidth = width + 48;
        const pdfHeight = height + 48;

        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? "l" : "p",
          unit: "px",
          format: [pdfWidth, pdfHeight],
        });

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(
          `Laporan_Hasil_Bulanan_${new Date().toISOString().split("T")[0]}.pdf`,
        );

        if (tableContainer) {
          tableContainer.style.overflow = originalOverflow;
          tableContainer.style.width = originalWidth;
          tableContainer.style.maxWidth = originalMaxWidth;
        }
        node.style.position = originalPosition;
        node.style.width = originalWidthNode;

        showToast("success", "PDF berjaya dimuat turun!");
      } finally {
        elementsToHide.forEach((el) => {
          const origDisplay = originalDisplays.get(el);
          if (origDisplay !== undefined) {
            el.style.display = origDisplay;
          } else {
            el.style.removeProperty("display");
          }
        });
      }
    } catch (error) {
      console.error("PDF Export error:", error);
      showToast("error", "Gagal menjana dokumen PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    setShowReportDatePicker(!showReportDatePicker);
  };

  const executeWhatsAppShare = () => {
    const report = encodeURIComponent(generateRCReport());
    window.open(`https://wa.me/?text=${report}`, "_blank");
    setShowReportDatePicker(false);
  };

  const handleAddHujan = (bulan: string, tahun: string, jumlah: number) => {
    setHujanData(prev => {
      let newData = prev.map(item => {
        if (item.bulan.toUpperCase() === bulan.toUpperCase()) {
          return { ...item, [tahun]: jumlah };
        }
        return item;
      });

      // Update JUMLAH
      const yearsList = ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'];
      newData = newData.map(item => {
        if (item.bulan === 'JUMLAH') {
          const newJumlahRow = { ...item };
          yearsList.forEach(y => {
            let yTotal = 0;
            let hasDataForYear = false;
            newData.forEach(dataItem => {
              if (dataItem.bulan !== 'JUMLAH' && dataItem[y] != null) {
                yTotal += dataItem[y];
                hasDataForYear = true;
              }
            });
            newJumlahRow[y] = hasDataForYear ? yTotal : null;
          });
          return newJumlahRow;
        }
        return item;
      });

      return newData;
    });
  };

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.no_resit || !formData.no_lori || !formData.blok) {
      showToast("error", "Sila lengkapkan semua maklumat wajib.");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await safeFetch("/api/hantaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (result.success) {
        showToast("success", `Berjaya: Resit ${result.ref}`);
        setFormData({
          no_resit: "",
          no_akaun_terima: "",
          no_lori: "",
          no_seal: "",
          no_nota_hantaran: "",
          kpg: "",
          blok: "",
          tan: "",
          muda: "",
          reject: "0.00",
          sample: "0",
          rm_mt: "",
          tarikh: "",
          masa_masuk: "",
          is_efb: false,
        });
        fetchData(true);
      } else {
        // Handle specific status codes or error messages
        const errorMsg = result.error || "Ralat tidak dijangka berlaku.";
        showToast("error", errorMsg);
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      showToast(
        "error",
        "Gagal menghubungi pelayan. Sila periksa sambungan internet.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToPPTX = async () => {
    let filteredData = rawData;

    if (exportFilter === "date") {
      filteredData = rawData.filter((item) => {
        if (item.tarikh === exportDate) return true;
        if (item.created_at) {
          const createdDate = new Date(
            new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0];
          return createdDate === exportDate;
        }
        return false;
      });
    } else if (exportFilter === "month") {
      filteredData = rawData.filter((item) => {
        if (item.tarikh && item.tarikh.startsWith(exportMonth)) return true;
        if (item.created_at) {
          const createdDate = new Date(
            new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
          )
            .toISOString()
            .slice(0, 7);
          return createdDate.startsWith(exportMonth);
        }
        return false;
      });
    }

    if ((filteredData?.length || 0) === 0) {
      showToast("error", "Tiada data untuk dieksport pada tarikh/bulan ini.");
      return;
    }

    const periodLabel =
      exportFilter === "all"
        ? "Semua Rekod"
        : exportFilter === "month"
          ? exportMonth
          : exportDate;
    const summaryData = analytics?.month || {
      pkt1_tan: 0,
      pkt2_tan: 0,
      felda_tan: 0,
      totalTan: 0,
      pkt1_muda: 0,
      pkt2_muda: 0,
      felda_muda: 0,
      totalMuda: 0,
      pkt1_kpg_match: 0,
      pkt2_kpg_match: 0,
      felda_kpg_match: 0,
      kpgMatchCount: 0,
    };

    const allPossibleCols = [
      { id: "blok", label: "Blok" },
      { id: "peringkat", label: "Peringkat" },
      { id: "tan", label: "CAPAI (Tan)" },
      { id: "thek", label: "Yield (T/H)" },
      { id: "muda", label: "Muda" },
    ];

    const activeCols = allPossibleCols.filter((c) =>
      exportColumns.includes(c.id),
    );
    if (activeCols.length === 0) activeCols.push(allPossibleCols[0]);

    const topBlocks = (analytics?.month?.rankedBlok || []).slice(0, 10);
    const tableRows = topBlocks.map((b) => {
      const row: any[] = [];
      activeCols.forEach((c) => {
        if (c.id === "blok") row.push(b.blok);
        else if (c.id === "peringkat")
          row.push(
            b.pkt === "001" ? "PKT 1" : b.pkt === "002" ? "PKT 2" : "FELDA",
          );
        else if (c.id === "tan") row.push(b.tan.toFixed(1));
        else if (c.id === "thek") row.push(b.yieldHek.toFixed(2));
        else if (c.id === "muda") row.push(b.muda.toString());
      });
      return row;
    });

    const exportPayload = {
      reportTitle: `Laporan Analitik: ${reportType.toUpperCase()}`,
      generatedAt: new Date().toLocaleString(),
      filters: {
        type: reportType,
        period: periodLabel,
        columns: exportColumns,
      },
      summaryCards: [
        {
          label: "Total Tan",
          value: (summaryData.totalTan || 0).toFixed(1),
          subValue: "Keseluruhan",
        },
        {
          label: "Muda (Tandan)",
          value: (summaryData.totalMuda || 0).toString(),
          subValue: "Keseluruhan",
        },
        {
          label: "KPG=KPA (Resit)",
          value: (summaryData.kpgMatchCount || 0).toString(),
          subValue: "Keseluruhan",
        },
      ],
      charts: [
        {
          title: `Trend CAPAI Bulanan (${new Date().getFullYear()})`,
          type: "bar",
          data: (analytics?.monthlyTrend || []).map((d) => ({
            name: d.month,
            values: [d.yield],
          })),
          options: { showValue: true, valAxisTitle: "T/H" },
        },
        {
          title: "Pecahan CAPAI Mengikut Peringkat",
          type: "pie",
          data: [
            { name: "PKT 1", values: [summaryData.pkt1_tan || 0] },
            { name: "PKT 2", values: [summaryData.pkt2_tan || 0] },
            { name: "FELDA", values: [summaryData.felda_tan || 0] },
          ],
          options: { showPercent: true, legendPos: "r" },
        },
      ],
      tables: [
        {
          title: "Prestasi Mengikut Blok (Top 10)",
          headers: activeCols.map((c) => c.label),
          rows: tableRows,
        },
      ],
      branding: {
        companyName: "FPMSB TUNGGAL",
        logoText: "Integrated Plantation Data System",
        primaryColor: "#064E3B",
      },
    };

    try {
      setIsExporting(true);
      console.log("Starting PPTX export fetch...");
      const response = await fetch("/api/export/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menjana PowerPoint: ${errorText}`);
      }

      const blob = await response.blob();
      console.log("PPTX blob received, size:", blob.size);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `FPMSB_Laporan_${periodLabel.replace(/-/g, "_")}.pptx`,
      );
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);

      showToast("success", "PowerPoint berjaya dimuat turun.");
    } catch (error) {
      console.error("PPTX Export Error:", error);
      showToast(
        "error",
        `Gagal memuat turun PowerPoint: ${error instanceof Error ? error.message : "Sila cuba lagi"}`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      let filteredData = rawData;

      if (exportFilter === "date") {
        filteredData = rawData.filter((item) => {
          if (item.tarikh === exportDate) return true;
          if (item.created_at) {
            const createdDate = new Date(
              new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
            )
              .toISOString()
              .split("T")[0];
            return createdDate === exportDate;
          }
          return false;
        });
      } else if (exportFilter === "month") {
        filteredData = rawData.filter((item) => {
          if (item.tarikh && item.tarikh.startsWith(exportMonth)) return true;
          if (item.created_at) {
            const createdDate = new Date(
              new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
            )
              .toISOString()
              .split("T")[0];
            return createdDate.startsWith(exportMonth);
          }
          return false;
        });
      }

      if ((filteredData?.length || 0) === 0) {
        showToast("error", "Tiada data untuk dieksport pada tarikh/bulan ini.");
        return;
      }

      // Sort data by date ascending (Earliest at top, Latest at bottom)
      const sortedData = [...filteredData].sort((a, b) => {
        // Primary sort by tarikh string (YYYY-MM-DD)
        const dateA = a.tarikh || "";
        const dateB = b.tarikh || "";
        if (dateA !== dateB) return dateA.localeCompare(dateB);

        // Secondary sort by created_at if tarikh is the same
        const createdA = a.created_at || "";
        const createdB = b.created_at || "";
        return createdA.localeCompare(createdB);
      });

      const workbook = new ExcelJS.Workbook();

      // Helper function to create a standard sheet
      const createStandardSheet = (
        ws: ExcelJS.Worksheet,
        data: Transaction[],
        sheetTitle: string,
        isMaster: boolean = false,
      ) => {
        // Add Title Row
        ws.mergeCells("A1:M1");
        const titleCell = ws.getCell("A1");
        titleCell.value = "FPMSB TUNGGAL";
        titleCell.font = {
          name: "Arial Black",
          size: 20,
          color: { argb: "FFFFFFFF" },
          bold: true,
        };
        titleCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF064E3B" }, // Emerald 900
        };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        ws.getRow(1).height = 50;

        // Add Subtitle Row
        ws.mergeCells("A2:M2");
        const subtitleCell = ws.getCell("A2");
        subtitleCell.value = "SISTEM MAKLUMAT LADANG BERSEPADU";
        subtitleCell.font = {
          name: "Arial",
          size: 14,
          bold: true,
          color: { argb: "FF065F46" },
        };
        subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
        ws.getRow(2).height = 30;

        // Add Report Type Row
        ws.mergeCells("A3:M3");
        const reportCell = ws.getCell("A3");
        reportCell.value = sheetTitle;
        reportCell.font = {
          name: "Arial",
          size: 12,
          bold: true,
          color: { argb: "FF065F46" },
        };
        reportCell.alignment = { horizontal: "center", vertical: "middle" };
        ws.getRow(3).height = 25;

        // Add Metadata Row (Date/Month)
        const metaText =
          exportFilter === "date"
            ? `Tarikh: ${exportDate}`
            : exportFilter === "month"
              ? `Bulan: ${exportMonth}`
              : "Semua Rekod";
        ws.mergeCells("A4:M4");
        const metaCell = ws.getCell("A4");
        metaCell.value = `Ladang: FPMSB TUNGGAL | ${metaText}`;
        metaCell.font = {
          name: "Arial",
          size: 11,
          bold: true,
          italic: true,
          color: { argb: "FF374151" },
        };
        metaCell.alignment = { horizontal: "right", vertical: "middle" };
        ws.getRow(4).height = 20;

        ws.addRow([]); // Spacer (Row 5)

        // Define Columns
        const allPossibleColumns = [
          { header: "TARIKH", key: "tarikh", width: 15 },
          { header: "NO. RESIT", key: "no_resit", width: 15 },
          { header: "NO. LORI", key: "no_lori", width: 12 },
          { header: "NO. SEAL", key: "no_seal", width: 12 },
          { header: "NO. NOTA HANTARAN", key: "no_nota", width: 20 },
          { header: "KPG", key: "kpg", width: 10 },
          { header: "BLOK", key: "blok", width: 10 },
          { header: "PERINGKAT", key: "peringkat", width: 12 },
          { header: "BERAT (TAN)", key: "tan", width: 15 },
          { header: "BTS MUDA", key: "muda", width: 12 },
          { header: "TAN/HEK (T/H)", key: "thek", width: 15 },
          { header: "MASA MASUK", key: "masa", width: 15 },
          { header: "DICIPTA PADA", key: "created", width: 25 },
        ];

        const activeCols = allPossibleColumns.filter(
          (c) => exportColumns.includes(c.key) || c.key === "tarikh",
        );
        ws.columns = activeCols.map((col) => ({
          header: col.header,
          key: col.key,
          width: col.width,
        }));

        // Add Header Row Values Explicitly at Row 6
        const headerRow = ws.getRow(6);
        headerRow.values = activeCols.map((c) => c.header);
        headerRow.height = 35;

        headerRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF10B981" }, // Emerald 500
          };
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin", color: { argb: "FFFFFFFF" } },
            left: { style: "thin", color: { argb: "FFFFFFFF" } },
            bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
            right: { style: "thin", color: { argb: "FFFFFFFF" } },
          };
        });

        // Add Data Rows
        data.forEach((item) => {
          const rowData: any = {};
          activeCols.forEach((col) => {
            if (col.key === "tarikh")
              rowData.tarikh = item.tarikh.split("-").reverse().join(".");
            else if (col.key === "no_resit") rowData.no_resit = item.no_resit;
            else if (col.key === "no_lori") rowData.no_lori = item.no_lori;
            else if (col.key === "no_seal")
              rowData.no_seal = item.no_seal || "-";
            else if (col.key === "no_nota")
              rowData.no_nota = item.no_nota_hantaran || "-";
            else if (col.key === "kpg") rowData.kpg = item.kpg || "-";
            else if (col.key === "blok") rowData.blok = item.blok;
            else if (col.key === "peringkat")
              rowData.peringkat = item.peringkat || "-";
            else if (col.key === "tan") rowData.tan = item.tan;
            else if (col.key === "muda") rowData.muda = item.muda;
            else if (col.key === "thek") rowData.thek = item.thek || 0;
            else if (col.key === "masa") rowData.masa = item.masa_masuk || "-";
            else if (col.key === "created")
              rowData.created = item.created_at
                ? new Date(item.created_at).toLocaleString()
                : "-";
          });
          const row = ws.addRow(rowData);
          row.eachCell((cell) => {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin", color: { argb: "FFD1D5DB" } },
              left: { style: "thin", color: { argb: "FFD1D5DB" } },
              bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
              right: { style: "thin", color: { argb: "FFD1D5DB" } },
            };
            cell.font = { size: 10 };
          });
        });

        // Add Summary Row
        const summaryRow = ws.addRow({});
        const tanColIndex = activeCols.findIndex((c) => c.key === "tan") + 1;
        const mudaColIndex = activeCols.findIndex((c) => c.key === "muda") + 1;
        const thekColIndex = activeCols.findIndex((c) => c.key === "thek") + 1;

        if (tanColIndex > 0) {
          summaryRow.getCell(tanColIndex).value = data.reduce(
            (sum, item) => sum + item.tan,
            0,
          );
          summaryRow.getCell(tanColIndex).numFmt = "#,##0.00";
        }
        if (mudaColIndex > 0) {
          summaryRow.getCell(mudaColIndex).value = data.reduce(
            (sum, item) => sum + item.muda,
            0,
          );
        }
        if (thekColIndex > 0) {
          const totalTan = data.reduce((sum, item) => sum + item.tan, 0);
          const totalLuas = data.reduce((sum, item) => {
            const b = MASTER_DATA[item.blok];
            return sum + (b ? b.luas : 0);
          }, 0);
          summaryRow.getCell(thekColIndex).value =
            totalLuas > 0 ? totalTan / totalLuas : 0;
          summaryRow.getCell(thekColIndex).numFmt = "#,##0.00";
        }

        // Style and fill all cells in the summary row to ensure a complete horizontal line
        for (let i = 1; i <= activeCols.length; i++) {
          const cell = summaryRow.getCell(i);
          cell.font = { bold: true, size: 11 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFDE68A" },
          }; // Amber 200
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "medium", color: { argb: "FF92400E" } },
            left: { style: "thin", color: { argb: "FF92400E" } },
            bottom: { style: "medium", color: { argb: "FF92400E" } },
            right: { style: "thin", color: { argb: "FF92400E" } },
          };

          // Add a "JUMLAH" label in the first available empty cell or first column
          if (i === 1) {
            cell.value = "JUMLAH";
            cell.alignment = { horizontal: "left", vertical: "middle" };
          }
        }
      };

      const createEfcSheet = (ws: ExcelJS.Worksheet, data: Transaction[]) => {
        // Setup Page Layout
        ws.pageSetup.orientation = "landscape";
        ws.pageSetup.fitToPage = true;
        ws.pageSetup.fitToWidth = 1;

        // 1. TOP METADATA SECTION (Now starts at Row 1)
        ws.getCell("A1").value = "TARIKH MULA";
        ws.getCell("A2").value = "TARIKH TAMAT";
        ws.getCell("A3").value = "BULAN";

        [1, 2, 3].forEach((r) => {
          ws.getCell(`B${r}`).value = ":";
          ws.getCell(`A${r}`).font = { size: 9, bold: true };
          ws.getCell(`B${r}`).font = { size: 9, bold: true };
        });

        // Values
        ws.getCell("C1").value =
          exportFilter === "date"
            ? exportDate.split("-").reverse().join(".")
            : "01.01.2026";
        ws.getCell("C2").value =
          exportFilter === "date"
            ? exportDate.split("-").reverse().join(".")
            : "31.12.2026";
        ws.getCell("C3").value =
          exportFilter === "month"
            ? [
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
              ][parseInt(exportMonth.split("-")[1]) - 1]
            : "APRIL";

        // 3. TABLE HEADERS (Row 4-5)
        const headers = [
          { col: "A", title: "TARIKH", rowSpan: true },
          { col: "B", title: "No. Kenderaan", rowSpan: true },
          { col: "C", title: "Trip No:", rowSpan: true },
          { col: "D", title: "No. Nota Hantaran", rowSpan: true },
          { col: "E", title: "No. Resit", rowSpan: true },
          { col: "F", title: "Bil. Tandan", rowSpan: true },
          { col: "G", title: "Tan", rowSpan: true },
          { col: "H", title: "OER (%)", rowSpan: true },
          { col: "I", title: "KPG (%)", rowSpan: true },
        ];

        headers.forEach((h) => {
          const cell = ws.getCell(`${h.col}4`);
          cell.value = h.title;
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF10B981" },
          }; // Emerald 500
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 9 };
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
          if (h.rowSpan) ws.mergeCells(`${h.col}4:${h.col}5`);
        });

        // 4. DATA ROWS (Starting Row 6)
        let currentRow = 6;
        data.forEach((item) => {
          const row = ws.getRow(currentRow);
          row.values = [
            item.tarikh.split("-").reverse().join("/"),
            item.no_lori,
            "1", // Trip No
            item.no_nota_hantaran || "",
            item.no_resit,
            item.muda || "",
            item.tan,
            "21.25%", // OER Placeholder
            item.kpg || "",
          ];

          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.font = { size: 9 };
          });
          currentRow++;
        });

        // Fill empty rows to match the visual (up to 30 rows)
        const targetRows = Math.max(currentRow, 30);
        for (let i = currentRow; i <= targetRows; i++) {
          const row = ws.getRow(i);
          for (let j = 1; j <= 9; j++) {
            row.getCell(j).border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        }

        // 5. FOOTER (JUMLAH TAN)
        const footerRow = targetRows + 1;
        ws.mergeCells(`A${footerRow}:F${footerRow}`);
        const jumlahLabel = ws.getCell(`A${footerRow}`);
        jumlahLabel.value = "JUMLAH TAN";
        jumlahLabel.font = { bold: true };
        jumlahLabel.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF10B981" },
        }; // Emerald 500
        jumlahLabel.font = { color: { argb: "FFFFFFFF" }, bold: true };
        jumlahLabel.alignment = { horizontal: "right" };

        const totalTan = data.reduce((sum, item) => sum + (item.tan || 0), 0);
        ws.getCell(`G${footerRow}`).value = totalTan;
        ws.getCell(`G${footerRow}`).font = { bold: true };
        ws.getCell(`G${footerRow}`).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        ws.getCell(`G${footerRow}`).alignment = { horizontal: "center" };

        // Column Widths
        ws.getColumn("A").width = 12;
        ws.getColumn("B").width = 15;
        ws.getColumn("C").width = 8;
        ws.getColumn("D").width = 18;
        ws.getColumn("E").width = 15;
        ws.getColumn("F").width = 10;
        ws.getColumn("G").width = 10;
        ws.getColumn("H").width = 10;
        ws.getColumn("I").width = 10;
      };

      if (reportType === "efc_format") {
        // 1. Master Data Sheet
        const masterSheet = workbook.addWorksheet("Master Data");
        createEfcSheet(masterSheet, sortedData);

        // 2. Individual Block Sheets
        const uniqueBlocks = Array.from(
          new Set(sortedData.map((d) => d.blok)),
        ).sort((a, b) => {
          const strA = String(a);
          const strB = String(b);
          const numA = parseInt(strA);
          const numB = parseInt(strB);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return strA.localeCompare(strB);
        });

        uniqueBlocks.forEach((blok) => {
          const blokData = sortedData.filter((d) => d.blok === blok);
          if (blokData.length > 0) {
            const blokSheet = workbook.addWorksheet(`Blok ${blok}`);
            createEfcSheet(blokSheet, blokData);
          }
        });
      } else if (reportType === "kpa_kpg") {
        const worksheet = workbook.addWorksheet("Rekod Hantaran");
        // --- SPECIAL KPG=KPA REPORT FORMAT ---
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
        const currentMonth =
          exportFilter === "month"
            ? monthNames[parseInt(exportMonth.split("-")[1]) - 1]
            : monthNames[new Date().getMonth()];
        const currentYear =
          exportFilter === "month"
            ? exportMonth.split("-")[0]
            : new Date().getFullYear();

        // Filter data for KPG >= 21
        const kpgData = sortedData.filter(
          (item) => parseFloat(item.kpg || "0") >= 21,
        );

        // Split into Standard and Felda
        const standardData = kpgData.filter((item) => {
          const pkt = MASTER_DATA[item.blok]?.pkt || "001";
          return pkt !== "003";
        });
        const feldaData = kpgData.filter((item) => {
          const pkt = MASTER_DATA[item.blok]?.pkt || "001";
          return pkt === "003";
        });

        const renderKpgTable = (
          data: Transaction[],
          title: string,
          startRow: number,
        ) => {
          if (!data || !Array.isArray(data)) return startRow;
          // Title
          worksheet.mergeCells(`A${startRow}:L${startRow}`);
          const t1 = worksheet.getCell(`A${startRow}`);
          t1.value = "KPA = KPG";
          t1.font = { bold: true, size: 12 };
          t1.alignment = { horizontal: "center" };

          worksheet.mergeCells(`A${startRow + 1}:L${startRow + 1}`);
          const t2 = worksheet.getCell(`A${startRow + 1}`);
          t2.value = `${title} ${currentMonth} ${currentYear}`;
          t2.font = { bold: true, size: 12 };
          t2.alignment = { horizontal: "center" };

          // Headers
          const headerRowIndex = startRow + 3;
          const headers = [
            "Bil",
            "Tarikh",
            "Blok",
            "No. Akaun Terima",
            "Nota Hantaran",
            "Berat Bersih (Tan)",
            "RM / MT",
            "CAPAI (RM)",
            "Tandan Muda",
            "Reject",
            "Sample",
            "KPG",
          ];
          const headerRow = worksheet.getRow(headerRowIndex);
          headerRow.values = headers;
          headerRow.height = 30;

          headerRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF10B981" },
            }; // Emerald 500
            cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
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

          // Data
          let currentRow = headerRowIndex + 1;
          data.forEach((item, idx) => {
            const row = worksheet.getRow(currentRow);
            row.values = [
              idx + 1,
              item.tarikh.split("-").reverse().join("."),
              item.blok,
              item.no_akaun_terima || "-",
              item.no_resit,
              item.tan,
              item.rm_mt || 0,
              item.hasil_rm || item.tan * (item.rm_mt || 0),
              item.muda,
              item.reject || 0,
              item.sample || 0,
              item.kpg || "-",
            ];
            row.eachCell((cell) => {
              cell.alignment = { horizontal: "center", vertical: "middle" };
              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
              cell.font = { size: 9 };
            });
            row.getCell(6).numFmt = "#,##0.00";
            row.getCell(7).numFmt = "#,##0.00";
            row.getCell(8).numFmt = "#,##0.00";
            currentRow++;
          });

          // Totals
          const totalRow = worksheet.getRow(currentRow);
          const totalTan = data.reduce((sum, item) => sum + item.tan, 0);
          const totalHasil = data.reduce(
            (sum, item) =>
              sum + (item.hasil_rm || item.tan * (item.rm_mt || 0)),
            0,
          );
          const totalMuda = data.reduce((sum, item) => sum + item.muda, 0);
          const totalReject = data.reduce(
            (sum, item) => sum + (item.reject || 0),
            0,
          );
          const avgRmMt =
            data.length > 0
              ? data.reduce((sum, item) => sum + (item.rm_mt || 0), 0) /
                data.length
              : 0;
          const avgKpg =
            data.length > 0
              ? data.reduce(
                  (sum, item) => sum + parseFloat(item.kpg || "0"),
                  0,
                ) / data.length
              : 0;

          totalRow.getCell(1).value = "JUMLAH";
          worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
          totalRow.getCell(6).value = totalTan;
          totalRow.getCell(7).value = avgRmMt;
          totalRow.getCell(8).value = totalHasil;
          totalRow.getCell(9).value = totalMuda;
          totalRow.getCell(10).value = totalReject;
          totalRow.getCell(12).value = avgKpg;

          totalRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFDE68A" },
            }; // Amber 200 (Consistent with other reports)
            cell.font = { bold: true, size: 10, color: { argb: "FF064E3B" } }; // Emerald 900 text
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
          totalRow.getCell(6).numFmt = "#,##0.00";
          totalRow.getCell(7).numFmt = "#,##0.00";
          totalRow.getCell(8).numFmt = "#,##0.00";
          totalRow.getCell(12).numFmt = "#,##0.00";

          return currentRow + 3; // Return next start row
        };

        let nextRow = 1;
        nextRow = renderKpgTable(standardData, "FPMSB TUNGGAL BULAN", nextRow);
        renderKpgTable(feldaData, "KPA-KPG LOT FELDA", nextRow);

        // --- ADD SUMMARY SHEET BY BLOK ---
        const summarySheet = workbook.addWorksheet("Ringkasan KPG=KPA", {
          views: [{ state: "frozen", ySplit: 3 }],
        });

        // Title
        summarySheet.mergeCells("A1:F1");
        const t1 = summarySheet.getCell("A1");
        t1.value = "RINGKASAN KPG=KPA MENGIKUT BLOK";
        t1.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
        t1.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF064E3B" },
        }; // Emerald 900
        t1.alignment = { horizontal: "center", vertical: "middle" };
        summarySheet.getRow(1).height = 40;

        // Headers
        const headerRow = summarySheet.getRow(3);
        headerRow.values = [
          "BIL",
          "BLOK",
          "PERINGKAT",
          "JUMLAH RESIT",
          "KPG MATCH (>=21)",
          "PERATUS (%)",
        ];
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF10B981" },
          }; // Emerald 500
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
        headerRow.height = 25;

        // Calculate data
        const blockSummary: {
          blok: string;
          pkt: string;
          totalResit: number;
          kpgMatch: number;
        }[] = [];
        const uniqueBlocks = (
          Array.from(new Set(sortedData.map((d) => d.blok))) as string[]
        ).sort((a, b) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });

        uniqueBlocks.forEach((blok: string) => {
          const blokData = sortedData.filter((d) => d.blok === blok);
          const kpgMatch = blokData.filter(
            (item) => parseFloat(item.kpg || "0") >= 21,
          ).length;
          const pkt = (MASTER_DATA as any)[blok]?.pkt || "-";
          blockSummary.push({
            blok,
            pkt,
            totalResit: blokData.length,
            kpgMatch,
          });
        });

        // Add rows
        blockSummary.forEach((item, idx) => {
          const percentage =
            item.totalResit > 0 ? (item.kpgMatch / item.totalResit) * 100 : 0;
          const row = summarySheet.addRow([
            idx + 1,
            `Blok ${item.blok}`,
            item.pkt === "001"
              ? "PKT 1"
              : item.pkt === "002"
                ? "PKT 2"
                : "FELDA",
            item.totalResit,
            item.kpgMatch,
            parseFloat(percentage.toFixed(1)),
          ]);
          row.eachCell((cell) => {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin", color: { argb: "FFD1D5DB" } },
              left: { style: "thin", color: { argb: "FFD1D5DB" } },
              bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
              right: { style: "thin", color: { argb: "FFD1D5DB" } },
            };
            cell.font = { size: 10 };
          });
          if (idx % 2 !== 0) {
            row.eachCell((cell) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF0FDF4" },
              };
            });
          }
        });

        // Summary row
        const totalRow = summarySheet.addRow([
          "",
          "JUMLAH KESELURUHAN",
          "",
          blockSummary.reduce((sum, item) => sum + item.totalResit, 0),
          blockSummary.reduce((sum, item) => sum + item.kpgMatch, 0),
          "",
        ]);
        const totalResits = blockSummary.reduce(
          (sum, item) => sum + item.totalResit,
          0,
        );
        const totalMatches = blockSummary.reduce(
          (sum, item) => sum + item.kpgMatch,
          0,
        );
        totalRow.getCell(6).value =
          totalResits > 0
            ? parseFloat(((totalMatches / totalResits) * 100).toFixed(1))
            : 0;

        summarySheet.mergeCells(`B${totalRow.number}:C${totalRow.number}`);
        totalRow.eachCell((cell) => {
          cell.font = { bold: true, size: 11 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD1FAE5" },
          }; // Emerald 100
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "medium", color: { argb: "FF064E3B" } },
            left: { style: "thin", color: { argb: "FF064E3B" } },
            bottom: { style: "medium", color: { argb: "FF064E3B" } },
            right: { style: "thin", color: { argb: "FF064E3B" } },
          };
        });
        totalRow.height = 30;

        summarySheet.getColumn(1).width = 8;
        summarySheet.getColumn(2).width = 15;
        summarySheet.getColumn(3).width = 20;
        summarySheet.getColumn(4).width = 15;
        summarySheet.getColumn(5).width = 20;
        summarySheet.getColumn(6).width = 15;

        // Set column widths for main sheet
        worksheet.getColumn(1).width = 5;
        worksheet.getColumn(2).width = 12;
        worksheet.getColumn(3).width = 8;
        worksheet.getColumn(4).width = 15;
        worksheet.getColumn(5).width = 15;
        worksheet.getColumn(6).width = 15;
        worksheet.getColumn(7).width = 12;
        worksheet.getColumn(8).width = 15;
        worksheet.getColumn(9).width = 12;
        worksheet.getColumn(10).width = 10;
        worksheet.getColumn(11).width = 10;
        worksheet.getColumn(12).width = 8;
      } else if (reportType === "efb") {
        const worksheet = workbook.addWorksheet("Rekod EFB");
        const efbData = sortedData.filter((item) => item.peringkat === "EFB");
        createStandardSheet(
          worksheet,
          efbData,
          "LAPORAN PENGHANTARAN EFB (TANDAN KOSONG)",
        );
      } else {
        // Standard report sheets
        const worksheet = workbook.addWorksheet("Rekod Hantaran");
        const displayTitle =
          reportType === "hasil"
            ? "LAPORAN ANALITIK: CAPAI (BERAT TAN)"
            : reportType === "muda"
              ? "LAPORAN ANALITIK: BTS MUDA (TANDAN MUDA)"
              : reportType === "efb"
                ? "LAPORAN ANALITIK: EFB (TANDAN KOSONG)"
                : `LAPORAN ANALITIK: ${reportType.toUpperCase()}`;

        createStandardSheet(worksheet, sortedData, displayTitle, true);

        // If it's 'hasil', also create individual block sheets
        if (reportType === "hasil") {
          const uniqueBlocks = Array.from(
            new Set(sortedData.map((d) => d.blok)),
          ).sort((a, b) => {
            const numA = parseInt(String(a));
            const numB = parseInt(String(b));
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return String(a).localeCompare(String(b));
          });

          uniqueBlocks.forEach((blok) => {
            const blokData = sortedData.filter((d) => d.blok === blok);
            if (blokData.length > 0) {
              const blokSheet = workbook.addWorksheet(`Blok ${blok}`);
              createStandardSheet(
                blokSheet,
                blokData,
                `REKOD HANTARAN BLOK ${blok}`,
              );
            }
          });
        }
        // REMOVE OLD DEFINITION BELOW
      }

      if (reportType === "muda") {
        // Sheet 1: Bts Muda Bulan Ini by Blok by Date
        const currentMonthSheet = workbook.addWorksheet("Bts Muda Bulan Ini", {
          views: [{ state: "frozen", ySplit: 3, xSplit: 1 }],
        });

        // Title
        currentMonthSheet.mergeCells("A1:E1");
        const t1 = currentMonthSheet.getCell("A1");
        t1.value = `BTS MUDA MENGIKUT BLOK & TARIKH (${exportMonth || new Date().toISOString().slice(0, 7)})`;
        t1.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
        t1.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF10B981" },
        }; // Emerald 500 (App Theme)
        t1.alignment = { horizontal: "center", vertical: "middle" };
        currentMonthSheet.getRow(1).height = 35;

        // Get unique dates and blocks for the selected month
        const selectedMonth =
          exportMonth || new Date().toISOString().slice(0, 7);
        // CRITICAL: Use rawData instead of filteredData to ensure we get ALL records for the month,
        // even if the user has a specific date filter active in the UI.
        const monthData = rawData.filter((item) => {
          if (item.tarikh && item.tarikh.startsWith(selectedMonth)) return true;
          if (item.created_at) {
            const createdDate = new Date(
              new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
            )
              .toISOString()
              .split("T")[0];
            return createdDate.startsWith(selectedMonth);
          }
          return false;
        });
        const uniqueDates = Array.from(
          new Set(monthData.map((d) => d.tarikh)),
        ).sort() as string[];
        const uniqueBlocks = Array.from(
          new Set(monthData.map((d) => d.blok)),
        ).sort(
          (a, b) => parseInt(a as string) - parseInt(b as string),
        ) as string[];

        // Headers for Sheet 1
        const headerRow1 = currentMonthSheet.getRow(3);
        const headers1 = ["BLOK", ...uniqueDates, "JUMLAH"];
        headerRow1.values = headers1 as any[];
        headerRow1.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF059669" },
          }; // Emerald 600
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Add Data for Sheet 1
        uniqueBlocks.forEach((blok) => {
          const rowValues: (string | number)[] = [blok as string];
          let blockTotal = 0;
          uniqueDates.forEach((date) => {
            const val = monthData
              .filter((d) => d.blok === blok && d.tarikh === date)
              .reduce((sum, curr) => sum + (curr.muda || 0), 0);
            rowValues.push(val || 0);
            blockTotal += val;
          });
          rowValues.push(blockTotal);
          const row = currentMonthSheet.addRow(rowValues);
          row.eachCell((cell, colIdx) => {
            cell.alignment = { horizontal: "center" };
            cell.border = {
              top: { style: "thin", color: { argb: "FFD1D5DB" } },
              left: { style: "thin", color: { argb: "FFD1D5DB" } },
              bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
              right: { style: "thin", color: { argb: "FFD1D5DB" } },
            };
            if (colIdx === headers1.length) cell.font = { bold: true };
          });
        });

        // Add Total Row for Sheet 1
        const totalRow1Values: (string | number)[] = ["JUMLAH"];
        let grandTotal1 = 0;
        uniqueDates.forEach((date) => {
          const dayTotal = monthData
            .filter((d) => d.tarikh === date)
            .reduce((sum, curr) => sum + (curr.muda || 0), 0);
          totalRow1Values.push(dayTotal);
          grandTotal1 += dayTotal;
        });
        totalRow1Values.push(grandTotal1);
        const totalRow1 = currentMonthSheet.addRow(totalRow1Values);
        totalRow1.eachCell((cell) => {
          cell.font = { bold: true, size: 10 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFDE68A" },
          }; // Amber 200
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "medium" },
            left: { style: "thin" },
            bottom: { style: "medium" },
            right: { style: "thin" },
          };
        });

        // Sheet 2: Bts Muda Hingga Bulan Ini by Blok by Month
        const ytdSheet = workbook.addWorksheet("Bts Muda YTD", {
          views: [{ state: "frozen", ySplit: 3, xSplit: 1 }],
        });

        // Title
        ytdSheet.mergeCells("A1:E1");
        const t2 = ytdSheet.getCell("A1");
        t2.value = `BTS MUDA MENGIKUT BLOK & BULAN (YTD ${new Date().getFullYear()})`;
        t2.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
        t2.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF10B981" },
        }; // Emerald 500
        t2.alignment = { horizontal: "center", vertical: "middle" };
        ytdSheet.getRow(1).height = 35;

        // Get unique months for the current year
        const currentYear = new Date().getFullYear().toString();
        const yearData = rawData.filter((item) => {
          if (item.tarikh && item.tarikh.startsWith(currentYear)) return true;
          if (item.created_at) {
            const createdDate = new Date(
              new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
            )
              .toISOString()
              .split("T")[0];
            return createdDate.startsWith(currentYear);
          }
          return false;
        });

        // Helper to get month string from item
        const getMonthStr = (item: Transaction) => {
          if (item.tarikh) return item.tarikh.slice(0, 7);
          if (item.created_at) {
            return new Date(
              new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
            )
              .toISOString()
              .slice(0, 7);
          }
          return "";
        };

        const uniqueMonths = Array.from(
          new Set(yearData.map((d) => getMonthStr(d))),
        )
          .filter((m) => (m as string).startsWith(currentYear))
          .sort() as string[];
        const uniqueBlocksYear = Array.from(
          new Set(yearData.map((d) => d.blok)),
        ).sort(
          (a, b) => parseInt(a as string) - parseInt(b as string),
        ) as string[];

        // Headers for Sheet 2
        const headerRow2 = ytdSheet.getRow(3);
        const headers2 = [
          "BLOK",
          ...uniqueMonths.map((m) => {
            const date = new Date(m + "-01");
            return date
              .toLocaleString("ms-MY", { month: "short" })
              .toUpperCase();
          }),
          "JUMLAH",
        ];
        headerRow2.values = headers2 as any[];
        headerRow2.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF059669" },
          }; // Emerald 600
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Add Data for Sheet 2
        uniqueBlocksYear.forEach((blok) => {
          const rowValues: (string | number)[] = [blok as string];
          let blockTotal = 0;
          uniqueMonths.forEach((month) => {
            const val = yearData
              .filter((d) => d.blok === blok && getMonthStr(d) === month)
              .reduce((sum, curr) => sum + (curr.muda || 0), 0);
            rowValues.push(val || 0);
            blockTotal += val;
          });
          rowValues.push(blockTotal);
          const row = ytdSheet.addRow(rowValues);
          row.eachCell((cell, colIdx) => {
            cell.alignment = { horizontal: "center" };
            cell.border = {
              top: { style: "thin", color: { argb: "FFD1D5DB" } },
              left: { style: "thin", color: { argb: "FFD1D5DB" } },
              bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
              right: { style: "thin", color: { argb: "FFD1D5DB" } },
            };
            if (colIdx === headers2.length) cell.font = { bold: true };
          });
        });

        // Add Total Row for Sheet 2
        const totalRow2Values: (string | number)[] = ["JUMLAH"];
        let grandTotal2 = 0;
        uniqueMonths.forEach((month) => {
          const monthTotal = yearData
            .filter((d) => getMonthStr(d) === month)
            .reduce((sum, curr) => sum + (curr.muda || 0), 0);
          totalRow2Values.push(monthTotal);
          grandTotal2 += monthTotal;
        });
        totalRow2Values.push(grandTotal2);
        const totalRow2 = ytdSheet.addRow(totalRow2Values);
        totalRow2.eachCell((cell) => {
          cell.font = { bold: true, size: 10 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFDE68A" },
          }; // Amber 200
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "medium" },
            left: { style: "thin" },
            bottom: { style: "medium" },
            right: { style: "thin" },
          };
        });

        // Auto-width columns for both sheets
        [currentMonthSheet, ytdSheet].forEach((s) => {
          s.columns.forEach((column) => {
            column.width = 12;
          });
          s.getColumn(1).width = 12;
        });

        // --- NEW SHEET: SENARAI MUDA >= 5 ---
        const alertMudaSheet = workbook.addWorksheet("Alert Muda >= 5", {
          views: [{ state: "frozen", ySplit: 3 }],
        });

        // Title
        alertMudaSheet.mergeCells("A1:G1");
        const tAlert = alertMudaSheet.getCell("A1");
        tAlert.value = "SENARAI RESIT / LORI (BTS MUDA >= 5)";
        tAlert.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
        tAlert.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE11D48" },
        }; // Rose 600
        tAlert.alignment = { horizontal: "center", vertical: "middle" };
        alertMudaSheet.getRow(1).height = 35;

        // Headers
        const headerAlert = alertMudaSheet.getRow(3);
        headerAlert.values = [
          "BIL",
          "TARIKH",
          "NO. LORI",
          "NO. RESIT",
          "BLOK",
          "TAN",
          "BTS MUDA",
        ];
        headerAlert.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF475569" },
          }; // Slate 600
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
        headerAlert.height = 25;

        // Filter data for Muda >= 5
        const alertData = monthData
          .filter((d) => (d.muda || 0) >= 5)
          .sort((a, b) => (b.muda || 0) - (a.muda || 0));

        // Add rows
        alertData.forEach((item, idx) => {
          const row = alertMudaSheet.addRow([
            idx + 1,
            item.tarikh.split("-").reverse().join("."),
            item.no_lori,
            item.no_resit,
            item.blok,
            item.tan,
            item.muda,
          ]);
          row.eachCell((cell, colIdx) => {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin", color: { argb: "FFD1D5DB" } },
              left: { style: "thin", color: { argb: "FFD1D5DB" } },
              bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
              right: { style: "thin", color: { argb: "FFD1D5DB" } },
            };
            cell.font = { size: 10 };
            if (colIdx === 7) {
              cell.font = { bold: true, color: { argb: "FFE11D48" } }; // Highlight Muda value in Rose 600
            }
          });
        });

        // Column Widths
        alertMudaSheet.getColumn(1).width = 8;
        alertMudaSheet.getColumn(2).width = 15;
        alertMudaSheet.getColumn(3).width = 15;
        alertMudaSheet.getColumn(4).width = 15;
        alertMudaSheet.getColumn(5).width = 10;
        alertMudaSheet.getColumn(6).width = 12;
        alertMudaSheet.getColumn(7).width = 12;
      }

      // --- ADD CHARTS SHEET ---
      if (reportType !== "efc_format") {
        const chartSheet = workbook.addWorksheet("Visual Analitik");

        // Title
        chartSheet.mergeCells("A1:L1");
        const tCell = chartSheet.getCell("A1");
        tCell.value = "LAPORAN VISUAL & ANALITIK GRAFIK";
        tCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
        tCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF064E3B" },
        }; // Emerald 900
        tCell.alignment = { horizontal: "center", vertical: "middle" };
        chartSheet.getRow(1).height = 50;

        let currentImageRow = 3;

        const wait = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));

        const addChartToSheet = async (
          ref: React.RefObject<HTMLDivElement>,
          title: string,
        ) => {
          if (!ref.current) {
            console.warn(`Ref for ${title} is null`);
            return;
          }

          const dashboardContainer = document.getElementById(
            "dashboard-tab-container",
          );
          const containerWasHidden =
            dashboardContainer &&
            dashboardContainer.classList.contains("hidden");

          // Temporarily ensure the chart and its container are visible for capture
          const originalStyle = ref.current.style.display;
          const isHidden =
            ref.current.offsetParent === null || containerWasHidden;

          if (containerWasHidden && dashboardContainer) {
            dashboardContainer.classList.remove("hidden");
            dashboardContainer.style.position = "absolute";
            dashboardContainer.style.left = "-9999px";
            dashboardContainer.style.top = "-9999px";
            dashboardContainer.style.display = "block";
          }

          if (isHidden) {
            ref.current.style.display = "block";
            // Wait for the chart to re-render/resize in its new visible state
            await wait(1000);
          }

          try {
            const domToImage = (await import("dom-to-image")).default;

            const base64Image = await domToImage.toPng(ref.current, {
              bgcolor: isDarkMode ? "#0F172A" : "#FFFFFF",
            });

            if (containerWasHidden && dashboardContainer) {
              dashboardContainer.classList.add("hidden");
              dashboardContainer.style.position = "";
              dashboardContainer.style.left = "";
              dashboardContainer.style.top = "";
              dashboardContainer.style.display = "";
            }

            if (isHidden) {
              ref.current.style.display = originalStyle;
            }

            const imageId = workbook.addImage({
              base64: base64Image,
              extension: "png",
            });

            // Add Title for the chart
            chartSheet.mergeCells(`A${currentImageRow}:L${currentImageRow}`);
            const titleCell = chartSheet.getCell(`A${currentImageRow}`);
            titleCell.value = `> ${title}`;
            titleCell.font = {
              bold: true,
              size: 12,
              color: { argb: "FF10B981" },
            };
            titleCell.alignment = { horizontal: "left" };
            chartSheet.getRow(currentImageRow).height = 25;

            // Add the image (tl is 0-indexed)
            chartSheet.addImage(imageId, {
              tl: { col: 0, row: currentImageRow },
              ext: { width: 900, height: 450 },
            });

            currentImageRow += 25; // Move down for next chart
          } catch (err) {
            console.error(`Error adding ${title} to excel:`, err);
          }
        };

        if (monthlyTrendRef.current) {
          await addChartToSheet(
            monthlyTrendRef,
            `TREND BULANAN (${reportType.toUpperCase()})`,
          );
        }

        if (thekChartRef.current) {
          await addChartToSheet(
            thekChartRef,
            `PRESTASI ANALITIK - THEK (${chartPeriod.toUpperCase()})`,
          );
        }
      }

      // Finalize and Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      let fileName = `FPMSB_TUNGGAL_Rekod_Hantaran_${new Date().toISOString().split("T")[0]}.xlsx`;
      if (reportType === "kpa_kpg") {
        fileName = `FPMSB_TUNGGAL_KPG_KPA_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
      } else if (reportType === "efc_format") {
        fileName = `FPMSB_TUNGGAL_EFC_Format_${new Date().toISOString().split("T")[0]}.xlsx`;
      }
      if (exportFilter === "date")
        fileName = fileName.replace(".xlsx", `_${exportDate}.xlsx`);
      if (exportFilter === "month")
        fileName = fileName.replace(".xlsx", `_${exportMonth}.xlsx`);

      saveAs(blob, fileName);
      showToast("success", "Fail Excel cantik berjaya dimuat turun.");
      setShowExportModal(false);
    } catch (error) {
      console.error("Excel Export Error:", error);
      showToast("error", "Gagal memuat turun Excel. Sila cuba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleOcrScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    showToast("success", "Menganalisis resit dengan Gemini AI...");

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "undefined") {
        throw new Error(
          "API Key Gemini tidak dijumpai. Sila masukkan GEMINI_API_KEY di tetapan Vercel dan redeploy.",
        );
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type || "image/jpeg",
              },
            },
            {
              text: `Anda adalah pakar OCR khusus untuk resit FGV Trading Sdn. Bhd dan resit EFB (Tandan Kosong). Ekstrak data dengan ketepatan 100% mengikut peraturan berikut:

LOGIK EKSTRAKSI (RESIT FGV):
- tarikh: Cari label "Tarikh Urusniaga". Gunakan format YYYY-MM-DD.
- masa_masuk: Cari baris "Gross". Ambil waktu (HH:MM:SS) yang berada di bawah kolum "Masa".
- no_resit: Ambil nilai di sebelah "No. Akuan Terima" atau "No. Resit" (cth: A00008947). Ambil salah satu sahaja kerana ia adalah data yang sama.
- no_lori: Ambil nilai di sebelah "No. Lori" (cth: CCR1449).
- no_nota_hantaran: Ambil nilai 10-digit di sebelah "Nota Hantaran" (cth: 1552600137).
- kpg: Cari baris yang sama dengan "Nota Hantaran". Ambil digit dengan 2 titik perpuluhan yang berada selepas corak "21.00/" (cth: jika "21.00/19.50", ambil "19.50").
- blok: Cari baris "Penjual". Ambil 2 digit nombor yang berada tepat sebelum perkataan "SKB" (cth: jika "12 SKB", ambil "12").
- tan: Cari label "Nett.". Ambil nilai nombor (tan) di sebelahnya (cth: 3.24). 
- muda: pada baris >25 0, Muda, ambil number selepas 'muda :' biasanya 1 atau 2 digit (tandan).
- no_seal: Cari tulisan tangan 6-digit nombor yang terletak di bawah "M-Manual" di bahagian bawah kanan resit.
- is_efb: false

LOGIK EKSTRAKSI (RESIT EFB):
- tarikh: Cari label "Tarikh Urusniaga". Gunakan format YYYY-MM-DD.
- no_lori: Cari label "No. Lori".
- tan: Cari label "Nett". Ambil nilai nombor di sebelahnya (cth: 5.20).
- blok: Cari label "No. MPOB". Blok adalah 1 atau 2 digit nombor (biasanya tulisan tangan) yang berada tepat di bawah label "No. MPOB".
- no_resit: Cari sebarang nombor siri atau "No. Resit" di bahagian atas. Jika tiada, gunakan "EFB-" diikuti No. Lori dan Tarikh tanpa sengkang.
- is_efb: true (WAJIB true jika resit bertajuk "TANDAN KOSONG" atau "EFB")

PERATURAN TEKNIKAL:
1. Output WAJIB dalam format JSON sahaja.
2. Nilai "tan", "kpg", dan "muda" mestilah jenis 'number'.
3. Jika tulisan kabur, bandingkan Nett = Gross - Tare. Gunakan hasil matematik tersebut.
4. Tentukan is_efb berdasarkan kandungan resit.`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tarikh: {
                type: Type.STRING,
                description: "Tarikh Urusniaga (YYYY-MM-DD)",
              },
              masa_masuk: {
                type: Type.STRING,
                description: "Masa Masuk (HH:MM:SS)",
              },
              no_resit: {
                type: Type.STRING,
                description: "Nombor Resit atau Nombor Akuan Terima",
              },
              no_lori: { type: Type.STRING, description: "Nombor Lori" },
              no_nota_hantaran: {
                type: Type.STRING,
                description: "Nombor Nota Hantaran (10 digit)",
              },
              kpg: {
                type: Type.NUMBER,
                description: "Nilai KPG (2 titik perpuluhan selepas 21.00/)",
              },
              blok: {
                type: Type.STRING,
                description: "Nombor blok (2 digit sebelum SKB)",
              },
              tan: {
                type: Type.NUMBER,
                description: "Berat bersih (Nett) dalam Tan",
              },
              muda: { type: Type.NUMBER, description: "Bilangan tandan muda" },
              no_seal: {
                type: Type.STRING,
                description:
                  "Nombor seal (6 digit tulisan tangan di bawah M-Manual)",
              },
              is_efb: {
                type: Type.BOOLEAN,
                description: "Adakah ini resit EFB?",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Tahap keyakinan 0-100",
              },
            },
            required: ["tarikh", "no_resit", "no_lori", "tan", "confidence"],
          },
        },
      });

      const rawText = response.text || "{}";
      const cleanText = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const result = JSON.parse(cleanText);
      console.log("GEMINI OCR RESULT:", result);

      if (result.no_resit || result.no_lori || result.tan) {
        setFormData((prev) => ({
          ...prev,
          no_resit: result.no_resit || prev.no_resit,
          no_akaun_terima: "", // Clear this as it's now merged with no_resit
          no_lori: result.no_lori || prev.no_lori,
          no_nota_hantaran: result.no_nota_hantaran || prev.no_nota_hantaran,
          no_seal: result.no_seal || prev.no_seal,
          kpg: result.kpg?.toString() || prev.kpg,
          tan: result.tan?.toString() || prev.tan,
          muda: result.muda?.toString() || prev.muda,
          tarikh: result.tarikh || prev.tarikh,
          masa_masuk: result.masa_masuk || prev.masa_masuk,
          is_efb: !!result.is_efb,
          blok: result.is_efb ? "99" : result.blok || prev.blok,
        }));

        if (result.confidence < 70) {
          showToast(
            "error",
            `⚠️ Accuracy rendah (${result.confidence}%). Sila semak maklumat.`,
          );
        } else {
          showToast(
            "success",
            result.is_efb
              ? `✅ Scan EFB berjaya (${result.confidence}%)`
              : `✅ Scan berjaya (${result.confidence}%)`,
          );
        }
      } else {
        showToast(
          "error",
          "Gagal mengekstrak maklumat. Sila isi secara manual.",
        );
      }
    } catch (err: any) {
      console.error("Gemini OCR Error:", err);
      showToast("error", `Ralat OCR: ${err.message || "Sila cuba lagi."}`);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- ANALITIK LOGIK ---
  const historicalEfbTransactions = useMemo(() => {
    const transactions: Transaction[] = [];
    EFB_DATA_2026.forEach((monthRecord) => {
      Object.entries(monthRecord.data).forEach(([blok, tan]) => {
        transactions.push({
          no_resit: `EFB-HIST-${monthRecord.month}-${blok}`,
          no_lori: "HISTORICAL",
          blok,
          tan,
          muda: 0,
          peringkat: "EFB",
          tarikh: `${monthRecord.month}-15`,
        });
      });
    });
    return transactions;
  }, []);

  const combinedData = useMemo(() => {
    return [...(rawData || []), ...historicalEfbTransactions];
  }, [rawData, historicalEfbTransactions]);

  const analytics = useMemo(() => {
    const todayStr = dashboardDate;

    const currentMonth = todayStr.slice(0, 7);
    const currentYear = todayStr.slice(0, 4);

    const calculateForPeriod = (
      dataToProcess: Transaction[],
      periodType: "day" | "month" | "year",
    ) => {
      if (!dataToProcess || !Array.isArray(dataToProcess)) {
        return {
          pkt1_tan: 0,
          pkt2_tan: 0,
          felda_tan: 0,
          pkt1_muda: 0,
          pkt2_muda: 0,
          felda_muda: 0,
          pkt1_kpg_match: 0,
          pkt2_kpg_match: 0,
          felda_kpg_match: 0,
          pkt1_resit: 0,
          pkt2_resit: 0,
          felda_resit: 0,
          blokStats: [],
          rankedBlok: [],
          totalResit: 0,
          kpgMatchCount: 0,
          kpgMatchTan: 0,
          totalTan: 0,
          totalMuda: 0,
          totalTargetTan: 0,
          avgPrice: 0,
          pkt1_avg_price: 0,
          pkt2_avg_price: 0,
          felda_avg_price: 0,
        };
      }
      let pkt1_tan = 0,
        pkt2_tan = 0,
        felda_tan = 0;
      let pkt1_muda = 0,
        pkt2_muda = 0,
        felda_muda = 0;
      let pkt1_kpg_match = 0,
        pkt2_kpg_match = 0,
        felda_kpg_match = 0;
      let pkt1_resit = 0,
        pkt2_resit = 0,
        felda_resit = 0;
      let efb_tan = 0,
        efb_resit = 0;

      let pkt1_total_price = 0,
        pkt2_total_price = 0,
        felda_total_price = 0;
      let pkt1_price_count = 0,
        pkt2_price_count = 0,
        felda_price_count = 0;

      let pkt1_total_price1pct = 0,
        pkt2_total_price1pct = 0,
        felda_total_price1pct = 0;
      let pkt1_price1pct_count = 0,
        pkt2_price1pct_count = 0,
        felda_price1pct_count = 0;

      // Overall totals for the period (excluding EFB for main yield metrics)
      const ffbData = dataToProcess.filter((item) => item.peringkat !== "EFB");
      const totalTan = ffbData.reduce((acc, curr) => acc + (curr.tan || 0), 0);
      const totalMuda = ffbData.reduce(
        (acc, curr) => acc + (curr.muda || 0),
        0,
      );
      let totalResit = ffbData.length;

      let kpgMatchCount = 0;
      let kpgMatchTan = 0;

      const blokStats = Object.keys(MASTER_DATA).map((blok) => {
        const pkt = MASTER_DATA[blok].pkt;
        const targets = MONTHLY_TARGETS_2026[pkt] || [];
        const [dbYear, dbMonth, dbDay] = todayStr.split("-");
        const now = new Date(parseInt(dbYear), parseInt(dbMonth) - 1, parseInt(dbDay));
        const currentMonthIdx = now.getMonth();
        const currentDay = now.getDate();
        const daysInMonth = new Date(
          now.getFullYear(),
          currentMonthIdx + 1,
          0,
        ).getDate();

        let periodTargetHek = 0;
        if (periodType === "day") {
          periodTargetHek = (targets[currentMonthIdx] || 0) / daysInMonth;
        } else if (periodType === "month") {
          periodTargetHek = targets[currentMonthIdx] || 0;
        } else if (periodType === "year") {
          const sumPrevMonths = targets
            .slice(0, currentMonthIdx)
            .reduce((a, b) => a + b, 0);
          const partialCurrentMonth =
            (targets[currentMonthIdx] || 0) * (currentDay / daysInMonth);
          periodTargetHek = sumPrevMonths + partialCurrentMonth;
        }

        const scaledTargetMt = periodTargetHek * MASTER_DATA[blok].luas;

        return {
          blok,
          pkt,
          luas: MASTER_DATA[blok].luas,
          target_mt: scaledTargetMt,
          tan: 0,
          efb_tan: 0,
          muda: 0,
          resit_count: 0,
          kpg_match_count: 0,
          yieldHek: 0,
          targetHek: periodTargetHek,
          progress_pct: 0,
          color: "",
        };
      });

      dataToProcess.forEach((row) => {
        if (row.peringkat === "EFB") {
          efb_tan += row.tan;
          efb_resit += 1;
          const rowBlok = String(row.blok || "").trim();
          const b = blokStats.find((s) => s.blok === rowBlok);
          if (b) {
            b.efb_tan += row.tan;
          }
          return;
        }

        const rowBlok = String(row.blok || "").trim();
        const b = blokStats.find((s) => s.blok === rowBlok);

        // KPG=KPA Logic: 21.25 starting today (2026-04-13), 21.00 for historical data
        const kpgVal = parseFloat(row.kpg || "0");
        const rowDate =
          row.tarikh ||
          (row.created_at
            ? new Date(new Date(row.created_at).getTime() + 8 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            : "");
        const threshold = rowDate >= "2026-04-13" ? 21.25 : 21.0;

        if (kpgVal >= threshold) {
          kpgMatchCount += 1;
          kpgMatchTan += row.tan;
        }

        if (b) {
          b.tan += row.tan;
          b.muda += row.muda;
          b.resit_count += 1;

          if (kpgVal >= threshold) {
            b.kpg_match_count += 1;
            if (b.pkt === "001") pkt1_kpg_match += 1;
            else if (b.pkt === "002") pkt2_kpg_match += 1;
            else if (b.pkt === "003") felda_kpg_match += 1;
          }

          if (b.pkt === "001") {
            pkt1_tan += row.tan;
            pkt1_muda += row.muda;
            pkt1_resit += 1;
            if (row.rm_mt) {
              pkt1_total_price += row.rm_mt;
              pkt1_price_count += 1;
            }
            if (row.rm_mt && kpgVal > 0) {
              pkt1_total_price1pct += row.rm_mt / kpgVal;
              pkt1_price1pct_count += 1;
            }
          } else if (b.pkt === "002") {
            pkt2_tan += row.tan;
            pkt2_muda += row.muda;
            pkt2_resit += 1;
            if (row.rm_mt) {
              pkt2_total_price += row.rm_mt;
              pkt2_price_count += 1;
            }
            if (row.rm_mt && kpgVal > 0) {
              pkt2_total_price1pct += row.rm_mt / kpgVal;
              pkt2_price1pct_count += 1;
            }
          } else if (b.pkt === "003") {
            felda_tan += row.tan;
            felda_muda += row.muda;
            felda_resit += 1;
            if (row.rm_mt) {
              felda_total_price += row.rm_mt;
              felda_price_count += 1;
            }
            if (row.rm_mt && kpgVal > 0) {
              felda_total_price1pct += row.rm_mt / kpgVal;
              felda_price1pct_count += 1;
            }
          }
        } else {
          // Fallback to peringkat field if block not found
          const p = String(row.peringkat || "").toUpperCase();
          if (p.includes("PKT 1") || p.includes("001")) {
            pkt1_tan += row.tan;
            pkt1_muda += row.muda;
            pkt1_resit += 1;
            if (row.rm_mt) {
              pkt1_total_price += row.rm_mt;
              pkt1_price_count += 1;
            }
            if (row.rm_mt && kpgVal > 0) {
              pkt1_total_price1pct += row.rm_mt / kpgVal;
              pkt1_price1pct_count += 1;
            }
            if (kpgVal >= 21) pkt1_kpg_match += 1;
          } else if (p.includes("PKT 2") || p.includes("002")) {
            pkt2_tan += row.tan;
            pkt2_muda += row.muda;
            pkt2_resit += 1;
            if (row.rm_mt) {
              pkt2_total_price += row.rm_mt;
              pkt2_price_count += 1;
            }
            if (row.rm_mt && kpgVal > 0) {
              pkt2_total_price1pct += row.rm_mt / kpgVal;
              pkt2_price1pct_count += 1;
            }
            if (kpgVal >= 21) pkt2_kpg_match += 1;
          } else if (
            p.includes("PKT 3") ||
            p.includes("003") ||
            p.includes("FELDA")
          ) {
            felda_tan += row.tan;
            felda_muda += row.muda;
            felda_resit += 1;
            if (row.rm_mt) {
              felda_total_price += row.rm_mt;
              felda_price_count += 1;
            }
            if (row.rm_mt && kpgVal > 0) {
              felda_total_price1pct += row.rm_mt / kpgVal;
              felda_price1pct_count += 1;
            }
            if (kpgVal >= 21) felda_kpg_match += 1;
          }
        }
      });

      blokStats.forEach((b) => {
        b.yieldHek = b.luas > 0 ? b.tan / b.luas : 0;
        b.progress_pct = b.targetHek > 0 ? (b.yieldHek / b.targetHek) * 100 : 0;
        (b as any).targetPct =
          b.target_mt > 0 ? (b.tan / b.target_mt) * 100 : 0;

        if (b.progress_pct >= 90) b.color = "text-emerald-500 bg-emerald-50";
        else if (b.progress_pct >= 80) b.color = "text-amber-500 bg-amber-50";
        else b.color = "text-rose-500 bg-rose-50";
      });

      // YoY Logic for Year Period
      let totalYtd2025 = 0;
      let pkt1Ytd2025 = 0,
        pkt2Ytd2025 = 0,
        feldaYtd2025 = 0;
      if (periodType === "year") {
        const [dbYear, dbMonth, dbDay] = todayStr.split("-");
        const now = new Date(parseInt(dbYear), parseInt(dbMonth) - 1, parseInt(dbDay));
        const currentYearMonthIndex = now.getMonth();
        const currentDayOfMonth = now.getDate();
        const daysInCurrentMonth = new Date(
          now.getFullYear(),
          currentYearMonthIndex + 1,
          0,
        ).getDate();

        blokStats.forEach((b) => {
          let ytd2025 = 0;
          for (let i = 0; i < currentYearMonthIndex; i++) {
            ytd2025 += YIELD_DATA_2025[i]?.blok?.[b.blok] || 0;
          }
          // Prorate current month for 2025 to match current day
          const currentMonthVal =
            YIELD_DATA_2025[currentYearMonthIndex]?.blok?.[b.blok] || 0;
          ytd2025 += (currentMonthVal / daysInCurrentMonth) * currentDayOfMonth;

          totalYtd2025 += ytd2025;
          if (b.pkt === "001") pkt1Ytd2025 += ytd2025;
          else if (b.pkt === "002") pkt2Ytd2025 += ytd2025;
          else if (b.pkt === "003") feldaYtd2025 += ytd2025;

          (b as any).ytd_2025_tan = ytd2025;
          (b as any).ytd_2026_tan = b.tan;
          const diff = ytd2025 > 0 ? ((b.tan - ytd2025) / ytd2025) * 100 : 0;
          (b as any).yoy_diff_pct = diff;
        });
      }

      const rankedBlok = [...blokStats].sort((a, b) => {
        if (rankingPeriod === "yoy" && (a as any).yoy_diff_pct !== undefined) {
          return (b as any).yoy_diff_pct - (a as any).yoy_diff_pct;
        }
        if (reportType === "muda") {
          return a.muda - b.muda; // Lower is better
        } else if (reportType === "kpa_kpg") {
          return b.kpg_match_count - a.kpg_match_count; // Higher is better
        }
        return b.yieldHek - a.yieldHek; // Default: Higher yield is better
      });
      const totalPrice =
        pkt1_total_price + pkt2_total_price + felda_total_price;
      const priceCount =
        pkt1_price_count + pkt2_price_count + felda_price_count;

      const totalPrice1pct =
        pkt1_total_price1pct + pkt2_total_price1pct + felda_total_price1pct;
      const price1pctCount =
        pkt1_price1pct_count + pkt2_price1pct_count + felda_price1pct_count;

      return {
        pkt1_tan,
        pkt2_tan,
        felda_tan,
        efb_tan,
        pkt1_muda,
        pkt2_muda,
        felda_muda,
        pkt1_kpg_match,
        pkt2_kpg_match,
        felda_kpg_match,
        pkt1_resit,
        pkt2_resit,
        felda_resit,
        efb_resit,
        pkt1_yoy_diff:
          pkt1Ytd2025 > 0 ? ((pkt1_tan - pkt1Ytd2025) / pkt1Ytd2025) * 100 : 0,
        pkt2_yoy_diff:
          pkt2Ytd2025 > 0 ? ((pkt2_tan - pkt2Ytd2025) / pkt2Ytd2025) * 100 : 0,
        felda_yoy_diff:
          feldaYtd2025 > 0
            ? ((felda_tan - feldaYtd2025) / feldaYtd2025) * 100
            : 0,
        pkt1_ytd2025: pkt1Ytd2025,
        pkt2_ytd2025: pkt2Ytd2025,
        felda_ytd2025: feldaYtd2025,
        total_ytd2025: totalYtd2025,
        pkt1_target: blokStats
          .filter((b) => b.pkt === "001")
          .reduce((acc, b) => acc + b.target_mt, 0),
        pkt2_target: blokStats
          .filter((b) => b.pkt === "002")
          .reduce((acc, b) => acc + b.target_mt, 0),
        felda_target: blokStats
          .filter((b) => b.pkt === "003")
          .reduce((acc, b) => acc + b.target_mt, 0),
        blokStats,
        rankedBlok,
        totalResit,
        kpgMatchCount,
        kpgMatchTan,
        totalTan,
        totalMuda,
        totalTargetTan: blokStats.reduce(
          (acc, b) => acc + b.luas * b.targetHek,
          0,
        ),
        yoy_diff_pct:
          totalYtd2025 > 0
            ? ((totalTan - totalYtd2025) / totalYtd2025) * 100
            : 0,
        avgPrice: priceCount > 0 ? totalPrice / priceCount : 0,
        price1Pct: price1pctCount > 0 ? totalPrice1pct / price1pctCount : 0,
        pkt1_avg_price:
          pkt1_price_count > 0 ? pkt1_total_price / pkt1_price_count : 0,
        pkt2_avg_price:
          pkt2_price_count > 0 ? pkt2_total_price / pkt2_price_count : 0,
        felda_avg_price:
          felda_price_count > 0 ? felda_total_price / felda_price_count : 0,
      };
    };

    const isToday = (item: Transaction) => {
      if (item.tarikh === todayStr) return true;
      // Fallback to created_at only for April 2026 onwards
      if (todayStr < "2026-04-01") return false;
      if (!item.created_at) return false;
      const createdDate = new Date(
        new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];
      return createdDate === todayStr;
    };

    const isThisMonth = (item: Transaction) => {
      if (item.tarikh && item.tarikh.startsWith(currentMonth)) return true;
      // Fallback to created_at only for April 2026 onwards
      if (currentMonth < "2026-04") return false;
      if (!item.created_at) return false;
      const createdDate = new Date(
        new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];
      return createdDate.startsWith(currentMonth);
    };

    const isThisYear = (item: Transaction) => {
      if (item.tarikh && item.tarikh.startsWith(currentYear)) return true;
      // Fallback to created_at only for 2026 onwards
      if (currentYear < "2026") return false;
      if (!item.created_at) return false;
      const createdDate = new Date(
        new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];
      return createdDate.startsWith(currentYear);
    };

    const dataToday = combinedData.filter(isToday);
    const dataMonth = combinedData.filter(isThisMonth);
    const dataYear = combinedData.filter(isThisYear);

    // Calculate daily price stats for 'harga' report
    const dailyPriceStats = combinedData
      .reduce((acc: any[], curr) => {
        const date = curr.tarikh;
        if (!date) return acc;
        let existing = acc.find((d) => d.date === date);

        const kpgVal = parseFloat(curr.kpg || "0");
        const currentPrice1Pct =
          curr.rm_mt && kpgVal > 0 ? curr.rm_mt / kpgVal : 0;

        if (!existing) {
          acc.push({
            date,
            avgPrice: curr.rm_mt || 0,
            price1Pct: currentPrice1Pct,
          });
        } else {
          if (existing.avgPrice === 0 && curr.rm_mt) {
            existing.avgPrice = curr.rm_mt;
          }
          if (existing.price1Pct === 0 && currentPrice1Pct > 0) {
            existing.price1Pct = currentPrice1Pct;
          }
        }
        return acc;
      }, [])
      .sort((a, b) => b.date.localeCompare(a.date));

    // Calculate monthly trend for current year using Resit Date (tarikh)
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mac",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Ogos",
        "Sep",
        "Okt",
        "Nov",
        "Dis",
      ];
      const monthIndex = i + 1;
      const monthStr = `${currentYear}-${String(monthIndex).padStart(2, "0")}`;
      const hist2025 = YIELD_DATA_2025[i];

      const monthDataForTrend = combinedData.filter((item) => {
        // Use resit date (tarikh) primarily
        if (item.tarikh && item.tarikh.startsWith(monthStr)) return true;

        // For March (Mac) and earlier, strictly follow tarikh (don't use entry date fallback)
        if (monthStr < "2026-04") return false;

        // Fallback to created_at for April 2026 onwards
        if (!item.created_at) return false;
        const createdDate = new Date(
          new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0];
        return createdDate.startsWith(monthStr);
      });

      let pkt1Tan = 0,
        pkt2Tan = 0,
        feldaTan = 0;
      let pkt1Muda = 0,
        pkt2Muda = 0,
        feldaMuda = 0;
      let pkt1Kpg = 0,
        pkt2Kpg = 0,
        feldaKpg = 0;
      let pkt1Efb = 0,
        pkt2Efb = 0,
        feldaEfb = 0;

      monthDataForTrend.forEach((item) => {
        if (item.peringkat === "EFB") {
          const b = MASTER_DATA[item.blok];
          if (b) {
            if (b.pkt === "001") pkt1Efb += item.tan || 0;
            else if (b.pkt === "002") pkt2Efb += item.tan || 0;
            else if (b.pkt === "003") feldaEfb += item.tan || 0;
          }
          return;
        }

        const b = MASTER_DATA[item.blok];
        const kpgVal = parseFloat(item.kpg || "0");
        const rowDate =
          item.tarikh ||
          (item.created_at
            ? new Date(new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            : "");
        const threshold = rowDate >= "2026-04-13" ? 21.25 : 21.0;

        if (b) {
          if (b.pkt === "001") {
            pkt1Tan += item.tan || 0;
            pkt1Muda += item.muda || 0;
            if (kpgVal >= threshold) pkt1Kpg += 1;
          } else if (b.pkt === "002") {
            pkt2Tan += item.tan || 0;
            pkt2Muda += item.muda || 0;
            if (kpgVal >= threshold) pkt2Kpg += 1;
          } else if (b.pkt === "003") {
            feldaTan += item.tan || 0;
            feldaMuda += item.muda || 0;
            if (kpgVal >= threshold) feldaKpg += 1;
          }
        } else {
          const p = String(item.peringkat || "").toUpperCase();
          if (
            p.includes("PKT 3") ||
            p.includes("003") ||
            p.includes("FELDA") ||
            item.blok === "LF" ||
            item.blok === "88"
          ) {
            feldaTan += item.tan || 0;
            feldaMuda += item.muda || 0;
            if (kpgVal >= threshold) feldaKpg += 1;
          }
        }
      });

      const pkt1Luas = Object.values(MASTER_DATA)
        .filter((m) => m.pkt === "001")
        .reduce((acc, curr) => acc + curr.luas, 0);
      const pkt2Luas = Object.values(MASTER_DATA)
        .filter((m) => m.pkt === "002")
        .reduce((acc, curr) => acc + curr.luas, 0);
      const feldaLuas = Object.values(MASTER_DATA)
        .filter((m) => m.pkt === "003")
        .reduce((acc, curr) => acc + curr.luas, 0);

      const ffbMonthData = monthDataForTrend.filter(
        (item) => item.peringkat !== "EFB",
      );
      const totalTan = ffbMonthData.reduce(
        (acc, curr) => acc + (curr.tan || 0),
        0,
      );
      const efbTan = monthDataForTrend
        .filter((item) => item.peringkat === "EFB")
        .reduce((acc, curr) => acc + (curr.tan || 0), 0);
      const totalMuda = ffbMonthData.reduce(
        (acc, curr) => acc + (curr.muda || 0),
        0,
      );
      const totalKpg = ffbMonthData.filter((item) => {
        const kpgVal = parseFloat(item.kpg || "0");
        const rowDate =
          item.tarikh ||
          (item.created_at
            ? new Date(new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            : "");
        const threshold = rowDate >= "2026-04-13" ? 21.25 : 21.0;
        return kpgVal >= threshold;
      }).length;
      const totalLuas = Object.values(MASTER_DATA).reduce(
        (acc, curr) => acc + curr.luas,
        0,
      );
      const yieldHek = totalLuas > 0 ? totalTan / totalLuas : 0;

      // Block-specific yield for filtering
      const blockYields: Record<string, number> = {};
      Object.keys(MASTER_DATA).forEach((blok) => {
        const blokData = monthDataForTrend.filter((d) => d.blok === blok);
        const ffbBlokData = blokData.filter((d) => d.peringkat !== "EFB");
        const blokTan = ffbBlokData.reduce(
          (acc, curr) => acc + (curr.tan || 0),
          0,
        );
        const blokLuas = MASTER_DATA[blok].luas;
        blockYields[`yield_${blok}`] =
          blokLuas > 0 ? parseFloat((blokTan / blokLuas).toFixed(2)) : 0;
        blockYields[`t_h2025_blok_${blok}`] =
          blokLuas > 0
            ? parseFloat(((hist2025?.blok?.[blok] || 0) / blokLuas).toFixed(2))
            : 0;
        blockYields[`muda_${blok}`] = ffbBlokData.reduce(
          (acc, curr) => acc + (curr.muda || 0),
          0,
        );
        blockYields[`efb_${blok}`] = blokData
          .filter((d) => d.peringkat === "EFB")
          .reduce((acc, curr) => acc + (curr.tan || 0), 0);
        blockYields[`kpg_${blok}`] = ffbBlokData.filter((item) => {
          const kpgVal = parseFloat(item.kpg || "0");
          const rowDate =
            item.tarikh ||
            (item.created_at
              ? new Date(
                  new Date(item.created_at).getTime() + 8 * 60 * 60 * 1000,
                )
                  .toISOString()
                  .split("T")[0]
              : "");
          const threshold = rowDate >= "2026-04-13" ? 21.25 : 21.0;
          return kpgVal >= threshold;
        }).length;
      });

      // Price aggregation for monthly trend
      const priceData = monthDataForTrend.filter(
        (item) => item.rm_mt && item.rm_mt > 0,
      );
      const avgPrice =
        priceData.length > 0
          ? priceData.reduce((acc, curr) => acc + curr.rm_mt, 0) /
            priceData.length
          : 0;

      const price1PctData = monthDataForTrend.filter(
        (item) => item.rm_mt && parseFloat(item.kpg || "0") > 0,
      );
      const avgPrice1Pct =
        price1PctData.length > 0
          ? price1PctData.reduce(
              (acc, curr) => acc + curr.rm_mt / parseFloat(curr.kpg || "0"),
              0,
            ) / price1PctData.length
          : 0;

      const targetPKT1 = (MONTHLY_TARGETS_2026["001"] || [])[i] || 0;
      const targetPKT2 = (MONTHLY_TARGETS_2026["002"] || [])[i] || 0;
      const targetFELDA = (MONTHLY_TARGETS_2026["003"] || [])[i] || 0;

      const totalTargetHek =
        totalLuas > 0
          ? (targetPKT1 * pkt1Luas +
              targetPKT2 * pkt2Luas +
              targetFELDA * feldaLuas) /
            totalLuas
          : 0;

      return {
        month: monthNames[i],
        yield: parseFloat(yieldHek.toFixed(2)),
        yieldHek: parseFloat(yieldHek.toFixed(2)),
        yield2025: hist2025?.yield || 0,
        t_h2025: hist2025?.t_h || 0,
        t_h2025_pkt1:
          pkt1Luas > 0
            ? parseFloat(((hist2025?.pkt1_tan || 0) / pkt1Luas).toFixed(2))
            : 0,
        t_h2025_pkt2:
          pkt2Luas > 0
            ? parseFloat(((hist2025?.pkt2_tan || 0) / pkt2Luas).toFixed(2))
            : 0,
        t_h2025_felda:
          feldaLuas > 0
            ? parseFloat(((hist2025?.felda_tan || 0) / feldaLuas).toFixed(2))
            : 0,
        target_2026: parseFloat(totalTargetHek.toFixed(2)),
        target_2026_pkt1: targetPKT1,
        target_2026_pkt2: targetPKT2,
        target_2026_felda: targetFELDA,
        pkt1: pkt1Luas > 0 ? parseFloat((pkt1Tan / pkt1Luas).toFixed(2)) : 0,
        pkt2: pkt2Luas > 0 ? parseFloat((pkt2Tan / pkt2Luas).toFixed(2)) : 0,
        felda:
          feldaLuas > 0 ? parseFloat((feldaTan / feldaLuas).toFixed(2)) : 0,
        muda: totalMuda,
        pkt1Muda,
        pkt2Muda,
        feldaMuda,
        kpg: totalKpg,
        kpg_match_count: totalKpg,
        pkt1Kpg,
        pkt2Kpg,
        feldaKpg,
        tan: parseFloat(totalTan.toFixed(2)),
        efb: parseFloat(efbTan.toFixed(2)),
        efb_tan: parseFloat(efbTan.toFixed(2)),
        pkt1Efb: parseFloat(pkt1Efb.toFixed(1)),
        pkt2Efb: parseFloat(pkt2Efb.toFixed(1)),
        feldaEfb: parseFloat(feldaEfb.toFixed(1)),
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        avgPrice1Pct: parseFloat(avgPrice1Pct.toFixed(2)),
        ...blockYields,
        isCurrentMonth: monthIndex === new Date().getMonth() + 1,
      };
    });

    // Filter daily price stats for current month for the daily chart
    const dailyPriceTrend = [...dailyPriceStats]
      .filter((d) => d.date.startsWith(currentMonth))
      .sort((a, b) => a.date.localeCompare(b.date));

    const dayAnalytics = calculateForPeriod(dataToday, "day");
    const monthAnalytics = calculateForPeriod(dataMonth, "month");
    const yearAnalytics = calculateForPeriod(dataYear, "year");

    return {
      displayDate: todayStr,
      day: dayAnalytics,
      month: monthAnalytics,
      year: yearAnalytics,
      yoy: yearAnalytics, // YOY ranking uses the same data as Year period but sorted differently
      monthlyTrend,
      dailyPriceStats,
      dailyPriceTrend,
    };
  }, [rawData, reportType, rankingPeriod]);

  // Calculate annual data for the history chart - Refined with better filtering and safety
  // Moved after analytics to resolve ReferenceError
  const historyChartData = useMemo(() => {
    // Priority: DB data ONLY (historical fallback cleared as per request)
    const hasDbData =
      Array.isArray(blockAnnualData) && blockAnnualData.length > 0;
    const dataSource = hasDbData ? blockAnnualData : [];

    if (dataSource.length === 0 && !analytics?.year?.yieldHek) return [];

    let filtered = dataSource;

    // Filter by dropdown selection first
    if (selectedBlockFilter !== "all") {
      const bKey = String(selectedBlockFilter);
      filtered = filtered.filter((d) => String(d.block) === bKey);
    } else if (selectedPactFilter !== "all") {
      const allowedBlocks = Object.entries(MASTER_DATA)
        .filter(([_, v]) => v.pkt === selectedPactFilter)
        .map(([k]) => String(k));
      filtered = filtered.filter((d) =>
        allowedBlocks.includes(String(d.block)),
      );
    }

    // Then filter by the history chart internal view selector
    if (thekHistoryView !== "overall") {
      const targetPkt =
        thekHistoryView === "pkt1"
          ? "001"
          : thekHistoryView === "pkt2"
            ? "002"
            : "003";

      const allowedBlocks = Object.entries(MASTER_DATA)
        .filter(([_, v]) => v.pkt === targetPkt)
        .map(([k]) => String(k));

      filtered = filtered.filter((d) =>
        allowedBlocks.includes(String(d.block)),
      );
    }

    // Group by year and calculate weighted average yield
    const yearGroups: Record<
      string,
      { sumTan: number; sumLuas: number; year: number }
    > = {};

    filtered.forEach((d) => {
      const yr = String(d.year);
      if (!yearGroups[yr]) {
        yearGroups[yr] = { sumTan: 0, sumLuas: 0, year: Number(yr) };
      }
      const bLuas = MASTER_DATA[String(d.block)]?.luas || 0;
      if (bLuas > 0) {
        yearGroups[yr].sumTan += Number(d.yield || 0) * bLuas;
        yearGroups[yr].sumLuas += bLuas;
      }
    });

    // Add current 2026 data based on active view
    const currentYear = 2026;
    let currentYield = 0;
    if (analytics?.year) {
      const lPkt1 = Object.values(MASTER_DATA)
        .filter((b) => b.pkt === "001")
        .reduce((acc, curr) => acc + curr.luas, 0);
      const lPkt2 = Object.values(MASTER_DATA)
        .filter((b) => b.pkt === "002")
        .reduce((acc, curr) => acc + curr.luas, 0);
      const lFelda = Object.values(MASTER_DATA)
        .filter((b) => b.pkt === "003")
        .reduce((acc, curr) => acc + curr.luas, 0);
      const lOverall = lPkt1 + lPkt2 + lFelda;

      if (thekHistoryView === "overall") {
        // If there's a selected filter, adjust lOverall to only include those blocks
        if (selectedBlockFilter !== "all") {
          const b = MASTER_DATA[String(selectedBlockFilter)];
          currentYield =
            b && b.luas > 0
              ? analytics.year.blokStats.find(
                  (x) => x.blok === String(selectedBlockFilter),
                )?.capai2026 || 0
              : 0;
        } else if (selectedPactFilter !== "all") {
          const targetLuas =
            selectedPactFilter === "001"
              ? lPkt1
              : selectedPactFilter === "002"
                ? lPkt2
                : lFelda;
          const targetTan =
            selectedPactFilter === "001"
              ? analytics.year.pkt1_tan
              : selectedPactFilter === "002"
                ? analytics.year.pkt2_tan
                : analytics.year.felda_tan;
          currentYield = targetLuas > 0 ? (targetTan || 0) / targetLuas : 0;
        } else {
          currentYield =
            lOverall > 0 ? (analytics.year.totalTan || 0) / lOverall : 0;
        }
      } else if (thekHistoryView === "pkt1") {
        currentYield = lPkt1 > 0 ? (analytics.year.pkt1_tan || 0) / lPkt1 : 0;
      } else if (thekHistoryView === "pkt2") {
        currentYield = lPkt2 > 0 ? (analytics.year.pkt2_tan || 0) / lPkt2 : 0;
      } else if (thekHistoryView === "felda") {
        currentYield =
          lFelda > 0 ? (analytics.year.felda_tan || 0) / lFelda : 0;
      }
    }

    if (currentYield !== undefined && currentYield > 0) {
      yearGroups[String(currentYear)] = {
        sumTan: currentYield, // Already T/H, so we trick it by letting sumLuas = 1
        sumLuas: 1,
        year: currentYear,
      };
    }

    const result = Object.values(yearGroups)
      .map((g) => ({
        year: g.year,
        yield: parseFloat(
          (g.sumLuas > 0 ? g.sumTan / g.sumLuas : 0).toFixed(2),
        ),
      }))
      .sort((a, b) => a.year - b.year);

    return result;
  }, [
    blockAnnualData,
    selectedBlockFilter,
    selectedPactFilter,
    thekHistoryView,
    analytics?.year,
  ]);

  // ==========================================
  // VIEW: LOG MASUK (PIN PAD)
  // ==========================================
  if (!authRole) {
    return (
      <LoginScreen
        pin={pin}
        loginError={loginError}
        isDarkMode={isDarkMode}
        handlePinPress={handlePinPress}
        handleDeletePress={handleDeletePress}
      />
    );
  }

  // ==========================================
  // VIEW: APLIKASI UTAMA
  // ==========================================
  return (
    <div className="w-full max-w-md landscape:max-w-full md:max-w-4xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative pb-24 landscape:pb-20 transition-all duration-500 overflow-hidden">
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold text-white animate-in slide-in-from-top-4 ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}
        >
          {toast.type === "success" ? (
            <ShieldCheck size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {toast.msg}
        </div>
      )}

      <ShareModal
        isOpen={!!sharePreviewData}
        onClose={() => setSharePreviewData(null)}
        sharePreviewData={sharePreviewData}
        setSharePreviewData={setSharePreviewData}
        showToast={showToast}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        reportType={reportType}
        setReportType={setReportType}
        exportFilter={exportFilter}
        setExportFilter={setExportFilter}
        exportMonth={exportMonth}
        setExportMonth={setExportMonth}
        exportDate={exportDate}
        setExportDate={setExportDate}
        exportColumns={exportColumns}
        setExportColumns={setExportColumns}
        isExporting={isExporting}
        exportToExcel={exportToExcel}
      />

      <DeleteRecordModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        recordId={recordToDelete}
        onDelete={handleDeleteRecord}
        isProcessing={isProcessing}
        type="single"
      />

      <NewFeaturesModal
        isOpen={showNewFeaturesModal}
        onClose={() => setShowNewFeaturesModal(false)}
        recentUpdates={recentUpdates}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <DeleteRecordModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        recordId={null}
        onDelete={handleDeleteAllRecords}
        isProcessing={isProcessing}
        type="all"
      />

      <Header
        authRole={authRole}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setShowNewFeaturesModal={setShowNewFeaturesModal}
        setShowExportModal={setShowExportModal}
        setShowSettingsModal={setShowSettingsModal}
        handleLogout={handleLogout}
        userMenuRef={userMenuRef}
        activeTab={activeTab}
        reportTabs={reportTabs}
        setReportTabs={setReportTabs}
        reportType={reportType}
        setReportType={setReportType}
        isReordering={isReordering}
        setIsReordering={setIsReordering}
        longPressTimer={longPressTimer}
      />

      {/* MODAL CIRI BAHARU */}
      <AnimatePresence>
        {showRCReportModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRCReportModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Laporan RC Daily
                    </h3>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">
                      Regional Controller Format
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRCReportModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-mono text-[10px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
                  {generateRCReport()}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyReport}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Clipboard
                      size={20}
                      className="text-slate-600 dark:text-slate-400"
                    />
                    <span className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-400">
                      Salin Teks
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWhatsAppShare}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-500 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    <Share2 size={20} className="text-white" />
                    <span className="text-[9px] font-black uppercase text-white">
                      WhatsApp
                    </span>
                  </motion.button>
                </div>

                <button
                  onClick={() => setShowRCReportModal(false)}
                  className="w-full mt-4 py-3 bg-slate-900 dark:bg-slate-800 text-white/50 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all hover:text-white"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CIRI BAHARU */}
      <AnimatePresence>
        {showNewFeatures && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewFeatures(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Ciri Baharu
                    </h3>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">
                      Kemas Kini April 2026
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewFeatures(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {recentUpdates[0].items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 rounded-[24px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all hover:scale-[1.02]"
                    >
                      <div
                        className={`w-12 h-12 shrink-0 ${item.iconBg} rounded-2xl flex items-center justify-center shadow-inner`}
                      >
                        {React.cloneElement(item.icon, { size: 24 })}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowNewFeatures(false)}
                  className="w-full mt-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg active:scale-[0.98] transition-all"
                >
                  Faham & Teruskan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="px-2 py-4 sm:p-5 overflow-hidden w-full max-w-7xl mx-auto">
        {/* CONFIG WARNING BANNER */}
        {configStatus && !configStatus.supabase && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top duration-500 shadow-sm">
            <AlertTriangle className="text-rose-500 shrink-0" size={20} />
            <div>
              <p className="text-[11px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight">
                Pangkalan Data Tidak Bersambung
              </p>
              <p className="text-[10px] text-rose-600 dark:text-rose-500 font-medium leading-tight mt-1">
                Sila tetapkan{" "}
                <code className="bg-rose-100 dark:bg-rose-900/50 px-1 rounded font-mono">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                &{" "}
                <code className="bg-rose-100 dark:bg-rose-900/50 px-1 rounded font-mono">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{" "}
                di Vercel/AI Studio.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onPanEnd={(_e, info) => {
              const threshold = 50;
              // If we are on dashboard, sub-tabs (report types) take priority for swipes
              // Unless it's a very large swipe or we explicitly want main tab navigation
              if (activeTab === "dashboard") return;

              if (info.offset.x < -threshold) handleMainTabSwipe("left");
              else if (info.offset.x > threshold) handleMainTabSwipe("right");
            }}
            className="w-full min-h-[80vh] will-change-transform touch-pan-y"
          >
            {/* TAB 1: KEMASUKAN DATA */}
            {activeTab === "scan" && (
              <InputTab
                formData={formData}
                setFormData={setFormData}
                fileInputRef={fileInputRef}
                uploadInputRef={uploadInputRef}
                handleOcrScan={handleOcrScan}
                submitTransaction={submitTransaction}
                isProcessing={isProcessing}
                onAddHujan={handleAddHujan}
              />
            )}

            {/* TAB 2: DASHBOARD (Merged Summary + Analytics) */}
            {activeTab === "dashboard" &&
              (authRole === "fc" ||
                authRole === "afc" ||
                authRole === "fs") && (
                <div
                  id="dashboard-tab-container"
                  className="w-full min-h-[70vh]"
                >
                  <motion.div
                    key={`dashboard-${reportType}`}
                    initial={{
                      opacity: 0,
                      x: swipeDirection === "left" ? 30 : -30,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{
                      opacity: 0,
                      x: swipeDirection === "left" ? -30 : 30,
                    }}
                    transition={{ duration: 0.3 }}
                    onPanEnd={(_e, info) => {
                      const threshold = 30; // More sensitive for sub-tabs
                      if (info.offset.x < -threshold) handleSwipe("left");
                      else if (info.offset.x > threshold) handleSwipe("right");
                    }}
                    className="space-y-4 touch-pan-y pb-24"
                  >
                    {/* BAJA & PRUNING SPECIAL VIEWS */}
                    {reportType === "baja" ? (
                      <FertilizerModule
                        authRole={authRole}
                        isDarkMode={isDarkMode}
                      />
                    ) : reportType === "pruning" ? (
                      <PruningModule
                        isDarkMode={isDarkMode}
                        onShowToast={showToast}
                      />
                    ) : (
                      <>
                        {/* HEADER SUMMARY */}
                        <div className="flex flex-col items-center justify-center px-1 mb-4">
                          <h2 className="text-xs font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <LayoutDashboard size={14} />
                            {reportTabs.find((t) => t.id === reportType)
                              ?.label || "Status"}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase">
                              Data Terkini:{" "}
                              {analytics.displayDate
                                ? `${analytics.displayDate.split("-")[2]} ${["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"][parseInt(analytics.displayDate.split("-")[1]) - 1]} ${analytics.displayDate.split("-")[0]}`
                                : new Date().toLocaleDateString("ms-MY")}
                            </p>
                            <div className="w-[1px] h-2 bg-slate-200 dark:bg-slate-800" />
                            <DigitalClock />
                          </div>
                        </div>

                        {/* STATS HERO GRID */}
                        {reportType === "hasil" && (
                          <div className="flex flex-col gap-2 mb-4 mt-2">
                            <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar">
                              {[
                                { id: 'kpi', label: 'KPI Utama', icon: LayoutDashboard },
                                { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
                                { id: 'analitik', label: 'Analitik', icon: BarChart3 },
                                { id: 'abw', label: 'ABW', icon: TrendingUp },
                                { id: 'bbc', label: 'BBC', icon: Package },
                                { id: 'hujan', label: 'Laporan Hujan', icon: CloudRain }
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => {
                                    setActiveHasilTab(tab.id as any);
                                    if (tab.id === 'laporan') setShowFSA13Report(true);
                                  }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all active:scale-95 border ${
                                    activeHasilTab === tab.id 
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <tab.icon size={13} />
                                  {tab.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
      {reportType === "hasil" && activeHasilTab === 'abw' && <AbwView />}
      
      {reportType === "hasil" && activeHasilTab === 'bbc' && <BbcView />}

      {reportType === "hasil" && activeHasilTab === 'hujan' && <LaporanHujanView data={hujanData} />}
      
                        {(reportType !== "hasil" || activeHasilTab === 'kpi') && (
                          <div className="relative pt-3">
                            {/* Overall Section Label Flag Style */}
                            <div className="absolute -top-1.5 left-1 z-10 p-0 pointer-events-none">
                              <div className="bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-md px-1.5 py-0.5 rounded-sm">
                                <p className="text-[6px] font-black text-white uppercase tracking-[0.1em] leading-none">
                                  KESELURUHAN
                                </p>
                              </div>
                            </div>

                          <div className="absolute right-1 -top-1.5 z-10">
                            <button
                              onClick={() =>
                                setShowSummaryCollapsed(!showSummaryCollapsed)
                              }
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                            >
                              <motion.div
                                animate={{
                                  rotate: showSummaryCollapsed ? 0 : 180,
                                }}
                              >
                                <ChevronDown
                                  size={12}
                                  className="text-slate-400"
                                />
                              </motion.div>
                            </button>
                          </div>

                          <AnimatePresence>
                            {!showSummaryCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-3 gap-1 mb-6 px-1">
                                  <ReportSummarySection
                                    type={reportType}
                                    data={analytics.day}
                                    period="day"
                                    isDarkMode={isDarkMode}
                                    mode="hero"
                                  />
                                  <ReportSummarySection
                                    type={reportType}
                                    data={analytics.month}
                                    period="month"
                                    isDarkMode={isDarkMode}
                                    mode="hero"
                                  />
                                  <ReportSummarySection
                                    type={reportType}
                                    data={analytics.year}
                                    period="year"
                                    isDarkMode={isDarkMode}
                                    mode="hero"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                        {/* SUBSECTION DETAILS */}
                        {(reportType !== "hasil" || activeHasilTab === 'kpi') && reportType !== "efb" && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-[24px] border border-slate-200 dark:border-slate-800 mb-4 relative mt-6">
                          {/* OVERALL TITLE FOR THIS SECTION */}
                          {reportType === "muda" && (
                            <div className="absolute -top-3 left-4 z-10 px-3 py-1 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                              BTS MUDA
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="grid grid-cols-3 gap-x-2 mb-2 px-1">
                              <div className="flex items-center gap-1 justify-center opacity-90 pb-1 border-b border-emerald-500/20">
                                <Calendar size={8} className="text-emerald-500" />
                                <h3 className="text-[7px] font-black text-emerald-500 uppercase tracking-widest leading-none">
                                  HARI INI
                                </h3>
                              </div>
                              <div className="flex items-center gap-1 justify-center opacity-90 pb-1 border-b border-emerald-500/20">
                                <Calendar size={8} className="text-emerald-500" />
                                <h3 className="text-[7px] font-black text-emerald-500 uppercase tracking-widest leading-none">
                                  BULAN INI
                                </h3>
                              </div>
                              <div className="flex items-center gap-1 justify-center opacity-90 pb-1 border-b border-emerald-500/20">
                                <Calendar size={8} className="text-emerald-500" />
                                <h3 className="text-[7px] font-black text-emerald-500 uppercase tracking-widest leading-none">
                                  TAHUN INI (YTD)
                                </h3>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-x-2">
                              <ReportSummarySection
                                type={reportType}
                                data={analytics.day}
                                period="day"
                                isDarkMode={isDarkMode}
                                mode="details"
                              />
                              <ReportSummarySection
                                type={reportType}
                                data={analytics.month}
                                period="month"
                                isDarkMode={isDarkMode}
                                mode="details"
                              />
                              <ReportSummarySection
                                type={reportType}
                                data={analytics.year}
                                period="year"
                                isDarkMode={isDarkMode}
                                mode="details"
                              />
                            </div>
                          </div>
                        </div>
                        )}

                        {/* RANKING CARDS - ONLY FOR ANALITIK TAB */}
                        {reportType === "hasil" && activeHasilTab === 'analitik' && (
                          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-md border border-slate-100 dark:border-slate-800 mb-4 relative">
                            <div className={`flex justify-between items-center ${showRankingCollapsed ? "mb-0" : "mb-4"}`}>
                              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                                <TrendingUp size={12} />
                                Blok Performance
                              </h3>
                              <div className="flex items-center gap-1">
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/50 dark:border-white/5 mr-2">
                                  <button
                                    onClick={() => setRankingPeriod("month")}
                                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${rankingPeriod === "month" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                  >
                                    Bulan
                                  </button>
                                  <button
                                    onClick={() => setRankingPeriod("year")}
                                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${rankingPeriod === "year" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                  >
                                    YTD
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    setShowRankingCollapsed(
                                      !showRankingCollapsed,
                                    )
                                  }
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                                >
                                  <motion.div
                                    animate={{
                                      rotate: showRankingCollapsed ? 0 : 180,
                                    }}
                                  >
                                    <ChevronDown
                                      size={14}
                                      className="text-slate-400"
                                    />
                                  </motion.div>
                                </button>
                              </div>
                            </div>
                            <AnimatePresence>
                              {!showRankingCollapsed && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="bg-emerald-500/10 text-emerald-500 py-1.5 text-center rounded-lg">
                                        <p className="text-[8px] font-black uppercase">
                                          Top 5
                                        </p>
                                      </div>
                                      {(
                                        analytics[rankingPeriod].rankedBlok ||
                                        []
                                      )
                                        .slice(0, 5)
                                        .map((b: any, idx: number) => (
                                          <div
                                            key={idx}
                                            className="flex justify-between items-center px-1"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-black text-slate-400 w-3">
                                                {idx + 1}
                                              </span>
                                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                                Blok {b.blok}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-black text-slate-500">
                                                {b.yieldHek.toFixed(2)}
                                              </span>
                                              <span
                                                className={`text-[10px] font-black ${b.targetPct >= 100 ? "text-emerald-500" : "text-amber-500"}`}
                                              >
                                                {Math.round(b.targetPct)}%
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                      <div className="bg-rose-500/10 text-rose-500 py-1.5 text-center rounded-lg">
                                        <p className="text-[8px] font-black uppercase">
                                          Bottom 5
                                        </p>
                                      </div>
                                      {(
                                        analytics[rankingPeriod].rankedBlok ||
                                        []
                                      )
                                        .slice(-5)
                                        .reverse()
                                        .map((b: any, idx: number) => (
                                          <div
                                            key={idx}
                                            className="flex justify-between items-center px-1"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-black text-slate-400 w-3">
                                                {(
                                                  analytics[rankingPeriod]
                                                    .rankedBlok || []
                                                ).length - idx}
                                              </span>
                                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                                Blok {b.blok}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-black text-slate-500">
                                                {b.yieldHek.toFixed(2)}
                                              </span>
                                              <span className="text-[10px] font-black text-rose-500">
                                                {Math.round(b.targetPct)}%
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* TREND ANALYTICS SECTION */}
                        {((reportType === "hasil" && activeHasilTab === 'analitik') || reportType === "muda" || reportType === "efb" || reportType === "kpa_kpg") && (
                              <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-md border border-slate-100 dark:border-slate-800 relative mb-4">
                              <div className={`flex justify-between items-center ${showTrendCollapsed ? "mb-0" : "mb-4"}`}>
                                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                  <BarChart3
                                    size={10}
                                    className="text-emerald-500"
                                  />
                                  {reportType === "muda"
                                    ? `Trend Bulanan BTS Muda ${new Date().getFullYear()}`
                                    : reportType === "efb"
                                      ? `Trend Bulanan EFB ${new Date().getFullYear()}`
                                      : reportType === "kpa_kpg"
                                        ? `Trend Bulanan KPA/KPG ${new Date().getFullYear()}`
                                        : `Trend Bulanan ${new Date().getFullYear()}`}
                                </h3>

                                <div className="flex items-center gap-2">
                                  {reportType === "hasil" && (
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-white/5">
                                      {(
                                        [
                                          "overall",
                                          "pkt1",
                                          "pkt2",
                                          "felda",
                                        ] as const
                                      ).map((v) => (
                                        <button
                                          key={v}
                                          onClick={() =>
                                            setDashboardTrendView(v)
                                          }
                                          className={`px-2 py-1 text-[7px] font-black rounded-md transition-all ${
                                            dashboardTrendView === v
                                              ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm border border-slate-200 dark:border-slate-600"
                                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                          }`}
                                        >
                                          {v === "overall"
                                            ? "ALL"
                                            : v.toUpperCase()}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        setShowTrendCollapsed(
                                          !showTrendCollapsed,
                                        )
                                      }
                                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                                    >
                                      <motion.div
                                        animate={{
                                          rotate: showTrendCollapsed ? 0 : 180,
                                        }}
                                      >
                                        <ChevronDown
                                          size={14}
                                          className="text-slate-400"
                                        />
                                      </motion.div>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <AnimatePresence>
                                {!showTrendCollapsed && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="h-64">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        {(() => {
                                          const dataKey =
                                            reportType === "hasil"
                                              ? dashboardTrendView === "overall"
                                                ? "yield"
                                                : dashboardTrendView === "pkt1"
                                                  ? "pkt1"
                                                  : dashboardTrendView ===
                                                      "pkt2"
                                                    ? "pkt2"
                                                    : "felda"
                                              : reportType === "muda"
                                                ? "muda"
                                                : reportType === "efb"
                                                  ? "efb"
                                                  : "kpg";

                                          const unit =
                                            reportType === "hasil"
                                              ? "T/H"
                                              : reportType === "muda"
                                                ? "Bts"
                                                : reportType === "efb"
                                                  ? "Tan"
                                                  : "Resit";
                                          const label =
                                            reportType === "hasil"
                                              ? "CAPAI"
                                              : reportType === "muda"
                                                ? "Muda"
                                                : reportType === "efb"
                                                  ? "EFB"
                                                  : "KPG Match";

                                          return (
                                            <ComposedChart
                                              data={analytics.monthlyTrend}
                                              margin={{ top: 30, right: 0, left: 0, bottom: 0 }}
                                            >
                                              <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke={
                                                  isDarkMode
                                                    ? "#334155"
                                                    : "#e2e8f0"
                                                }
                                              />
                                              <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                  fontSize: 8,
                                                  fill: "#64748b",
                                                }}
                                              />
                                              <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                  fontSize: 8,
                                                  fill: "#64748b",
                                                }}
                                              />
                                              <Tooltip
                                                contentStyle={{
                                                  borderRadius: "12px",
                                                  border: "none",
                                                  boxShadow:
                                                    "0 10px 15px -3px rgba(0,0,0,0.1)",
                                                  backgroundColor: isDarkMode
                                                    ? "#1e293b"
                                                    : "#ffffff",
                                                  fontSize: "10px",
                                                }}
                                                formatter={(
                                                  value: any,
                                                  name: string,
                                                ) => {
                                                  let displayLabel = label;
                                                  if (
                                                    name.includes("target_2026")
                                                  )
                                                    displayLabel =
                                                      "TARGET 2026";
                                                  else if (
                                                    name.includes("2025")
                                                  )
                                                    displayLabel = "CAPAI 2025";
                                                  return [
                                                    `${value} ${unit}`,
                                                    displayLabel,
                                                  ];
                                                }}
                                              />
                                              <Bar
                                                dataKey={dataKey}
                                                fill={
                                                  reportType === "hasil"
                                                    ? "#10b981"
                                                    : reportType === "muda"
                                                      ? "#f43f5e"
                                                      : "#0ea5e9"
                                                }
                                                radius={[4, 4, 0, 0]}
                                              >
                                                <LabelList
                                                  dataKey={dataKey}
                                                  position="top"
                                                  style={{
                                                    fill: isDarkMode
                                                      ? "#10b981"
                                                      : "#059669",
                                                    fontSize: "8px",
                                                    fontWeight: "bold",
                                                  }}
                                                  formatter={(value: any) =>
                                                    value > 0 ? value : ""
                                                  }
                                                />
                                              </Bar>
                                              {reportType === "hasil" && (
                                                <>
                                                  <Line
                                                    type="monotone"
                                                    dataKey={
                                                      dashboardTrendView ===
                                                      "overall"
                                                        ? "t_h2025"
                                                        : dashboardTrendView ===
                                                            "pkt1"
                                                          ? "t_h2025_pkt1"
                                                          : dashboardTrendView ===
                                                              "pkt2"
                                                            ? "t_h2025_pkt2"
                                                            : dashboardTrendView ===
                                                                "felda"
                                                              ? "t_h2025_felda"
                                                              : "yield2025"
                                                    }
                                                    stroke="#94a3b8"
                                                    strokeDasharray="5 5"
                                                    dot={false}
                                                  />
                                                  <Line
                                                    type="monotone"
                                                    dataKey={
                                                      dashboardTrendView ===
                                                      "overall"
                                                        ? "target_2026"
                                                        : dashboardTrendView ===
                                                            "pkt1"
                                                          ? "target_2026_pkt1"
                                                          : dashboardTrendView ===
                                                              "pkt2"
                                                            ? "target_2026_pkt2"
                                                            : dashboardTrendView ===
                                                                "felda"
                                                              ? "target_2026_felda"
                                                              : "target_2026"
                                                    }
                                                    stroke="#f43f5e"
                                                    strokeDasharray="3 3"
                                                    dot={false}
                                                    strokeWidth={2}
                                                  />
                                                </>
                                              )}
                                              <Legend
                                                verticalAlign="bottom"
                                                height={20}
                                                content={({ payload }) => (
                                                  <div className="flex justify-center flex-wrap gap-x-4 mt-2">
                                                    <div className="flex items-center gap-1">
                                                      <div className={`w-2.5 h-2.5 rounded-sm ${reportType === "hasil" ? "bg-emerald-500" : reportType === "muda" ? "bg-rose-500" : "bg-sky-500"}`} />
                                                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                        {reportType === "hasil" ? "CAPAI 2026" : label.toUpperCase()}
                                                      </span>
                                                    </div>
                                                    {reportType === "hasil" && (
                                                      <>
                                                        <div className="flex items-center gap-1">
                                                          <div className="w-4 h-[1px] bg-slate-400 border-t border-dashed border-slate-400" />
                                                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                            CAPAI 2025
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                          <div className="w-4 h-[1px] bg-rose-500 border-t border-dashed border-rose-500" />
                                                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                            TARGET 2026
                                                          </span>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                )}
                                              />
                                            </ComposedChart>
                                          );
                                        })()}
                                      </ResponsiveContainer>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                      )}

                          {/* LIVE FSA 13 REPORT PREVIEW */}
                          {reportType === "hasil" && activeHasilTab === 'laporan' && (
                            <LaporanView
                              showFSA13Report={showFSA13Report}
                              setShowFSA13Report={setShowFSA13Report}
                              handleCopyReport={handleCopyReport}
                              handleWhatsAppShare={handleWhatsAppShare}
                              showReportDatePicker={showReportDatePicker}
                              dashboardDate={dashboardDate}
                              setDashboardDate={setDashboardDate}
                              executeWhatsAppShare={executeWhatsAppShare}
                              generateRCReport={generateRCReport}
                              tableToCaptureRef={tableToCaptureRef}
                              analytics={analytics}
                              isDarkMode={isDarkMode}
                              captureTableScreenshot={captureTableScreenshot}
                              isCapturing={isCapturing}
                              setShowExportModal={setShowExportModal}
                              handleDownloadPdf={handleDownloadPdf}
                              isDownloadingPdf={isDownloadingPdf}
                              handlePrint={handlePrint}
                            />
                          )}

                        {/* HARGA BTS DAILY REPORT LIST */}
                        {reportType === "harga" && (
                          <div className="space-y-4">
                            {/* HARGA BTS CHARTS */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-md border border-slate-100 dark:border-slate-800">
                              <div className="flex flex-col items-center justify-center mb-2 relative">
                                <div className="flex items-center justify-center gap-2">
                                  <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                                    <TrendingUp
                                      size={12}
                                      className="text-emerald-500"
                                    />
                                    Trend Pergerakan Harga
                                  </h3>
                                </div>
                                <button
                                  onClick={() =>
                                    setShowPriceTrendChart(!showPriceTrendChart)
                                  }
                                  className="absolute right-0 top-0 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                                >
                                  <motion.div
                                    animate={{
                                      rotate: showPriceTrendChart ? 180 : 0,
                                    }}
                                  >
                                    <ChevronDown
                                      size={12}
                                      className="text-slate-400"
                                    />
                                  </motion.div>
                                </button>
                              </div>

                              <AnimatePresence>
                                {showPriceTrendChart && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="grid grid-cols-1 gap-4 mt-2">
                                      {/* Daily Price Movement Chart (Monthly View) */}
                                      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
                                        <div className="bg-[#064E3B] px-3 py-2 flex items-center justify-between">
                                          <h3 className="text-[8px] font-black text-emerald-100 uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp
                                              size={12}
                                              className="text-emerald-400"
                                            />
                                            Analisis Harian (Bulan Semasa)
                                          </h3>
                                          <div className="px-2 py-0.5 bg-black/20 rounded-lg border border-white/10">
                                            <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                                              RM / TAN
                                            </p>
                                          </div>
                                        </div>
                                        <div className="p-4">
                                          <div className="h-40 w-full mb-4">
                                            <ResponsiveContainer
                                              width="100%"
                                              height="100%"
                                            >
                                              <AreaChart
                                                data={analytics.dailyPriceTrend}
                                                margin={{
                                                  top: 10,
                                                  right: 10,
                                                  left: -20,
                                                  bottom: 20,
                                                }}
                                              >
                                                <defs>
                                                  <linearGradient
                                                    id="colorPriceDaily"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                  >
                                                    <stop
                                                      offset="5%"
                                                      stopColor="#10b981"
                                                      stopOpacity={0.3}
                                                    />
                                                    <stop
                                                      offset="95%"
                                                      stopColor="#10b981"
                                                      stopOpacity={0}
                                                    />
                                                  </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                  strokeDasharray="3 3"
                                                  vertical={false}
                                                  stroke={
                                                    isDarkMode
                                                      ? CHART_COLORS.gridDark
                                                      : CHART_COLORS.grid
                                                  }
                                                />
                                                <XAxis
                                                  dataKey="date"
                                                  tickFormatter={(str) =>
                                                    str.split("-")[2]
                                                  }
                                                  tick={{
                                                    fontSize: 8,
                                                    fontWeight: 700,
                                                    fill: CHART_COLORS.gray,
                                                  }}
                                                  axisLine={false}
                                                  tickLine={false}
                                                />
                                                <YAxis
                                                  tick={{
                                                    fontSize: 8,
                                                    fontWeight: 700,
                                                    fill: CHART_COLORS.gray,
                                                  }}
                                                  axisLine={false}
                                                  tickLine={false}
                                                  domain={["auto", "auto"]}
                                                />
                                                <Tooltip
                                                  contentStyle={{
                                                    backgroundColor: isDarkMode
                                                      ? "#1e293b"
                                                      : "#ffffff",
                                                    borderRadius: "12px",
                                                    border: "none",
                                                    boxShadow:
                                                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                                  }}
                                                  labelStyle={{
                                                    fontWeight: 800,
                                                    fontSize: "10px",
                                                    marginBottom: "4px",
                                                    color: "#064E3B",
                                                  }}
                                                  itemStyle={{
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                  }}
                                                  formatter={(value: any) => [
                                                    `RM ${parseFloat(value).toFixed(2)}`,
                                                    "Harga/Tan",
                                                  ]}
                                                />
                                                <Area
                                                  type="monotone"
                                                  dataKey="avgPrice"
                                                  stroke="#10b981"
                                                  strokeWidth={2}
                                                  fillOpacity={1}
                                                  fill="url(#colorPriceDaily)"
                                                  animationDuration={1500}
                                                />
                                                <Brush
                                                  dataKey="date"
                                                  height={15}
                                                  stroke="#10b981"
                                                  fill={
                                                    isDarkMode
                                                      ? "#0f172a"
                                                      : "#f8fafc"
                                                  }
                                                  startIndex={Math.max(
                                                    0,
                                                    analytics.dailyPriceTrend
                                                      .length - 14,
                                                  )}
                                                  tickFormatter={(str) =>
                                                    str.split("-")[2]
                                                  }
                                                />
                                              </AreaChart>
                                            </ResponsiveContainer>
                                          </div>
                                          <div className="text-center px-4">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                                              Pergerakan harga bts harian bagi
                                              bulan semasa.
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Monthly Price Trend Chart (Yearly View) */}
                                      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
                                        <div className="bg-[#064E3B] px-3 py-2 flex items-center justify-between">
                                          <h3 className="text-[8px] font-black text-emerald-100 uppercase tracking-widest flex items-center gap-2">
                                            <BarChart3
                                              size={12}
                                              className="text-emerald-400"
                                            />
                                            Trend Bulanan (Tahunan)
                                          </h3>
                                          <div className="px-2 py-0.5 bg-black/20 rounded-lg border border-white/10">
                                            <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                                              PURATA RM / TAN
                                            </p>
                                          </div>
                                        </div>
                                        <div className="p-4">
                                          <div className="h-40 w-full mb-4">
                                            <ResponsiveContainer
                                              width="100%"
                                              height="100%"
                                            >
                                              <AreaChart
                                                data={analytics.monthlyTrend}
                                                margin={{
                                                  top: 10,
                                                  right: 10,
                                                  left: -25,
                                                  bottom: 20,
                                                }}
                                              >
                                                <defs>
                                                  <linearGradient
                                                    id="colorPriceMonthly"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                  >
                                                    <stop
                                                      offset="5%"
                                                      stopColor="#059669"
                                                      stopOpacity={0.3}
                                                    />
                                                    <stop
                                                      offset="95%"
                                                      stopColor="#059669"
                                                      stopOpacity={0}
                                                    />
                                                  </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                  strokeDasharray="3 3"
                                                  vertical={false}
                                                  stroke={
                                                    isDarkMode
                                                      ? CHART_COLORS.gridDark
                                                      : CHART_COLORS.grid
                                                  }
                                                />
                                                <XAxis
                                                  dataKey="month"
                                                  tick={{
                                                    fontSize: 7,
                                                    fontWeight: 700,
                                                    fill: CHART_COLORS.gray,
                                                  }}
                                                  axisLine={false}
                                                  tickLine={false}
                                                />
                                                <YAxis
                                                  tick={{
                                                    fontSize: 7,
                                                    fontWeight: 700,
                                                    fill: CHART_COLORS.gray,
                                                  }}
                                                  axisLine={false}
                                                  tickLine={false}
                                                  domain={["auto", "auto"]}
                                                />
                                                <Tooltip
                                                  contentStyle={{
                                                    backgroundColor: isDarkMode
                                                      ? "#1e293b"
                                                      : "#ffffff",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    boxShadow:
                                                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    padding: "6px",
                                                  }}
                                                  labelStyle={{
                                                    fontWeight: 800,
                                                    fontSize: "8px",
                                                    marginBottom: "2px",
                                                    color: "#064E3B",
                                                  }}
                                                  itemStyle={{
                                                    fontSize: "8px",
                                                    fontWeight: 600,
                                                  }}
                                                  formatter={(value: any) => [
                                                    `RM ${parseFloat(value).toFixed(2)}`,
                                                    "Purata Harga",
                                                  ]}
                                                />
                                                <Area
                                                  type="monotone"
                                                  dataKey="avgPrice"
                                                  stroke="#059669"
                                                  strokeWidth={1.5}
                                                  fillOpacity={1}
                                                  fill="url(#colorPriceMonthly)"
                                                  animationDuration={1500}
                                                />
                                                <Brush
                                                  dataKey="month"
                                                  height={12}
                                                  stroke="#059669"
                                                  fill={
                                                    isDarkMode
                                                      ? "#0f172a"
                                                      : "#f8fafc"
                                                  }
                                                  travellerWidth={4}
                                                  startIndex={0}
                                                  endIndex={11}
                                                />
                                              </AreaChart>
                                            </ResponsiveContainer>
                                          </div>
                                          <div className="text-center px-4">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                                              Purata harga bts harian bagi tahun
                                              2026.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div
                              id="laporan-harga-bts"
                              className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-md border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-3 relative z-10 gap-2 pr-1">
                                <div className="flex flex-1 items-center justify-center gap-2 pl-8">
                                  <CircleDollarSign
                                    size={14}
                                    className="text-emerald-500"
                                  />
                                  <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest text-center">
                                    Laporan Harga Bts
                                  </h3>
                                </div>
                                <button
                                  onClick={handleShareBtsReport}
                                  disabled={isSharingBts}
                                  className="share-bts-btn text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 p-1.5 rounded-full transition-colors flex-shrink-0 flex items-center justify-center"
                                  title="Kongsi ke WhatsApp"
                                >
                                  {isSharingBts ? (
                                    <Loader2
                                      size={13}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Share2 size={13} />
                                  )}
                                </button>
                              </div>

                              {/* Month Header Above Table Headers */}
                              {analytics.dailyPriceStats &&
                                analytics.dailyPriceStats.length > 0 &&
                                (() => {
                                  const firstRow = analytics.dailyPriceStats[0];
                                  const [year, month] =
                                    firstRow.date.split("-");
                                  const monthNames = [
                                    "Januari",
                                    "Februari",
                                    "Mac",
                                    "April",
                                    "Mei",
                                    "Jun",
                                    "Julai",
                                    "Ogos",
                                    "September",
                                    "Oktober",
                                    "November",
                                    "Disember",
                                  ];
                                  const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;
                                  return (
                                    <div className="px-2 py-2 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                      <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-center">
                                        {monthLabel}
                                      </p>
                                    </div>
                                  );
                                })()}

                              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 w-full custom-scrollbar pb-2">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                      <th className="p-2 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">
                                        Tarikh
                                      </th>
                                      <th className="p-2 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-right whitespace-nowrap">
                                        Harga 1%
                                      </th>
                                      <th className="p-2 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-right whitespace-nowrap">
                                        Harga/Tan
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analytics.dailyPriceStats &&
                                    analytics.dailyPriceStats.length > 0 ? (
                                      analytics.dailyPriceStats.map(
                                        (row: any, idx: number) => {
                                          const currentMonth = row.date.slice(
                                            0,
                                            7,
                                          );
                                          const prevMonth =
                                            idx > 0
                                              ? analytics.dailyPriceStats[
                                                  idx - 1
                                                ].date.slice(0, 7)
                                              : null;
                                          const showMonthHeader =
                                            currentMonth !== prevMonth &&
                                            idx > 0; // Only show for subsequent months if they exist

                                          const monthNames = [
                                            "Januari",
                                            "Februari",
                                            "Mac",
                                            "April",
                                            "Mei",
                                            "Jun",
                                            "Julai",
                                            "Ogos",
                                            "September",
                                            "Oktober",
                                            "November",
                                            "Disember",
                                          ];
                                          const [year, month] =
                                            currentMonth.split("-");
                                          const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

                                          return (
                                            <React.Fragment key={idx}>
                                              {showMonthHeader && (
                                                <tr
                                                  className="bg-slate-100/50 dark:bg-slate-800/80"
                                                  data-month={currentMonth}
                                                >
                                                  <td
                                                    colSpan={3}
                                                    className="p-2 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700"
                                                  >
                                                    {monthLabel}
                                                  </td>
                                                </tr>
                                              )}
                                              <tr
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                                data-month={currentMonth}
                                              >
                                                <td className="p-2 text-[10px] font-bold text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-slate-800/50">
                                                  {parseInt(
                                                    row.date.split("-")[2],
                                                  )}
                                                  hb
                                                </td>
                                                <td className="p-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 text-right border-b border-slate-50 dark:border-slate-800/50">
                                                  RM {row.price1Pct.toFixed(2)}
                                                </td>
                                                <td className="p-2 text-[10px] font-black text-slate-900 dark:text-white text-right border-b border-slate-50 dark:border-slate-800/50">
                                                  RM{" "}
                                                  {(
                                                    row.price1Pct * 21.25
                                                  ).toFixed(2)}
                                                </td>
                                              </tr>
                                            </React.Fragment>
                                          );
                                        },
                                      )
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={3}
                                          className="p-4 text-center text-[10px] font-bold text-slate-400 italic"
                                        >
                                          Tiada data harga tersedia
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHART SECTION: PRESTASI ANALITIK */}
                        {((reportType === "hasil" && activeHasilTab === 'analitik') || 
                          (reportType !== 'hasil' && reportType !== "harga" && reportType !== "baja" && reportType !== "pruning")) && (
                            <div
                              ref={thekChartRef}
                              className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-md border border-slate-100 dark:border-slate-800 relative mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                            >
                              <div className={`flex justify-between items-center ${showThekChart ? "mb-4" : "mb-0"}`}>
                                  <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pl-1">
                                    <BarChart3
                                      size={10}
                                      className="text-emerald-500"
                                    />
                                    PRESTASI BLOK
                                    {chartMetric === "yield"
                                      ? " (THEK)"
                                      : ""} -{" "}
                                    {chartMetric === "yield"
                                      ? "CAPAI"
                                      : chartMetric === "muda"
                                        ? "BTS MUDA"
                                        : chartMetric === "efb"
                                          ? "EFB"
                                          : "KPG=KPA"}
                                  </h3>
                                <motion.button
                                  onClick={() =>
                                    setShowThekChart(!showThekChart)
                                  }
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                                >
                                  <motion.div
                                    animate={{
                                      rotate: showThekChart ? 180 : 0,
                                    }}
                                  >
                                    <ChevronDown
                                      size={12}
                                      className="text-slate-400"
                                    />
                                  </motion.div>
                                </motion.button>
                              </div>

                              <AnimatePresence>
                                {showThekChart && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                      duration: 0.3,
                                      ease: "easeOut",
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <div className="flex flex-col gap-3">
                                      <div className="w-full flex flex-wrap items-center justify-center gap-2 mt-2">
                                        <div className="flex items-center bg-indigo-500/10 p-1 rounded-full backdrop-blur-sm">
                                          <button
                                            onClick={() =>
                                              setThekSortMode(
                                                thekSortMode === "blok"
                                                  ? "desc"
                                                  : thekSortMode === "desc"
                                                    ? "asc"
                                                    : "blok",
                                              )
                                            }
                                            className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest transition-all duration-300 ${thekSortMode !== "blok" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
                                          >
                                            {thekSortMode === "blok"
                                              ? "Blok"
                                              : thekSortMode === "desc"
                                                ? "TINGGI"
                                                : "RENDAH"}
                                          </button>
                                        </div>
                                        <div className="flex bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-full backdrop-blur-sm">
                                          {(
                                            [
                                              "day",
                                              "month",
                                              "year",
                                              "history",
                                            ] as const
                                          )
                                            .filter(
                                              (p) =>
                                                p !== "history" ||
                                                reportType === "hasil",
                                            )
                                            .map((p) => (
                                              <button
                                                key={p}
                                                onClick={() =>
                                                  setChartPeriod(p as any)
                                                }
                                                className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest transition-all duration-300 ${chartPeriod === p ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                                              >
                                                {p === "day"
                                                  ? "HARI INI"
                                                  : p === "month"
                                                    ? "BULAN INI"
                                                    : p === "year"
                                                      ? "TAHUN (YTD)"
                                                      : "TREND"}
                                              </button>
                                            ))}
                                        </div>
                                        {chartPeriod === "history" && (
                                          <div className="flex bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-full backdrop-blur-sm">
                                            {(
                                              [
                                                "overall",
                                                "pkt1",
                                                "pkt2",
                                                "felda",
                                              ] as const
                                            ).map((v) => (
                                              <button
                                                key={v}
                                                onClick={() =>
                                                  setThekHistoryView(v)
                                                }
                                                className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest transition-all duration-300 ${thekHistoryView === v ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                                              >
                                                {v === "overall"
                                                  ? "ALL"
                                                  : v.toUpperCase()}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      {/* Category Switcher removed as it is now synced with reportType */}

                                      {chartPeriod === "history" ? (
                                        <div className="h-56 w-full relative mt-2 flex flex-col">
                                          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                                            <Plus
                                              size={14}
                                              className="text-emerald-500"
                                            />
                                          </div>
                                          {historyChartData.length > 0 ? (
                                            <ResponsiveContainer
                                              width="100%"
                                              height="100%"
                                            >
                                              <AreaChart
                                                data={historyChartData}
                                                margin={{
                                                  top: 20,
                                                  right: 20,
                                                  left: -15,
                                                  bottom: 0,
                                                }}
                                              >
                                                <defs>
                                                  <linearGradient
                                                    id="colorTrend"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                  >
                                                    <stop
                                                      offset="5%"
                                                      stopColor="#10b981"
                                                      stopOpacity={0.4}
                                                    />
                                                    <stop
                                                      offset="95%"
                                                      stopColor="#10b981"
                                                      stopOpacity={0}
                                                    />
                                                  </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                  strokeDasharray="3 3"
                                                  vertical={false}
                                                  stroke={
                                                    isDarkMode
                                                      ? CHART_COLORS.gridDark
                                                      : CHART_COLORS.grid
                                                  }
                                                />
                                                <XAxis
                                                  dataKey="year"
                                                  axisLine={{
                                                    stroke: isDarkMode
                                                      ? "rgba(255,255,255,0.1)"
                                                      : "rgba(0,0,0,0.1)",
                                                  }}
                                                  tickLine={false}
                                                  tick={{
                                                    fontSize: 7,
                                                    fontWeight: 700,
                                                    fill: CHART_COLORS.gray,
                                                  }}
                                                  dy={5}
                                                />
                                                <YAxis
                                                  axisLine={{
                                                    stroke: isDarkMode
                                                      ? "rgba(255,255,255,0.1)"
                                                      : "rgba(0,0,0,0.1)",
                                                  }}
                                                  tickLine={false}
                                                  domain={[0, "auto"]}
                                                  tick={{
                                                    fontSize: 7,
                                                    fontWeight: 700,
                                                    fill: CHART_COLORS.gray,
                                                  }}
                                                />
                                                <Area
                                                  type="monotone"
                                                  dataKey="yield"
                                                  name="CAPAI"
                                                  stroke="#10b981"
                                                  fillOpacity={1}
                                                  fill="url(#colorTrend)"
                                                  strokeWidth={1.5}
                                                  animationDuration={1000}
                                                  activeDot={false}
                                                >
                                                  <LabelList
                                                    dataKey="yield"
                                                    position="top"
                                                    offset={6}
                                                    formatter={(val: number) =>
                                                      val.toFixed(1)
                                                    }
                                                    style={{
                                                      fontSize: "7px",
                                                      fontWeight: 900,
                                                      fill: "#10b981",
                                                      fontFamily: "Inter",
                                                    }}
                                                  />
                                                </Area>
                                                <ReferenceLine
                                                  y={28}
                                                  stroke="#f43f5e"
                                                  strokeDasharray="4 4"
                                                  strokeWidth={1.5}
                                                  label={{
                                                    value: "TARGET",
                                                    position: "insideTopRight",
                                                    fill: "#f43f5e",
                                                    fontSize: 7,
                                                    fontWeight: 900,
                                                    dy: -2,
                                                  }}
                                                />
                                              </AreaChart>
                                            </ResponsiveContainer>
                                          ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                                              <Loader2
                                                className="animate-spin text-emerald-500"
                                                size={24}
                                              />
                                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                                Memproses Data...
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <>
                                          <div
                                            className="h-56 w-full mt-2 cursor-pointer group relative"
                                            onClick={() =>
                                              setIsThekExpanded(true)
                                            }
                                          >
                                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                                              <ScanLine
                                                size={14}
                                                className="text-emerald-500"
                                              />
                                            </div>
                                            <ResponsiveContainer
                                              width="100%"
                                              height="100%"
                                            >
                                              {(() => {
                                                const periodData =
                                                  analytics[chartPeriod];
                                                if (
                                                  !periodData ||
                                                  !periodData.blokStats
                                                )
                                                  return (
                                                    <div className="flex items-center justify-center h-full text-[10px] font-bold text-slate-400">
                                                      Memuatkan data...
                                                    </div>
                                                  );

                                                const chartData = [
                                                  ...periodData.blokStats,
                                                ]
                                                  .filter((d) => {
                                                    const val =
                                                      chartMetric === "yield"
                                                        ? d.yieldHek
                                                        : chartMetric === "muda"
                                                          ? d.muda
                                                          : chartMetric ===
                                                              "efb"
                                                            ? d.efb_tan
                                                            : d.kpg_match_count;
                                                    return (
                                                      !isNaN(val) &&
                                                      !isNaN(parseInt(d.blok))
                                                    );
                                                  })
                                                  .sort((a, b) => {
                                                    if (
                                                      thekSortMode === "desc" ||
                                                      thekSortMode === "asc"
                                                    ) {
                                                      const valA =
                                                        chartMetric === "yield"
                                                          ? a.yieldHek
                                                          : chartMetric ===
                                                              "muda"
                                                            ? a.muda
                                                            : chartMetric ===
                                                                "efb"
                                                              ? a.efb_tan
                                                              : a.kpg_match_count;
                                                      const valB =
                                                        chartMetric === "yield"
                                                          ? b.yieldHek
                                                          : chartMetric ===
                                                              "muda"
                                                            ? b.muda
                                                            : chartMetric ===
                                                                "efb"
                                                              ? b.efb_tan
                                                              : b.kpg_match_count;
                                                      return thekSortMode ===
                                                        "desc"
                                                        ? valB - valA
                                                        : valA - valB;
                                                    }
                                                    return (
                                                      parseInt(a.blok) -
                                                      parseInt(b.blok)
                                                    );
                                                  });

                                                if (chartData.length === 0)
                                                  return (
                                                    <div className="flex items-center justify-center h-full text-[10px] font-bold text-slate-400">
                                                      Tiada data untuk
                                                      dipaparkan.
                                                    </div>
                                                  );

                                                const values = chartData.map(
                                                  (d) =>
                                                    chartMetric === "yield"
                                                      ? d.yieldHek
                                                      : chartMetric === "muda"
                                                        ? d.muda
                                                        : chartMetric === "efb"
                                                          ? d.efb_tan
                                                          : d.kpg_match_count,
                                                );
                                                const maxValue = Math.max(
                                                  ...values,
                                                );
                                                const minValue = Math.min(
                                                  ...values.filter(
                                                    (v) => v > 0,
                                                  ),
                                                ); // Only non-zero min

                                                return (
                                                  <ComposedChart
                                                    data={chartData}
                                                    margin={{
                                                      top: 35,
                                                      right: 10,
                                                      left: -25,
                                                      bottom: 0,
                                                    }}
                                                  >
                                                    <CartesianGrid
                                                      strokeDasharray="3 3"
                                                      vertical={false}
                                                      stroke={
                                                        isDarkMode
                                                          ? CHART_COLORS.gridDark
                                                          : CHART_COLORS.grid
                                                      }
                                                    />
                                                    <XAxis
                                                      dataKey="blok"
                                                      interval={0}
                                                      axisLine={{
                                                        stroke: isDarkMode
                                                          ? "rgba(255,255,255,0.1)"
                                                          : "rgba(0,0,0,0.1)",
                                                      }}
                                                      tickLine={false}
                                                      tick={{
                                                        fontSize: 8,
                                                        fontWeight: 700,
                                                        fill: CHART_COLORS.gray,
                                                      }}
                                                      dy={5}
                                                    />
                                                    <YAxis
                                                      axisLine={{
                                                        stroke: isDarkMode
                                                          ? "rgba(255,255,255,0.1)"
                                                          : "rgba(0,0,0,0.1)",
                                                      }}
                                                      tick={{
                                                        fontSize: 8,
                                                        fontWeight: 700,
                                                        fill: CHART_COLORS.gray,
                                                      }}
                                                      domain={[0, "auto"]}
                                                    />
                                                    {chartMetric !== "muda" && (
                                                      <Tooltip
                                                        cursor={{
                                                          fill: isDarkMode
                                                            ? "rgba(255,255,255,0.05)"
                                                            : "rgba(0,0,0,0.02)",
                                                        }}
                                                        content={({
                                                          active,
                                                          payload,
                                                        }) => {
                                                          if (
                                                            active &&
                                                            payload &&
                                                            payload.length
                                                          ) {
                                                            const data =
                                                              payload[0]
                                                                ?.payload;
                                                            if (!data)
                                                              return null;
                                                            const val =
                                                              chartMetric ===
                                                              "yield"
                                                                ? data.yieldHek
                                                                : chartMetric ===
                                                                    "muda"
                                                                  ? data.muda
                                                                  : chartMetric ===
                                                                      "efb"
                                                                    ? data.efb_tan
                                                                    : data.kpg_match_count;
                                                            const target =
                                                              data.targetHek;
                                                            const unit =
                                                              chartMetric ===
                                                              "yield"
                                                                ? "T/H"
                                                                : chartMetric ===
                                                                    "muda"
                                                                  ? "Bts"
                                                                  : chartMetric ===
                                                                      "efb"
                                                                    ? "Tan"
                                                                    : "Resit";
                                                            const label =
                                                              chartMetric ===
                                                              "yield"
                                                                ? "CAPAI"
                                                                : chartMetric ===
                                                                    "muda"
                                                                  ? "Muda"
                                                                  : chartMetric ===
                                                                      "efb"
                                                                    ? "EFB"
                                                                    : "KPG Match";

                                                            const isMax =
                                                              val ===
                                                                maxValue &&
                                                              val > 0;
                                                            const isMin =
                                                              val ===
                                                                minValue &&
                                                              val > 0;

                                                            return (
                                                              <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
                                                                <div className="flex justify-between items-center mb-1 gap-4">
                                                                  <p className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                                    Blok{" "}
                                                                    {data.blok}
                                                                  </p>
                                                                  {isMax && (
                                                                    <span className="text-[6px] font-black bg-emerald-500 text-white px-1 rounded">
                                                                      MAX
                                                                    </span>
                                                                  )}
                                                                  {isMin && (
                                                                    <span className="text-[6px] font-black bg-rose-500 text-white px-1 rounded">
                                                                      MIN
                                                                    </span>
                                                                  )}
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                  <div className="flex items-center gap-1.5">
                                                                    <div
                                                                      className="w-1.5 h-1.5 rounded-full"
                                                                      style={{
                                                                        backgroundColor:
                                                                          CHART_COLORS.blue,
                                                                      }}
                                                                    />
                                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                                                      {label}:{" "}
                                                                      {(
                                                                        val || 0
                                                                      ).toFixed(
                                                                        chartMetric ===
                                                                          "yield"
                                                                          ? 2
                                                                          : 0,
                                                                      )}{" "}
                                                                      <span className="text-[8px] font-normal opacity-60">
                                                                        {unit}
                                                                      </span>
                                                                    </p>
                                                                  </div>
                                                                  {chartMetric ===
                                                                    "yield" && (
                                                                    <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-700 pt-1 mt-0.5">
                                                                      <div
                                                                        className="w-1.5 h-1.5 rounded-full"
                                                                        style={{
                                                                          backgroundColor:
                                                                            CHART_COLORS.orange,
                                                                        }}
                                                                      />
                                                                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                                        Target:{" "}
                                                                        {(
                                                                          target ||
                                                                          0
                                                                        ).toFixed(
                                                                          2,
                                                                        )}{" "}
                                                                        <span className="text-[8px] font-normal opacity-60">
                                                                          T/H
                                                                        </span>
                                                                      </p>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            );
                                                          }
                                                          return null;
                                                        }}
                                                      />
                                                    )}
                                                    <Bar
                                                      dataKey={
                                                        chartMetric === "yield"
                                                          ? "yieldHek"
                                                          : chartMetric ===
                                                              "muda"
                                                            ? "muda"
                                                            : chartMetric ===
                                                                "efb"
                                                              ? "efb_tan"
                                                              : "kpg_match_count"
                                                      }
                                                      radius={[2, 2, 0, 0]}
                                                      animationDuration={1200}
                                                      activeBar={{
                                                        fillOpacity: 0.8,
                                                        stroke: isDarkMode
                                                          ? "#fff"
                                                          : "#000",
                                                        strokeWidth: 1,
                                                      }}
                                                    >
                                                      {chartData.map(
                                                        (entry, index) => {
                                                          const val =
                                                            chartMetric ===
                                                            "yield"
                                                              ? entry.yieldHek
                                                              : chartMetric ===
                                                                  "muda"
                                                                ? entry.muda
                                                                : chartMetric ===
                                                                    "efb"
                                                                  ? entry.efb_tan
                                                                  : entry.kpg_match_count;
                                                          let color =
                                                            chartMetric ===
                                                            "yield"
                                                              ? CHART_COLORS.green
                                                              : chartMetric ===
                                                                  "muda"
                                                                ? "#f43f5e"
                                                                : chartMetric ===
                                                                    "efb"
                                                                  ? "#8b5cf6"
                                                                  : "#0ea5e9";
                                                          const maxColor =
                                                            chartMetric ===
                                                            "yield"
                                                              ? "#059669"
                                                              : chartMetric ===
                                                                  "muda"
                                                                ? "#e11d48"
                                                                : chartMetric ===
                                                                    "efb"
                                                                  ? "#7c3aed"
                                                                  : "#0284c7";
                                                          if (
                                                            val === maxValue &&
                                                            val > 0
                                                          )
                                                            color = maxColor;
                                                          if (
                                                            val === minValue &&
                                                            val > 0
                                                          )
                                                            color = "#e11d48"; // Keep rose for min
                                                          return (
                                                            <Cell
                                                              key={`cell-${index}`}
                                                              fill={color}
                                                            />
                                                          );
                                                        },
                                                      )}
                                                      <LabelList
                                                        dataKey={
                                                          chartMetric ===
                                                          "yield"
                                                            ? "yieldHek"
                                                            : chartMetric ===
                                                                "muda"
                                                              ? "muda"
                                                              : chartMetric ===
                                                                  "efb"
                                                                ? "efb_tan"
                                                                : "kpg_match_count"
                                                        }
                                                        position="top"
                                                        offset={4}
                                                        formatter={(
                                                          val: number,
                                                        ) => {
                                                          if (val <= 0)
                                                            return "";
                                                          let text =
                                                            chartMetric ===
                                                            "yield"
                                                              ? val.toFixed(1)
                                                              : chartMetric ===
                                                                  "efb"
                                                                ? val.toFixed(1)
                                                                : val.toString();
                                                          if (
                                                            val === maxValue &&
                                                            val > 0
                                                          )
                                                            return `▲ ${text}`;
                                                          if (
                                                            val === minValue &&
                                                            val > 0
                                                          )
                                                            return `▼ ${text}`;
                                                          return text;
                                                        }}
                                                        style={{
                                                          fontSize: "6px",
                                                          fontWeight: "900",
                                                          fill: CHART_COLORS.gray,
                                                        }}
                                                      />
                                                    </Bar>
                                                    {chartMetric ===
                                                      "yield" && (
                                                      <Line
                                                        type="monotone"
                                                        dataKey="targetHek"
                                                        stroke="#fbbf24"
                                                        strokeWidth={3}
                                                        dot={{
                                                          r: 4,
                                                          fill: "#fbbf24",
                                                          strokeWidth: 0,
                                                        }}
                                                        activeDot={{ r: 5 }}
                                                        strokeDasharray="3 3"
                                                      />
                                                    )}
                                                  </ComposedChart>
                                                );
                                              })()}
                                            </ResponsiveContainer>
                                          </div>

                                          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                            <div className="flex items-center gap-2">
                                              <div
                                                className="w-2.5 h-2.5 rounded-full shadow-lg"
                                                style={{
                                                  backgroundColor:
                                                    CHART_COLORS.green,
                                                }}
                                              />
                                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                                                PENCAPAIAN
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div
                                                className="w-2.5 h-2.5 rounded-full shadow-lg"
                                                style={{
                                                  backgroundColor:
                                                    CHART_COLORS.orange,
                                                }}
                                              />
                                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                                                SASARAN
                                              </span>
                                            </div>
                                          </div>

                                          {/* --- NEW PIE CHART SECTION --- */}
                                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="w-0.5 h-3 bg-indigo-500 rounded-full" />
                                              <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                Pecahan CAPAI
                                              </p>
                                            </div>
                                            <div
                                              className="h-48 w-full cursor-pointer group relative"
                                              onClick={() =>
                                                setIsPieExpanded(true)
                                              }
                                            >
                                              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                                                <ScanLine
                                                  size={14}
                                                  className="text-emerald-500"
                                                />
                                              </div>
                                              <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                              >
                                                <PieChart>
                                                  <Pie
                                                    data={[
                                                      {
                                                        name: "PKT 1",
                                                        value:
                                                          analytics.month
                                                            ?.pkt1_tan || 0,
                                                      },
                                                      {
                                                        name: "PKT 2",
                                                        value:
                                                          analytics.month
                                                            ?.pkt2_tan || 0,
                                                      },
                                                      {
                                                        name: "FELDA",
                                                        value:
                                                          analytics.month
                                                            ?.felda_tan || 0,
                                                      },
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={35}
                                                    outerRadius={55}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    label={({
                                                      name,
                                                      percent,
                                                    }) =>
                                                      `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    labelLine={false}
                                                    style={{
                                                      fontSize: "8px",
                                                      fontWeight: "900",
                                                      fill: isDarkMode
                                                        ? "#cbd5e1"
                                                        : "#475569",
                                                    }}
                                                    isAnimationActive={true}
                                                    animationBegin={400}
                                                    animationDuration={1500}
                                                  >
                                                    <Cell
                                                      fill={CHART_COLORS.blue}
                                                    />
                                                    <Cell
                                                      fill={CHART_COLORS.orange}
                                                    />
                                                    <Cell
                                                      fill={CHART_COLORS.green}
                                                    />
                                                  </Pie>
                                                  <Tooltip
                                                    contentStyle={{
                                                      backgroundColor:
                                                        isDarkMode
                                                          ? "#1e293b"
                                                          : "#ffffff",
                                                      borderRadius: "8px",
                                                      border: "none",
                                                      boxShadow:
                                                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                                      padding: "8px",
                                                    }}
                                                    itemStyle={{
                                                      fontSize: "10px",
                                                      fontWeight: 600,
                                                    }}
                                                  />
                                                  <Legend
                                                    verticalAlign="bottom"
                                                    height={24}
                                                    iconType="circle"
                                                    iconSize={8}
                                                    formatter={(value) => (
                                                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider ml-1.5">
                                                        {value}
                                                      </span>
                                                    )}
                                                  />
                                                </PieChart>
                                              </ResponsiveContainer>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                        {/* Togol Ranking */}
                        {((reportType === "hasil" && activeHasilTab === 'analitik') || 
                          (reportType !== "hasil" && reportType !== "harga" && reportType !== "efb" && reportType !== "pruning")) && (
                            <>
                              <div className="flex flex-col gap-1 px-1 mt-2">
                                <div className="flex justify-between items-center">
                                  <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Prestasi Blok
                                  </h2>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowRanking(!showRanking)}
                                    className={`text-[10px] font-black px-4 py-2 rounded-full border shadow-lg flex gap-2 items-center transition-all duration-500 ${showRanking ? "bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"}`}
                                  >
                                    {showRanking ? (
                                      <Trophy
                                        size={14}
                                        className="text-amber-400"
                                      />
                                    ) : (
                                      <LayoutDashboard size={14} />
                                    )}
                                    {showRanking
                                      ? "Ranking Aktif"
                                      : "Lihat Ranking"}
                                  </motion.button>
                                </div>

                                <AnimatePresence>
                                  {showRanking && (
                                    <motion.div
                                      initial={{
                                        opacity: 0,
                                        y: -20,
                                        scale: 0.8,
                                        filter: "blur(15px)",
                                      }}
                                      animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        filter: "blur(0px)",
                                      }}
                                      exit={{
                                        opacity: 0,
                                        y: -20,
                                        scale: 0.8,
                                        filter: "blur(15px)",
                                      }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 28,
                                      }}
                                      className="flex bg-slate-200/40 dark:bg-slate-800/40 backdrop-blur-md p-1.5 rounded-[22px] self-end shadow-inner border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden"
                                    >
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          setRankingPeriod("month")
                                        }
                                        className={`relative px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 z-10 ${rankingPeriod === "month" ? "text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"}`}
                                      >
                                        {rankingPeriod === "month" && (
                                          <motion.div
                                            layoutId="activePeriod"
                                            className="absolute inset-0 bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)] rounded-xl -z-10"
                                            transition={{
                                              type: "spring",
                                              stiffness: 400,
                                              damping: 30,
                                            }}
                                          />
                                        )}
                                        Bulan
                                      </motion.button>
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setRankingPeriod("year")}
                                        className={`relative px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 z-10 ${rankingPeriod === "year" ? "text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"}`}
                                      >
                                        {rankingPeriod === "year" && (
                                          <motion.div
                                            layoutId="activePeriod"
                                            className="absolute inset-0 bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)] rounded-xl -z-10"
                                            transition={{
                                              type: "spring",
                                              stiffness: 400,
                                              damping: 30,
                                            }}
                                          />
                                        )}
                                        Tahun
                                      </motion.button>
                                      {reportType === "hasil" && (
                                        <motion.button
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() =>
                                            setRankingPeriod("yoy")
                                          }
                                          className={`relative px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 z-10 ${rankingPeriod === "yoy" ? "text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"}`}
                                        >
                                          {rankingPeriod === "yoy" && (
                                            <motion.div
                                              layoutId="activePeriod"
                                              className="absolute inset-0 bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.4)] rounded-xl -z-10"
                                              transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 30,
                                              }}
                                            />
                                          )}
                                          YOY
                                        </motion.button>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Senarai Blok / Ranking (Layout 3-Tempoh Bersebelahan) */}
                              <motion.div
                                layout
                                className={`transition-all duration-500 ${showRanking ? "bg-white dark:bg-slate-900 rounded-[32px] p-2 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-0" : "space-y-1"}`}
                                variants={{
                                  show: {
                                    transition: {
                                      staggerChildren: 0.04,
                                      delayChildren: 0.02,
                                    },
                                  },
                                }}
                                initial="hidden"
                                animate="show"
                              >
                                <div className="relative">
                                  <div className="flex items-center gap-2 px-1 pb-2 pt-1 mb-1 relative z-10">
                                    <div className="w-7 shrink-0 text-center">
                                      <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        {showRanking ? "#" : "Blok"}
                                      </span>
                                    </div>
                                    <div
                                      className={`flex-1 grid gap-1 ${showRanking && reportType === "hasil" ? "grid-cols-5" : "grid-cols-4"}`}
                                    >
                                      <div className="col-span-1 text-left">
                                        <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                                          {showRanking ? "Blok" : "Lot"}
                                        </span>
                                      </div>
                                      <div className="text-center">
                                        <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                          Hari Ini
                                        </span>
                                      </div>
                                      <div className="text-center">
                                        <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                          Bulan Ini
                                        </span>
                                      </div>
                                      <div className="text-center">
                                        <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                          Tahun (YTD)
                                        </span>
                                      </div>
                                      {showRanking &&
                                        reportType === "hasil" && (
                                          <div
                                            className={`text-center border-l transition-all duration-300 pl-1 ${rankingPeriod === "yoy" ? "bg-blue-500/10 dark:bg-blue-500/20 rounded-md border-blue-500/30" : "border-emerald-100/50 dark:border-slate-800"}`}
                                          >
                                            <span
                                              className={`text-[7px] font-black uppercase tracking-widest ${rankingPeriod === "yoy" ? "text-blue-500" : "text-emerald-500"}`}
                                            >
                                              YOY
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                </div>
                                <AnimatePresence
                                  mode="popLayout"
                                  initial={false}
                                >
                                  {(
                                    (showRanking
                                      ? analytics[
                                          rankingPeriod === "yoy"
                                            ? "yoy"
                                            : rankingPeriod
                                        ] || analytics.month
                                      : analytics.month
                                    )?.rankedBlok || []
                                  ).map((s, index) => {
                                    if (s.tan === 0 && !showRanking)
                                      return null;

                                    // Get corresponding data for Today, Month, and Year
                                    const todayBlok =
                                      analytics.day?.blokStats?.find(
                                        (b) => b.blok === s.blok,
                                      );
                                    const monthBlok =
                                      analytics.month?.blokStats?.find(
                                        (b) => b.blok === s.blok,
                                      );
                                    const yearBlok =
                                      analytics.year?.blokStats?.find(
                                        (b) => b.blok === s.blok,
                                      );

                                    const getTarget = (
                                      pkt: string,
                                      period: "day" | "month" | "year",
                                    ) => {
                                      const targets =
                                        MONTHLY_TARGETS_2026[pkt] || [];
                                      const now = new Date(
                                        new Date().getTime() +
                                          8 * 60 * 60 * 1000,
                                      );
                                      const monthIdx = now.getMonth();
                                      const currentDay = now.getDate();
                                      const daysInMonth = new Date(
                                        now.getFullYear(),
                                        monthIdx + 1,
                                        0,
                                      ).getDate();

                                      if (period === "day")
                                        return (
                                          (targets[monthIdx] || 0) / daysInMonth
                                        );
                                      if (period === "month")
                                        return targets[monthIdx] || 0;
                                      if (period === "year") {
                                        const sumPrevMonths = targets
                                          .slice(0, monthIdx)
                                          .reduce((a, b) => a + b, 0);
                                        const partialMonth =
                                          (targets[monthIdx] || 0) *
                                          (currentDay / daysInMonth);
                                        return sumPrevMonths + partialMonth;
                                      }
                                      return 0;
                                    };

                                    const targetDay = getTarget(s.pkt, "day");
                                    const targetMonth = getTarget(
                                      s.pkt,
                                      "month",
                                    );
                                    const targetYear = getTarget(s.pkt, "year");

                                    const pctDay =
                                      targetDay > 0
                                        ? ((todayBlok?.yieldHek || 0) /
                                            targetDay) *
                                          100
                                        : 0;
                                    const pctMonth =
                                      targetMonth > 0
                                        ? ((monthBlok?.yieldHek || 0) /
                                            targetMonth) *
                                          100
                                        : 0;
                                    const pctYear =
                                      targetYear > 0
                                        ? ((yearBlok?.yieldHek || 0) /
                                            targetYear) *
                                          100
                                        : 0;

                                    // KPI Color Logic (Based on Month)
                                    let kpiColorClass =
                                      "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500";
                                    if (reportType === "muda") {
                                      if (s.muda < 20)
                                        kpiColorClass =
                                          "bg-emerald-500 text-white shadow-md shadow-emerald-500/20";
                                      else if (s.muda <= 30)
                                        kpiColorClass =
                                          "bg-amber-500 text-white shadow-md shadow-amber-500/20";
                                      else
                                        kpiColorClass =
                                          "bg-rose-500 text-white shadow-md shadow-rose-500/20";
                                    } else if (reportType === "kpa_kpg") {
                                      if (s.kpg_match_count >= 5)
                                        kpiColorClass =
                                          "bg-emerald-500 text-white shadow-md shadow-emerald-500/20";
                                      else if (s.kpg_match_count >= 3)
                                        kpiColorClass =
                                          "bg-amber-500 text-white shadow-md shadow-amber-500/20";
                                      else
                                        kpiColorClass =
                                          "bg-rose-500 text-white shadow-md shadow-rose-500/20";
                                    } else if (reportType === "hasil") {
                                      if (s.progress_pct >= 90)
                                        kpiColorClass =
                                          "bg-emerald-500 text-white shadow-md shadow-emerald-500/20";
                                      else if (s.progress_pct >= 80)
                                        kpiColorClass =
                                          "bg-amber-500 text-white shadow-md shadow-amber-500/20";
                                      else
                                        kpiColorClass =
                                          "bg-rose-500 text-white shadow-md shadow-rose-500/20";
                                    }

                                    return (
                                      <motion.div
                                        layout
                                        key={s.blok}
                                        variants={{
                                          hidden: {
                                            opacity: 0,
                                            y: 30,
                                            scale: 0.85,
                                            filter: "blur(10px)",
                                          },
                                          show: {
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            filter: "blur(0px)",
                                          },
                                        }}
                                        initial="hidden"
                                        animate="show"
                                        exit={{
                                          opacity: 0,
                                          scale: 0.8,
                                          filter: "blur(15px)",
                                          transition: { duration: 0.2 },
                                        }}
                                        transition={{
                                          layout: {
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 30,
                                            mass: 1,
                                          },
                                          opacity: {
                                            duration: 0.5,
                                            ease: "circOut",
                                          },
                                          y: {
                                            type: "spring",
                                            stiffness: 450,
                                            damping: 30,
                                          },
                                        }}
                                        whileHover={{
                                          scale: 1.01,
                                          y: -0.5,
                                          transition: { duration: 0.2 },
                                        }}
                                        className="bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 relative overflow-hidden"
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/20 -z-10" />
                                        <div className="flex items-center gap-2">
                                          {/* Rank / Indicator */}
                                          <motion.div
                                            layout="position"
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-105 shadow-inner ${kpiColorClass}`}
                                          >
                                            <AnimatePresence mode="wait">
                                              <motion.span
                                                key={`blok-${s.blok}`}
                                                initial={{
                                                  y: 15,
                                                  opacity: 0,
                                                  rotateX: -90,
                                                  scale: 0.5,
                                                }}
                                                animate={{
                                                  y: 0,
                                                  opacity: 1,
                                                  rotateX: 0,
                                                  scale: 1,
                                                }}
                                                exit={{
                                                  y: -15,
                                                  opacity: 0,
                                                  rotateX: 90,
                                                  scale: 0.5,
                                                }}
                                                transition={{
                                                  type: "spring",
                                                  stiffness: 900,
                                                  damping: 25,
                                                }}
                                              >
                                                {showRanking
                                                  ? index + 1
                                                  : s.blok}
                                              </motion.span>
                                            </AnimatePresence>
                                          </motion.div>

                                          {/* Data Utama - Layout Asal */}
                                          <div
                                            className={`flex-1 grid gap-1 items-center ${showRanking && reportType === "hasil" ? "grid-cols-5" : "grid-cols-4"}`}
                                          >
                                            <div className="col-span-1">
                                              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none">
                                                {s.blok}
                                              </p>
                                              <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-0.5">
                                                {s.pkt === "003"
                                                  ? "Lot"
                                                  : `PKT ${s.pkt === "001" ? "1" : "2"}`}
                                              </p>
                                            </div>

                                            {/* HARI */}
                                            <div className="text-center border-l border-slate-50 dark:border-slate-800 pl-0.5">
                                              {reportType === "hasil" && (
                                                <>
                                                  <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 leading-none">
                                                    {(
                                                      todayBlok?.yieldHek || 0
                                                    ).toFixed(2)}
                                                  </p>
                                                  <div className="flex justify-center items-center gap-1 mt-0.5">
                                                    <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                                      {todayBlok?.tan.toFixed(
                                                        1,
                                                      )}{" "}
                                                      Tan
                                                    </p>
                                                  </div>
                                                  <p
                                                    className={`text-[7px] font-black mt-0.5 ${pctDay >= 100 ? "text-emerald-500" : "text-amber-500"}`}
                                                  >
                                                    {pctDay.toFixed(0)}%
                                                  </p>
                                                </>
                                              )}
                                              {reportType === "muda" && (
                                                <div className="flex flex-col items-center">
                                                  <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 leading-none">
                                                    {todayBlok?.muda || 0}
                                                  </p>
                                                </div>
                                              )}
                                              {reportType === "kpa_kpg" && (
                                                <div className="flex flex-col items-center">
                                                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 leading-none">
                                                    {todayBlok?.kpg_match_count ||
                                                      0}
                                                  </p>
                                                  <p className="text-[7px] font-black text-emerald-500 mt-0.5">
                                                    {todayBlok?.resit_count
                                                      ? Math.round(
                                                          ((todayBlok.kpg_match_count ||
                                                            0) /
                                                            todayBlok.resit_count) *
                                                            100,
                                                        )
                                                      : 0}
                                                    %
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            {/* BULAN */}
                                            <div
                                              className={`text-center border-l border-slate-50 dark:border-slate-800 pl-0.5 transition-all duration-500 rounded-lg ${rankingPeriod === "month" && showRanking ? "bg-emerald-500/10 dark:bg-emerald-500/20 z-20 pb-1 pt-0.5 shadow-sm border border-emerald-500/20" : ""}`}
                                            >
                                              {reportType === "hasil" && (
                                                <>
                                                  <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 leading-none">
                                                    {(
                                                      monthBlok?.yieldHek || 0
                                                    ).toFixed(2)}
                                                  </p>
                                                  <div className="flex justify-center items-center gap-1 mt-0.5">
                                                    <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                                      {monthBlok?.tan.toFixed(
                                                        1,
                                                      )}{" "}
                                                      Tan
                                                    </p>
                                                  </div>
                                                  <p
                                                    className={`text-[7px] font-black mt-0.5 ${pctMonth >= 100 ? "text-emerald-500" : "text-amber-500"}`}
                                                  >
                                                    {pctMonth.toFixed(0)}%
                                                  </p>
                                                </>
                                              )}
                                              {reportType === "muda" && (
                                                <div className="flex flex-col items-center">
                                                  <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 leading-none">
                                                    {monthBlok?.muda || 0}
                                                  </p>
                                                </div>
                                              )}
                                              {reportType === "kpa_kpg" && (
                                                <div className="flex flex-col items-center">
                                                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 leading-none">
                                                    {monthBlok?.kpg_match_count ||
                                                      0}
                                                  </p>
                                                  <p className="text-[7px] font-black text-emerald-500 mt-0.5">
                                                    {monthBlok?.resit_count
                                                      ? Math.round(
                                                          ((monthBlok.kpg_match_count ||
                                                            0) /
                                                            monthBlok.resit_count) *
                                                            100,
                                                        )
                                                      : 0}
                                                    %
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            {/* TAHUN */}
                                            <div
                                              className={`text-center border-l border-slate-50 dark:border-slate-800 pl-0.5 transition-all duration-500 rounded-lg ${rankingPeriod === "year" && showRanking ? "bg-emerald-500/10 dark:bg-emerald-500/20 z-20 pb-1 pt-0.5 shadow-sm border border-emerald-500/20" : ""}`}
                                            >
                                              {reportType === "hasil" && (
                                                <div className="flex flex-col h-full justify-between">
                                                  <div>
                                                    <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 leading-none">
                                                      {(
                                                        yearBlok?.yieldHek || 0
                                                      ).toFixed(2)}
                                                    </p>
                                                    <div className="flex justify-center items-center gap-1 mt-0.5">
                                                      <p className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                                        {yearBlok?.tan.toFixed(
                                                          1,
                                                        )}{" "}
                                                        Tan
                                                      </p>
                                                    </div>
                                                    <p
                                                      className={`text-[7px] font-black mt-0.5 ${pctYear >= 100 ? "text-emerald-500" : "text-amber-500"}`}
                                                    >
                                                      {pctYear.toFixed(0)}%
                                                    </p>
                                                  </div>
                                                </div>
                                              )}
                                              {reportType === "muda" && (
                                                <div className="flex flex-col items-center">
                                                  <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 leading-none">
                                                    {yearBlok?.muda || 0}
                                                  </p>
                                                </div>
                                              )}
                                              {reportType === "kpa_kpg" && (
                                                <div className="flex flex-col items-center">
                                                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 leading-none">
                                                    {yearBlok?.kpg_match_count ||
                                                      0}
                                                  </p>
                                                  <p className="text-[7px] font-black text-emerald-500 mt-0.5">
                                                    {yearBlok?.resit_count
                                                      ? Math.round(
                                                          ((yearBlok.kpg_match_count ||
                                                            0) /
                                                            yearBlok.resit_count) *
                                                            100,
                                                        )
                                                      : 0}
                                                    %
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            {/* YOY Info (Column 5 - Only for CAPAI Ranking) */}
                                            {showRanking &&
                                              reportType === "hasil" && (
                                                <div
                                                  className={`text-center border-l transition-all duration-500 rounded-lg pl-1 pt-0.5 ${rankingPeriod === "yoy" ? "bg-blue-500/10 dark:bg-blue-500/20 z-20 pb-1 border-blue-500/30" : "border-emerald-100 dark:border-emerald-900/40"}`}
                                                >
                                                  <div className="flex flex-col items-center">
                                                    <span
                                                      className={`text-[10px] font-black ${rankingPeriod === "yoy" ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}
                                                    >
                                                      {(
                                                        ((yearBlok as any)
                                                          ?.ytd_2025_tan || 0) /
                                                        s.luas
                                                      ).toFixed(2)}
                                                    </span>
                                                    <div
                                                      className={`flex items-center gap-0.5 mt-0.5 ${(yearBlok?.yieldHek || 0) - ((yearBlok as any)?.ytd_2025_tan || 0) / s.luas >= 0 ? "text-emerald-500 font-black" : "text-rose-500 font-black"}`}
                                                    >
                                                      <span className="text-[9px]">
                                                        {(
                                                          (yearBlok?.yieldHek ||
                                                            0) -
                                                          ((yearBlok as any)
                                                            ?.ytd_2025_tan ||
                                                            0) /
                                                            s.luas
                                                        ).toFixed(2)}
                                                      </span>
                                                      {(yearBlok?.yieldHek ||
                                                        0) -
                                                        ((yearBlok as any)
                                                          ?.ytd_2025_tan || 0) /
                                                          s.luas >=
                                                      0 ? (
                                                        <TrendingUp size={10} />
                                                      ) : (
                                                        <TrendingDown
                                                          size={10}
                                                        />
                                                      )}
                                                    </div>
                                                    <div
                                                      className={`text-[8px] font-black mt-1 px-1.5 py-0.5 rounded-full ${((yearBlok as any)?.yoy_diff_pct || 0) >= 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"}`}
                                                    >
                                                      {((yearBlok as any)
                                                        ?.yoy_diff_pct || 0) >=
                                                      0
                                                        ? "+"
                                                        : ""}
                                                      {(
                                                        (yearBlok as any)
                                                          ?.yoy_diff_pct || 0
                                                      ).toFixed(1)}
                                                      %
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </AnimatePresence>
                              </motion.div>
                            </>
                          )}
                      </>
                    )}
                  </motion.div>
                </div>
              )}

            {/* TAB 3: SEJARAH DATA */}
            {activeTab === "sejarah" && (
              <SejarahTab
                historyFilterDate={historyFilterDate}
                setHistoryFilterDate={setHistoryFilterDate}
                setShowExportModal={setShowExportModal}
                rawData={rawData}
                setRecordToDelete={setRecordToDelete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- MENU NAVIGASI BAWAH --- */}
      {activeTab === "scan" && (
        <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end gap-3">
          <AnimatePresence>
            {showOcrActions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="flex flex-col items-end gap-3 mb-2"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    uploadInputRef.current?.click();
                    setShowOcrActions(false);
                  }}
                  className="bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Muat Naik <Upload size={16} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowOcrActions(false);
                  }}
                  className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Imbas Resit <Camera size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowOcrActions(!showOcrActions)}
            className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 ${showOcrActions ? "bg-slate-800 dark:bg-slate-700 rotate-45" : "bg-emerald-600 dark:bg-emerald-500"}`}
          >
            {isScanning ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              <Plus
                className={`text-white transition-transform ${showOcrActions ? "" : ""}`}
                size={28}
              />
            )}
          </motion.button>
        </div>
      )}

      <BottomNav 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
        authRole={authRole} 
      />

      {/* --- MODAL: CARTA TREND DIPERBESARKAN --- */}
      <AnimatePresence>
        {expandedTrendChart && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedTrendChart(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        expandedTrendChart === "overall"
                          ? "bg-emerald-500"
                          : expandedTrendChart === "pkt1"
                            ? "bg-blue-500"
                            : expandedTrendChart === "pkt2"
                              ? "bg-amber-500"
                              : "bg-slate-500"
                      }`}
                    />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                      Trend CAPAI:{" "}
                      {expandedTrendChart === "overall"
                        ? "Purata Keseluruhan"
                        : expandedTrendChart === "pkt1"
                          ? "Peringkat 1"
                          : expandedTrendChart === "pkt2"
                            ? "Peringkat 2"
                            : "Lot Felda"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setExpandedTrendChart(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      const dataKey =
                        reportType === "hasil"
                          ? expandedTrendChart === "overall"
                            ? "yield"
                            : expandedTrendChart === "pkt1"
                              ? "pkt1"
                              : expandedTrendChart === "pkt2"
                                ? "pkt2"
                                : "felda"
                          : reportType === "muda"
                            ? expandedTrendChart === "overall"
                              ? "muda"
                              : expandedTrendChart === "pkt1"
                                ? "pkt1Muda"
                                : expandedTrendChart === "pkt2"
                                  ? "pkt2Muda"
                                  : "feldaMuda"
                            : expandedTrendChart === "overall"
                              ? "kpg"
                              : expandedTrendChart === "pkt1"
                                ? "pkt1Kpg"
                                : expandedTrendChart === "pkt2"
                                  ? "pkt2Kpg"
                                  : "feldaKpg";
                      const vals = analytics.monthlyTrend.map(
                        (d) => (d as any)[dataKey],
                      );
                      const max = Math.max(...vals);
                      const min = Math.min(...vals.filter((v) => v > 0));
                      const baseColor =
                        reportType === "hasil"
                          ? expandedTrendChart === "overall"
                            ? "#10b981"
                            : expandedTrendChart === "pkt1"
                              ? "#3b82f6"
                              : expandedTrendChart === "pkt2"
                                ? "#f59e0b"
                                : "#64748b"
                          : reportType === "muda"
                            ? "#f43f5e"
                            : "#0ea5e9";
                      const maxColor =
                        reportType === "hasil"
                          ? expandedTrendChart === "overall"
                            ? "#059669"
                            : expandedTrendChart === "pkt1"
                              ? "#2563eb"
                              : expandedTrendChart === "pkt2"
                                ? "#d97706"
                                : "#475569"
                          : reportType === "muda"
                            ? "#e11d48"
                            : "#0284c7";

                      return (
                        <BarChart
                          data={analytics.monthlyTrend}
                          margin={{ top: 30, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={
                              isDarkMode
                                ? CHART_COLORS.gridDark
                                : CHART_COLORS.grid
                            }
                          />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 10,
                              fontWeight: 700,
                              fill: CHART_COLORS.gray,
                            }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 10,
                              fontWeight: 700,
                              fill: CHART_COLORS.gray,
                            }}
                          />
                          {reportType !== "muda" && (
                            <Tooltip
                              cursor={{
                                fill: isDarkMode
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.02)",
                              }}
                              contentStyle={{
                                backgroundColor: isDarkMode
                                  ? "#1e293b"
                                  : "#ffffff",
                                borderRadius: "16px",
                                border: "none",
                                boxShadow:
                                  "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                              }}
                              labelStyle={{
                                fontSize: "12px",
                                fontWeight: 800,
                                color: isDarkMode ? "#fff" : "#1e293b",
                                marginBottom: "4px",
                              }}
                              formatter={(value: any) => {
                                const unit =
                                  reportType === "hasil"
                                    ? "T/H"
                                    : reportType === "muda"
                                      ? "Bts"
                                      : "Resit";
                                const label =
                                  reportType === "hasil"
                                    ? "CAPAI"
                                    : reportType === "muda"
                                      ? "Muda"
                                      : "KPG Match";
                                const val =
                                  reportType === "hasil"
                                    ? parseFloat(value).toFixed(2)
                                    : value;
                                return [`${val} ${unit}`, label];
                              }}
                            />
                          )}
                          <Bar
                            dataKey={dataKey}
                            radius={[6, 6, 0, 0]}
                            animationDuration={1000}
                          >
                            {analytics.monthlyTrend.map((entry, index) => {
                              const val = (entry as any)[dataKey];
                              let color = baseColor;
                              if (val === max && val > 0) color = maxColor;
                              if (val === min && val > 0) color = "#e11d48";
                              return (
                                <Cell key={`cell-${index}`} fill={color} />
                              );
                            })}
                            <LabelList
                              dataKey={dataKey}
                              position="top"
                              style={{
                                fontSize: "10px",
                                fontWeight: "900",
                                fill: isDarkMode ? "#94a3b8" : "#64748b",
                              }}
                              formatter={(val: number) => {
                                if (val === 0) return "";
                                let text =
                                  reportType === "hasil"
                                    ? val.toFixed(1)
                                    : val.toString();
                                if (val === max) return `▲ MAX ${text}`;
                                if (val === min) return `▼ MIN ${text}`;
                                return text;
                              }}
                            />
                          </Bar>
                          {reportType === "hasil" && (
                            <ReferenceLine
                              y={2.33}
                              stroke="#f47738"
                              strokeDasharray="3 3"
                              label={{
                                value: "Target",
                                position: "right",
                                fill: "#f47738",
                                fontSize: 10,
                                fontWeight: 900,
                              }}
                            />
                          )}
                        </BarChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Analisis trend bulanan menunjukkan prestasi{" "}
                    {reportType === "hasil" ? "hasil (Tan/Hektar)" : reportType === "muda" ? "BTS Muda (Bts)" : reportType === "efb" ? "EFB (Tan)" : "KPA/KPG (Resit)"}{" "}
                    bagi tahun {new Date().getFullYear()}.
                    {reportType === "hasil" && " Garis jingga putus-putus mewakili sasaran bulanan (2.33 T/H)."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EXPANDED THEK CHART */}
      <AnimatePresence>
        {isThekExpanded && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsThekExpanded(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <BarChart3 size={24} className="text-emerald-500" />
                    </div>
                    Analisis THEK:{" "}
                    {chartMetric === "yield"
                      ? "CAPAI"
                      : chartMetric === "muda"
                        ? "Muda"
                        : chartMetric === "efb"
                          ? "EFB"
                          : "KPG Match"}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">
                    Tempoh:{" "}
                    {chartPeriod === "day"
                      ? "HARI INI"
                      : chartPeriod === "month"
                        ? "BULAN INI"
                        : chartPeriod === "year"
                          ? "TAHUN INI"
                          : "Trend Sejarah"}
                  </p>
                </div>
                <button
                  onClick={() => setIsThekExpanded(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="h-full w-full min-h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      const periodData = analytics[chartPeriod];
                      if (!periodData || !periodData.blokStats) return <div />;

                      const chartData = [...periodData.blokStats]
                        .filter((d) => {
                          const val =
                            chartMetric === "yield"
                              ? d.yieldHek
                              : chartMetric === "muda"
                                ? d.muda
                                : d.kpg_match_count;
                          return !isNaN(val) && !isNaN(parseInt(d.blok));
                        })
                        .sort((a, b) => parseInt(a.blok) - parseInt(b.blok));

                      const values = chartData.map((d) =>
                        chartMetric === "yield"
                          ? d.yieldHek
                          : chartMetric === "muda"
                            ? d.muda
                            : d.kpg_match_count,
                      );
                      const maxValue = Math.max(...values);
                      const minValue = Math.min(...values.filter((v) => v > 0));

                      return (
                        <ComposedChart
                          data={chartData}
                          margin={{ top: 40, right: 20, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={
                              isDarkMode
                                ? CHART_COLORS.gridDark
                                : CHART_COLORS.grid
                            }
                          />
                          <XAxis
                            dataKey="blok"
                            interval={0}
                            axisLine={{
                              stroke: isDarkMode
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.1)",
                            }}
                            tickLine={false}
                            tick={{
                              fontSize: 12,
                              fontWeight: 800,
                              fill: CHART_COLORS.gray,
                            }}
                            dy={10}
                            label={{
                              value: "NOMBOR BLOK",
                              position: "insideBottom",
                              offset: -10,
                              fontSize: 10,
                              fontWeight: 900,
                              fill: CHART_COLORS.gray,
                            }}
                          />
                          <YAxis
                            axisLine={{
                              stroke: isDarkMode
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.1)",
                            }}
                            tickLine={false}
                            tick={{
                              fontSize: 12,
                              fontWeight: 800,
                              fill: CHART_COLORS.gray,
                            }}
                            domain={[0, "auto"]}
                          />
                          {chartMetric !== "muda" && (
                            <Tooltip
                              cursor={{
                                fill: isDarkMode
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.02)",
                              }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0]?.payload;
                                  if (!data) return null;
                                  const val =
                                    chartMetric === "yield"
                                      ? data.yieldHek
                                      : chartMetric === "muda"
                                        ? data.muda
                                        : chartMetric === "efb"
                                          ? data.efb_tan
                                          : data.kpg_match_count;
                                  const target = data.targetHek;
                                  const unit =
                                    chartMetric === "yield"
                                      ? "T/H"
                                      : chartMetric === "muda"
                                        ? "Bts"
                                        : chartMetric === "efb"
                                          ? "Tan"
                                          : "Resit";
                                  const label =
                                    chartMetric === "yield"
                                      ? "CAPAI"
                                      : chartMetric === "muda"
                                        ? "Muda"
                                        : chartMetric === "efb"
                                          ? "EFB"
                                          : "KPG Match";

                                  const isMax = val === maxValue && val > 0;
                                  const isMin = val === minValue && val > 0;

                                  return (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 min-w-[200px]">
                                      <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                                        <div className="flex flex-col">
                                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                            Blok {data.blok}
                                          </p>
                                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                            PKT{" "}
                                            {data.pkt === "001"
                                              ? "1"
                                              : data.pkt === "002"
                                                ? "2"
                                                : "FELDA"}
                                          </span>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                          {isMax && (
                                            <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                                              TERTINGGI (MAX)
                                            </span>
                                          )}
                                          {isMin && (
                                            <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                                              TERENDAH (MIN)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            {label}
                                          </p>
                                          <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                              {(val || 0).toFixed(
                                                chartMetric === "yield" ? 2 : 0,
                                              )}
                                            </p>
                                            <p className="text-xs font-bold text-slate-400 uppercase">
                                              {unit}
                                            </p>
                                          </div>
                                        </div>
                                        {chartMetric === "yield" && (
                                          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                              Sasaran
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                              <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                                                {(target || 0).toFixed(2)}
                                              </p>
                                              <p className="text-xs font-bold text-slate-400 uppercase">
                                                T/H
                                              </p>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                              <div
                                                className={`h-full transition-all duration-1000 ${val >= target ? "bg-emerald-500" : "bg-amber-500"}`}
                                                style={{
                                                  width: `${Math.min(100, (val / (target || 1)) * 100)}%`,
                                                }}
                                              />
                                            </div>
                                            <p className="text-[10px] font-black text-right mt-1 text-slate-500 uppercase tracking-widest">
                                              {(
                                                (val / (target || 1)) *
                                                100
                                              ).toFixed(0)}
                                              % Capai
                                            </p>
                                          </div>
                                        )}
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2">
                                          <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">
                                              Luas
                                            </p>
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                                              {data.luas} Ha
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">
                                              Resit
                                            </p>
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                                              {data.resit_count}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          )}
                          <Bar
                            dataKey={
                              chartMetric === "yield"
                                ? "yieldHek"
                                : chartMetric === "muda"
                                  ? "muda"
                                  : chartMetric === "efb"
                                    ? "efb_tan"
                                    : "kpg_match_count"
                            }
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                          >
                            {chartData.map((entry, index) => {
                              const val =
                                chartMetric === "yield"
                                  ? entry.yieldHek
                                  : chartMetric === "muda"
                                    ? entry.muda
                                    : chartMetric === "efb"
                                      ? entry.efb_tan
                                      : entry.kpg_match_count;
                              let color =
                                chartMetric === "yield"
                                  ? CHART_COLORS.green
                                  : chartMetric === "muda"
                                    ? "#f43f5e"
                                    : chartMetric === "efb"
                                      ? "#8b5cf6"
                                      : "#0ea5e9";
                              const maxColor =
                                chartMetric === "yield"
                                  ? "#059669"
                                  : chartMetric === "muda"
                                    ? "#e11d48"
                                    : chartMetric === "efb"
                                      ? "#7c3aed"
                                      : "#0284c7";
                              if (val === maxValue && val > 0) color = maxColor;
                              if (val === minValue && val > 0)
                                color = "#e11d48";
                              return (
                                <Cell key={`cell-${index}`} fill={color} />
                              );
                            })}
                            <LabelList
                              dataKey={
                                chartMetric === "yield"
                                  ? "yieldHek"
                                  : chartMetric === "muda"
                                    ? "muda"
                                    : chartMetric === "efb"
                                      ? "efb_tan"
                                      : "kpg_match_count"
                              }
                              position="top"
                              offset={15}
                              formatter={(val: number) => {
                                if (val <= 0) return "";
                                let text =
                                  chartMetric === "yield"
                                    ? val.toFixed(2)
                                    : chartMetric === "efb"
                                      ? val.toFixed(1)
                                      : val.toString();
                                if (val === maxValue && val > 0)
                                  return `▲ MAX ${text}`;
                                if (val === minValue && val > 0)
                                  return `▼ MIN ${text}`;
                                return text;
                              }}
                              style={{
                                fontSize: "10px",
                                fontWeight: "900",
                                fill: isDarkMode ? "#f8fafc" : "#0f172a",
                              }}
                            />
                          </Bar>
                          {chartMetric === "yield" && (
                            <Line
                              type="monotone"
                              dataKey="targetHek"
                              stroke={CHART_COLORS.orange}
                              strokeWidth={4}
                              dot={{
                                r: 6,
                                fill: CHART_COLORS.orange,
                                strokeWidth: 0,
                              }}
                              activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                          )}
                        </ComposedChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ backgroundColor: CHART_COLORS.green }}
                  />
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    Pencapaian Sebenar
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ backgroundColor: CHART_COLORS.orange }}
                  />
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                    Sasaran (Target)
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EXPANDED PIE CHART */}
      <AnimatePresence>
        {isPieExpanded && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPieExpanded(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <PieChartIcon size={24} className="text-indigo-500" />
                    </div>
                    Pecahan CAPAI Mengikut Peringkat
                  </h3>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">
                    Analisis Komposisi Pengeluaran
                  </p>
                </div>
                <button
                  onClick={() => setIsPieExpanded(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "PKT 1",
                            value: analytics.month?.pkt1_tan || 0,
                          },
                          {
                            name: "PKT 2",
                            value: analytics.month?.pkt2_tan || 0,
                          },
                          {
                            name: "FELDA",
                            value: analytics.month?.felda_tan || 0,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        isAnimationActive={true}
                        animationBegin={200}
                        animationDuration={1500}
                      >
                        <Cell fill={CHART_COLORS.blue} />
                        <Cell fill={CHART_COLORS.orange} />
                        <Cell fill={CHART_COLORS.green} />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                          padding: "12px",
                        }}
                        itemStyle={{ fontSize: "14px", fontWeight: 700 }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={10}
                        formatter={(value) => (
                          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-2">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-6 w-full">
                  {[
                    {
                      label: "PKT 1",
                      val: analytics.month?.pkt1_tan || 0,
                      color: CHART_COLORS.blue,
                    },
                    {
                      label: "PKT 2",
                      val: analytics.month?.pkt2_tan || 0,
                      color: CHART_COLORS.orange,
                    },
                    {
                      label: "FELDA",
                      val: analytics.month?.felda_tan || 0,
                      color: CHART_COLORS.green,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center"
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {item.label}
                      </p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">
                        {item.val.toFixed(2)}
                      </p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase">
                        Tan
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EXPANDED HISTORY CHART */}
      <AnimatePresence>
        {isHistoryExpanded && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryExpanded(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp size={24} className="text-emerald-500" />
                    </div>
                    Trend CAPAI Sejarah (Tahunan)
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">
                    Analisis Prestasi Jangka Panjang
                  </p>
                </div>
                <button
                  onClick={() => setIsHistoryExpanded(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 p-8 overflow-hidden flex flex-col">
                <div className="h-full w-full min-h-[400px]">
                  {historyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={historyChartData}
                        margin={{ top: 40, right: 30, left: 0, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorHistoryFull"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke={
                            isDarkMode
                              ? CHART_COLORS.gridDark
                              : CHART_COLORS.grid
                          }
                        />
                        <XAxis
                          dataKey="year"
                          axisLine={{
                            stroke: isDarkMode
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.1)",
                          }}
                          tickLine={false}
                          tick={{
                            fontSize: 14,
                            fontWeight: 800,
                            fill: CHART_COLORS.gray,
                          }}
                          dy={15}
                        />
                        <YAxis
                          axisLine={{
                            stroke: isDarkMode
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.1)",
                          }}
                          tickLine={false}
                          tick={{
                            fontSize: 14,
                            fontWeight: 800,
                            fill: CHART_COLORS.gray,
                          }}
                          domain={[0, "auto"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="yield"
                          stroke="#10b981"
                          strokeWidth={5}
                          fillOpacity={1}
                          fill="url(#colorHistoryFull)"
                          animationDuration={1000}
                          activeDot={false}
                        >
                          <LabelList
                            dataKey="yield"
                            position="top"
                            offset={15}
                            formatter={(val: number) => val.toFixed(2)}
                            style={{
                              fontSize: "12px",
                              fontWeight: 900,
                              fill: "#10b981",
                              fontFamily: "Inter",
                            }}
                          />
                        </Area>
                        <ReferenceLine
                          y={28}
                          stroke="#f43f5e"
                          strokeDasharray="10 10"
                          strokeWidth={3}
                          label={{
                            value: "SASARAN (28 T/H)",
                            position: "insideTopRight",
                            fill: "#f43f5e",
                            fontSize: 14,
                            fontWeight: 900,
                            dy: -20,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                      <Loader2
                        className="animate-spin text-emerald-500"
                        size={60}
                      />
                      <div className="text-center space-y-2">
                        <h4 className="text-slate-400 font-black uppercase tracking-[0.3em] text-xl">
                          Menyusun Data Sejarah
                        </h4>
                        <p className="text-slate-500 font-bold text-sm">
                          Sila tunggu sebentar sementara sistem memproses trend
                          prestasi 2012–2025...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full shadow-xl"
                    style={{ backgroundColor: "#10b981" }}
                  />
                  <span className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em]">
                    CAPAI Tahunan (Tan/Hektar)
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
