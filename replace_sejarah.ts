import * as fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

const startIndex = 8041; 
const endIndex = 8227;

// Let's verify line boundaries
console.log('Start Line:', lines[startIndex]);
console.log('End Line:', lines[endIndex]);

const newLines = lines.slice(0, startIndex);
newLines.push(`            {activeTab === "sejarah" && (
              <SejarahTab 
                historyFilterDate={historyFilterDate}
                setHistoryFilterDate={setHistoryFilterDate}
                setShowExportModal={setShowExportModal}
                rawData={rawData}
                setRecordToDelete={setRecordToDelete}
              />
            )}`);
newLines.push(...lines.slice(endIndex + 1));

let finalApp = newLines.join('\n');
const importStmt = 'import { DigitalClock } from "./components/common/DigitalClock";';
finalApp = finalApp.replace(importStmt, importStmt + '\nimport { SejarahTab } from "./features/sejarah/components/SejarahTab";');

fs.writeFileSync('src/App.tsx', finalApp);
console.log('App.tsx updated');
