import * as fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

const startIndex = 4984; // 4985 in 1-based is 4984 in 0-based
const endIndex = 5341;   // We need to verify these boundaries!

console.log('Start Line:', lines[startIndex]);
console.log('End Line:', lines[endIndex]);

const newLines = lines.slice(0, startIndex);
newLines.push(`            {/* TAB 1: KEMASUKAN DATA */}
            {activeTab === "scan" && (
              <InputTab
                formData={formData}
                setFormData={setFormData}
                fileInputRef={fileInputRef}
                uploadInputRef={uploadInputRef}
                handleOcrScan={handleOcrScan}
                showInputError={showInputError}
                handleManualSubmit={handleManualSubmit}
                isChecking={isChecking}
                handleResetInput={handleResetInput}
              />
            )}`);
newLines.push(...lines.slice(endIndex + 1));

let finalApp = newLines.join('\n');
const importStmt = 'import { SejarahTab } from "./features/sejarah/components/SejarahTab";';
finalApp = finalApp.replace(importStmt, importStmt + '\nimport { InputTab } from "./features/input/components/InputTab";');

fs.writeFileSync('src/App.tsx', finalApp);
console.log('App.tsx updated for InputTab');
