import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

// I will just revert App.tsx and redo the Dashboard injection.
// I can pull App.tsx from git head! No wait, I don't need to, I can just do a precise replace.

// Let's remove the injected props from `<Header`
const badHeaderInject = `               dashboardTrendView={dashboardTrendView}
               setDashboardTrendView={setDashboardTrendView}
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
               captureTableScreenshot={captureTableScreenshot}
               isCapturing={isCapturing}
               setShowExportModal={setShowExportModal}
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
               rankingPeriod={rankingPeriod}`;

appContent = appContent.replace(badHeaderInject, '');

const correctPropsInject = `
               dashboardTrendView={dashboardTrendView}
               setDashboardTrendView={setDashboardTrendView}
               showFSA13Report={showFSA13Report}
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
               rankingPeriod={rankingPeriod}
               `;

appContent = appContent.replace(
    /<DashboardTab\s+activeTab=\{activeTab\}/s,
    `<DashboardTab ${correctPropsInject} activeTab={activeTab}`
);

fs.writeFileSync('src/App.tsx', appContent);

let dashContent = fs.readFileSync('src/features/dashboard/components/DashboardTab.tsx', 'utf-8');
dashContent = dashContent.replace(/setShowFSA13Report,\s*setShowFSA13Report,/, 'setShowFSA13Report,');
fs.writeFileSync('src/features/dashboard/components/DashboardTab.tsx', dashContent);

console.log('Fixed Header / Dashboard injection');
