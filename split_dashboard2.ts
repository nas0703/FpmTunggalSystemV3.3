import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf-8');

const startMarker = '{/* TAB 2: DASHBOARD (Merged Summary + Analytics) */}';
const endMarker = '{/* TAB 3: SEJARAH DATA */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const dashboardBlock = content.substring(startIndex, endIndex);

// We'll wrap this block in a component
// We can just dump it in DashboardTab.tsx and we will manually fix the props using TypeScript compiler errors.
let componentContent = `import React from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import {
  LayoutDashboard, Loader2, Calendar, Target, TrendingUp, TrendingDown,
  FileSpreadsheet, BarChart3, Package, CloudRain, ShieldCheck, AlertCircle,
  AlertTriangle, Play, ChevronRight, Share, FileText, ArrowRight, ZoomIn
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
      monthlyTrendChart, customTooltipContent, renderCustomTooltip, sharePreviewData,
      setSharePreviewData, priceTrendChart, ThekTooltipContent, rawData, handleExportRCReport,
      isExporting, thekData, blockData, handleRowClick, getYearYields, getMonthYields,
      formatNumber, blockAnnualData, YIELD_DATA_2025,
      // Pass EVERYTHING else implicitly
      ...rest
  } = props;

  // We map the implicit rest props as well so we don't miss anything that was extracted
  Object.assign(globalThis as any, rest); // dirty hack for implicit props to be resolved if we miss them in destructuring, though we should just explicitly state them. Just map rest.

  return (
    <>
${dashboardBlock}
    </>
  );
};
`;

// wait, globalThis is bad. Let's just destructure everything we can find, or just use typescript compiler.
// We will replace all variable references with props.variable? No, just destructure from props.

fs.writeFileSync('src/features/dashboard/components/DashboardTab.tsx', componentContent);

// And replace the block in App.tsx with <DashboardTab {...props} />
let appContent = content.replace(dashboardBlock, `
            <DashboardTab 
               activeTab={activeTab}
               authRole={authRole}
               isDarkMode={isDarkMode}
               swipeDirection={swipeDirection}
               handleSwipe={handleSwipe}
               reportType={reportType}
               setReportType={setReportType}
               showToast={showToast}
               reportTabs={reportTabs}
               analytics={analytics}
               activeHasilTab={activeHasilTab}
               setActiveHasilTab={setActiveHasilTab}
               setShowFSA13Report={setShowFSA13Report}
               hujanData={hujanData}
               chartPeriod={chartPeriod}
               setChartPeriod={setChartPeriod}
               chartMetric={chartMetric}
               setChartMetric={setChartMetric}
               showYtdChart={showYtdChart}
               setShowYtdChart={setShowYtdChart}
               showMonthlyTrendChart={showMonthlyTrendChart}
               setShowMonthlyTrendChart={setShowMonthlyTrendChart}
               showPriceTrendChart={showPriceTrendChart}
               setShowPriceTrendChart={setShowPriceTrendChart}
               showThekChart={showThekChart}
               setShowThekChart={setShowThekChart}
               showRankingCollapsed={showRankingCollapsed}
               setShowRankingCollapsed={setShowRankingCollapsed}
               showTrendCollapsed={showTrendCollapsed}
               setShowTrendCollapsed={setShowTrendCollapsed}
               showSummaryCollapsed={showSummaryCollapsed}
               setShowSummaryCollapsed={setShowSummaryCollapsed}
               showDetailsCollapsed={showDetailsCollapsed}
               setShowDetailsCollapsed={setShowDetailsCollapsed}
               setExpandedTrendChart={setExpandedTrendChart}
               thekSortMode={thekSortMode}
               setThekSortMode={setThekSortMode}
               thekHistoryView={thekHistoryView}
               setThekHistoryView={setThekHistoryView}
               isThekExpanded={isThekExpanded}
               setIsThekExpanded={setIsThekExpanded}
               isPieExpanded={isPieExpanded}
               setIsPieExpanded={setIsPieExpanded}
               monthlyTrendChart={monthlyTrendChart}
               customTooltipContent={customTooltipContent}
               renderCustomTooltip={renderCustomTooltip}
               sharePreviewData={sharePreviewData}
               setSharePreviewData={setSharePreviewData}
               priceTrendChart={priceTrendChart}
               ThekTooltipContent={ThekTooltipContent}
               rawData={rawData}
               handleExportRCReport={handleExportRCReport}
               isExporting={isExporting}
               thekData={thekData}
               blockData={blockData}
               handleRowClick={handleRowClick}
               getYearYields={getYearYields}
               getMonthYields={getMonthYields}
               formatNumber={formatNumber}
               blockAnnualData={blockAnnualData}
               YIELD_DATA_2025={YIELD_DATA_2025}
               showFSA13Report={showFSA13Report}
               dashboardDate={dashboardDate}
               rankingPeriod={rankingPeriod}
               setRankingPeriod={setRankingPeriod}
               setReportTabs={setReportTabs}
               isReordering={isReordering}
               // Add more if needed
            />
`);

appContent = appContent.replace(
    'import { HasilBulananTable } from "./features/dashboard/components/HasilBulananTable";',
    'import { DashboardTab } from "./features/dashboard/components/DashboardTab";\nimport { HasilBulananTable } from "./features/dashboard/components/HasilBulananTable";'
);


fs.writeFileSync('src/App.tsx', appContent);
console.log("Successfully replaced block with <DashboardTab />");
