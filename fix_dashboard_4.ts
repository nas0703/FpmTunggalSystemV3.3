import fs from 'fs';

let content = fs.readFileSync('src/features/dashboard/components/DashboardTab.tsx', 'utf-8');

const missingProps = [
  'dashboardTrendView', 'setDashboardTrendView',
  'showFSA13Report', 'setShowFSA13Report',
  'handleCopyReport', 'handleWhatsAppShare', 'showReportDatePicker',
  'dashboardDate', 'setDashboardDate', 'executeWhatsAppShare',
  'generateRCReport', 'tableToCaptureRef', 'captureTableScreenshot', 'isCapturing',
  'setShowExportModal', 'handleDownloadPdf', 'isDownloadingPdf', 'handlePrint',
  'handleShareBtsReport', 'isSharingBts', 'thekChartRef', 'historyChartData',
  'setShowRanking', 'showRanking', 'setRankingPeriod', 'rankingPeriod', 'isReordering'
];

// Replace the end of destructuring to include missingProps
content = content.replace(
    /blockAnnualData, YIELD_DATA_2025,/,
    `blockAnnualData, YIELD_DATA_2025, ${missingProps.join(', ')},`
);

// We had some issue where I tried to replace `isReordering` but it was not there.
fs.writeFileSync('src/features/dashboard/components/DashboardTab.tsx', content);

console.log('Fixed props in DashboardTab');
