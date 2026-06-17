import fs from 'fs';

let content = fs.readFileSync('src/features/dashboard/components/DashboardTab.tsx', 'utf-8');

// 1. Add missing imports
content = content.replace(
    /Share, FileText, ArrowRight, ZoomIn/,
    'Share, FileText, ArrowRight, ZoomIn, ChevronDown, CircleDollarSign, Share2, Plus, ScanLine, Trophy'
);

// 2. Add missing props
content = content.replace(
    /isReordering,/,
    `isReordering, dashboardTrendView, handleCopyReport, handleWhatsAppShare, showReportDatePicker, dashboardDate, setDashboardDate, executeWhatsAppShare, generateRCReport, tableToCaptureRef, captureTableScreenshot, isCapturing, handleDownloadPdf, isDownloadingPdf, handlePrint, handleShareBtsReport, isSharingBts, thekChartRef, historyChartData, setShowRanking, showRanking, Trophy, setRankingPeriod, rankingPeriod,`
);

fs.writeFileSync('src/features/dashboard/components/DashboardTab.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(
    /isReordering=\{isReordering\}/,
    `isReordering={isReordering}
               dashboardTrendView={dashboardTrendView}
               handleCopyReport={handleCopyReport}
               handleWhatsAppShare={handleWhatsAppShare}
               showReportDatePicker={showReportDatePicker}
               dashboardDate={dashboardDate}
               setDashboardDate={setDashboardDate}
               executeWhatsAppShare={executeWhatsAppShare}
               generateRCReport={generateRCReport}
               tableToCaptureRef={tableToCaptureRef}
               captureTableScreenshot={captureTableScreenshot}
               isCapturing={isCapturing}
               handleDownloadPdf={handleDownloadPdf}
               isDownloadingPdf={isDownloadingPdf}
               handlePrint={handlePrint}
               handleShareBtsReport={handleShareBtsReport}
               isSharingBts={isSharingBts}
               thekChartRef={thekChartRef}
               historyChartData={historyChartData}
               setShowRanking={setShowRanking}
               showRanking={showRanking}
               setRankingPeriod={setRankingPeriod}
               rankingPeriod={rankingPeriod}`
);
fs.writeFileSync('src/App.tsx', appContent);

console.log('Fixed props and imports');
