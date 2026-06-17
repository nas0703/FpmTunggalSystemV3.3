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
  'setShowRanking', 'showRanking', 'setRankingPeriod', 'rankingPeriod'
];

let propStr = missingProps.join(', ');

content = content.replace(
    /isReordering,.*?dashboardTrendView,/,
    `isReordering, `
);

// We'll replace `isReordering,` with `isReordering, ${propStr},`
content = content.replace(
  /isReordering,/,
  `isReordering, ${propStr}, `
);

fs.writeFileSync('src/features/dashboard/components/DashboardTab.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

appContent = appContent.replace(
    /isReordering=\{isReordering\}[\s\S]*?rankingPeriod=\{rankingPeriod\}/,
    `isReordering={isReordering}`
);

let propsInject = missingProps.map(p => `${p}={${p}}`).join('\n               ');

appContent = appContent.replace(
    /isReordering=\{isReordering\}/,
    `isReordering={isReordering}\n               ${propsInject}`
);

fs.writeFileSync('src/App.tsx', appContent);

console.log('Fixed props');
