import fs from 'fs';

let dashContent = fs.readFileSync('src/features/dashboard/components/DashboardTab.tsx', 'utf-8');

// The re-declaration of setShowFSA13Report
dashContent = dashContent.replace(/setShowFSA13Report,\s*setShowFSA13Report,/, 'setShowFSA13Report,');
// Let's do it universally for the whole file
let i = 0;
while (i < 5) {
   dashContent = dashContent.replace(/setShowFSA13Report,([^}]*?)setShowFSA13Report,/, 'setShowFSA13Report,$1');
   i++;
}

fs.writeFileSync('src/features/dashboard/components/DashboardTab.tsx', dashContent);

// Fix TS17001 in App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = appContent.split('\n');
console.log(lines[4749]);

// Just blindly remove any duplicate line inside the `<DashboardTab` section!
const startIdx = lines.findIndex(l => l.includes('<DashboardTab'));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes('/>'));

if (startIdx !== -1 && endIdx !== -1) {
    const componentLines = lines.slice(startIdx, endIdx + 1);
    const seenMap = new Set();
    const cleanLines = [];
    componentLines.forEach(line => {
        const match = line.match(/\\s*([a-zA-Z0-9_]+)=/);
        if (match) {
            if (seenMap.has(match[1])) {
                console.log("Found duplicate prop: " + match[1]);
                return;
            }
            seenMap.add(match[1]);
        }
        cleanLines.push(line);
    });
    const newContent = [
        ...lines.slice(0, startIdx),
        ...cleanLines,
        ...lines.slice(endIdx + 1)
    ];
    fs.writeFileSync('src/App.tsx', newContent.join('\n'));
}

console.log('Fixed redeclarations and duplicates');
