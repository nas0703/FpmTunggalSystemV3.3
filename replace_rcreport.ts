import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

// I will extract ExpandedTrendChartModal, ExpandedThekChartModal, FilterDateReportModal in separate files later.
// For now, let's just delete the inline RCReportModal and use the component, AND reply to user.

appContent = appContent.replace(
    /\{\/\* MODAL CIRI BAHARU \*\/\}\s*<AnimatePresence>\s*\{showRCReportModal[\s\S]*?Laporan RC Daily[\s\S]*?<\/AnimatePresence>/m,
    `<RCReportModal 
         isOpen={showRCReportModal}
         onClose={() => setShowRCReportModal(false)}
         generateRCReport={generateRCReport}
         handleCopyReport={handleCopyReport}
         handleWhatsAppShare={handleWhatsAppShare}
      />`
);

// wait the name of the comment was "{/* MODAL CIRI BAHARU */}" ? Yes.
// add import: `import { RCReportModal } from "./components/common/modals/RCReportModal";`
appContent = appContent.replace(
    /import \{ ExportModal \} from "\.\/components\/common\/modals\/ExportModal";/,
    `import { ExportModal } from "./components/common/modals/ExportModal";
import { RCReportModal } from "./components/common/modals/RCReportModal";`
);

fs.writeFileSync('src/App.tsx', appContent);
console.log('Done replacing inline modal');
