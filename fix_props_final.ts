import fs from 'fs';

const badProps = [
    'monthlyTrendChart', 'customTooltipContent', 'renderCustomTooltip',
    'priceTrendChart', 'ThekTooltipContent', 'handleExportRCReport',
    'thekData', 'blockData', 'handleRowClick', 'getYearYields',
    'getMonthYields', 'formatNumber'
];

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

badProps.forEach(prop => {
    const regex = new RegExp(`\\s*${prop}=\\{${prop}\\}\\s*`, 'g');
    appContent = appContent.replace(regex, '\n               ');
});

// Fix duplicate setShowFSA13Report in DashboardTab destructuring
let dashContent = fs.readFileSync('src/features/dashboard/components/DashboardTab.tsx', 'utf-8');

badProps.forEach(prop => {
    // it's in the string so we can remove `prop, `
    const regex = new RegExp(`\\b${prop},\\s*`, 'g');
    dashContent = dashContent.replace(regex, '');
});

// Fix redeclared setShowFSA13Report issue:
dashContent = dashContent.replace(/setShowFSA13Report,\s*setShowFSA13Report,/, 'setShowFSA13Report,');

// Check App.tsx for duplicate props (error TS17001)
// Wait maybe isReordering or something is duplicate. Let's just fix it automatically.
const matches = appContent.match(/<DashboardTab([^>]+)\/>/s);
if (matches) {
    const attrsText = matches[1];
    const lines = attrsText.split('\\n');
    const seen = new Set();
    const newLines = lines.filter(line => {
        const match = line.match(/([a-zA-Z0-9_]+)=/);
        if (match) {
            const attr = match[1];
            if (seen.has(attr)) return false;
            seen.add(attr);
        }
        return true;
    });
    // Can't replace easily this way. We will try a simpler replace
}

fs.writeFileSync('src/App.tsx', appContent);
fs.writeFileSync('src/features/dashboard/components/DashboardTab.tsx', dashContent);
