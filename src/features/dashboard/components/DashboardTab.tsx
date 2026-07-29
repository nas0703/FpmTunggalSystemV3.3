import React from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import {
  LayoutDashboard, Loader2, Calendar, Target, TrendingUp, TrendingDown, ClipboardCheck,
  FileSpreadsheet, BarChart3, Package, CloudRain, ShieldCheck, AlertCircle,
  AlertTriangle, Play, ChevronRight, Share, FileText, ArrowRight, ZoomIn, ChevronDown, CircleDollarSign, Share2, Plus, ScanLine, Trophy
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList, Brush, LineChart, Line, AreaChart, Area, Legend, ReferenceLine,
  ComposedChart, PieChart, Pie
} from 'recharts';

import { FertilizerModule } from '../../fertilizer/FertilizerModule';
import { MerumputModule } from '../../merumput/MerumputModule';
import { PruningModule } from '../../pruning/PruningModule';
import { DigitalClock } from '../../../components/common/DigitalClock';
import { AbwView } from '../../hasil/components/AbwView';
import { BbcView } from '../../hasil/components/BbcView';
import { LaporanHujanView } from '../../hasil/components/LaporanHujanView';
import { LaporanView } from '../../hasil/components/LaporanView';
import { LaporanBacklogView } from '../../hasil/components/LaporanBacklogView';
import { HasilBulananTable } from './HasilBulananTable';
import { ReportSummarySection } from './ReportSummarySection';
import { FloatingInput } from '../../../components/ui/FloatingInput';
import {
  CHART_COLORS, TARGET_ANNUAL_PKT1, TARGET_ANNUAL_PKT2, TARGET_ANNUAL_FELDA,
  MONTHLY_TARGETS_2026, MASTER_DATA
} from '../../../utils/constants';

export const DashboardTab = (props: any) => {
  const {
      activeTab, authRole, isDarkMode, swipeDirection, handleSwipe, reportType,
      setReportType, showToast, reportTabs, analytics, activeHasilTab, setActiveHasilTab,
      setShowFSA13Report, hujanData, chartPeriod, setChartPeriod, chartMetric, setChartMetric,
      showYtdChart, setShowYtdChart, showMonthlyTrendChart, setShowMonthlyTrendChart,
      showPriceTrendChart, setShowPriceTrendChart, showThekChart, setShowThekChart,
      showRankingCollapsed, setShowRankingCollapsed, showTrendCollapsed, setShowTrendCollapsed,
      showSummaryCollapsed, setShowSummaryCollapsed, showDetailsCollapsed, setShowDetailsCollapsed,
      setExpandedTrendChart, thekSortMode, setThekSortMode, thekHistoryView, setThekHistoryView,
      isThekExpanded, setIsThekExpanded, isPieExpanded, setIsPieExpanded,
      sharePreviewData,
      setSharePreviewData, rawData, isExporting, blockAnnualData, YIELD_DATA_2025, dashboardTrendView, setDashboardTrendView, showFSA13Report,  handleCopyReport, handleWhatsAppShare, showReportDatePicker, dashboardDate, setDashboardDate, executeWhatsAppShare, generateRCReport, tableToCaptureRef, captureTableScreenshot, isCapturing, setShowExportModal, handleDownloadPdf, isDownloadingPdf, handlePrint, handleShareBtsReport, isSharingBts, thekChartRef, historyChartData, setShowRanking, showRanking, setRankingPeriod, rankingPeriod, isReordering,
      // Pass EVERYTHING else implicitly
      ...rest
  } = props;

  // We map the implicit rest props as well so we don't miss anything that was extracted
  Object.assign(globalThis as any, rest); // dirty hack for implicit props to be resolved if we miss them in destructuring, though we should just explicitly state them. Just map rest.

  return (
    <>
{/* TAB 2: DASHBOARD (Merged Summary + Analytics) */}
            {activeTab === "dashboard" &&
              (authRole === "pf" ||
                authRole === "fc" ||
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
                      // Ignore swipe if dragging a chart/brush
                      const target = _e?.target as any;
                      const isRecharts = (() => {
                        if (!target) return false;
                        if (typeof target.closest === 'function') {
                          if (target.closest('.recharts-wrapper') || target.closest('.recharts-brush')) return true;
                        }
                        let curr = target;
                        while (curr) {
                          const cls = typeof curr.className === 'string' ? curr.className : (curr.className?.baseVal || "");
                          if (cls && cls.includes && cls.includes("recharts")) return true;
                          curr = curr.parentNode || curr.parentElement;
                        }
                        return false;
                      })();
                      if (isRecharts) return;

                      const threshold = 30; // More sensitive for sub-tabs
                      if (info.offset.x < -threshold) handleSwipe("left");
                      else if (info.offset.x > threshold) handleSwipe("right");
                    }}
                    className="space-y-4 touch-pan-y pb-24"
                  >
                    {/* BAJA & MERUMPUT & PRUNING SPECIAL VIEWS */}
                    {reportType === "baja" ? (
                      <FertilizerModule
                        authRole={authRole}
                        isDarkMode={isDarkMode}
                      />
                    ) : reportType === "merumput" ? (
                      <MerumputModule
                        authRole={authRole}
                        isDarkMode={isDarkMode}
                        onShowToast={showToast}
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
                                { id: 'hujan', label: 'Laporan Hujan', icon: CloudRain },
                                { id: 'backlog', label: 'Laporan Backlog', icon: ClipboardCheck }
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
      
      {reportType === "hasil" && activeHasilTab === 'backlog' && <LaporanBacklogView />}
      
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
                          (reportType !== 'hasil' && reportType !== "harga" && reportType !== "baja" && reportType !== "pruning" && reportType !== "merumput")) && (
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
                                                      top: 55,
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
                                                        content={(props: any) => {
                                                          const { x, y, width, value } = props;
                                                          if (value === undefined || value === null || value <= 0) return null;
                                                          let text =
                                                            chartMetric === "yield"
                                                              ? value.toFixed(1)
                                                              : chartMetric === "efb"
                                                                ? value.toFixed(1)
                                                                : value.toString();
                                                          if (value === maxValue && value > 0) {
                                                            text = `▲ ${text}`;
                                                          } else if (value === minValue && value > 0) {
                                                            text = `▼ ${text}`;
                                                          }
                                                          return (
                                                            <text
                                                              x={x + width / 2}
                                                              y={y - 6}
                                                              fill={isDarkMode ? "#cbd5e1" : "#475569"}
                                                              fontSize="7px"
                                                              fontWeight="900"
                                                              fontFamily="monospace"
                                                              textAnchor="start"
                                                              transform={`rotate(-90, ${x + width / 2}, ${y - 6})`}
                                                              dominantBaseline="middle"
                                                            >
                                                              {text}
                                                            </text>
                                                          );
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
                          (reportType !== "hasil" && reportType !== "harga" && reportType !== "efb" && reportType !== "pruning" && reportType !== "merumput")) && (
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
                                        NO.
                                      </span>
                                    </div>
                                    <div
                                      className={`flex-1 grid gap-1 ${showRanking && reportType === "hasil" ? "grid-cols-5" : "grid-cols-4"}`}
                                    >
                                      <div className="col-span-1 text-left">
                                        <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                                          BLOK
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
                                                {index + 1}
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

            
    </>
  );
};
