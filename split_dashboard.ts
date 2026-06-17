import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf-8');

const startMarker = '{/* TAB 2: DASHBOARD (Merged Summary + Analytics) */}';
const endMarker = '{/* TAB 3: SEJARAH DATA */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const dashboardBlock = content.substring(startIndex, endIndex);
    console.log(`Found dashboard block: ${dashboardBlock.split('\n').length} lines`);
} else {
    console.log("Could not find markers.");
}
