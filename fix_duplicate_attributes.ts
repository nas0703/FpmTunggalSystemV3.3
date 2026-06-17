import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

// I will just get lines, and inside `<DashboardTab` I will collect unique attributes
const lines = appContent.split('\n');

const startIdx = lines.findIndex(l => l.includes('<DashboardTab'));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes('/>'));

if (startIdx !== -1 && endIdx !== -1) {
    const componentLines = lines.slice(startIdx, endIdx + 1);
    const seenMap = new Set();
    const cleanLines = [];
    componentLines.forEach(line => {
        // match prop={...} or prop="..."
        const match = line.match(/^\s*([a-zA-Z0-9_]+)=/);
        if (match) {
            const attr = match[1];
            if (seenMap.has(attr)) {
                return; // skip duplicate
            }
            seenMap.add(attr);
        }
        cleanLines.push(line);
    });
    
    appContent = [
        ...lines.slice(0, startIdx),
        ...cleanLines,
        ...lines.slice(endIdx + 1)
    ].join('\n');
    
    fs.writeFileSync('src/App.tsx', appContent);
}

console.log('Fixed duplicates in App.tsx');
