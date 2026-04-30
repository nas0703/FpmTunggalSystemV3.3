import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');

const lines = content.split('\n');
const start_idx = lines.findIndex(l => l.includes('const renderRow ='));
const end_idx = lines.findIndex((l, i) => i > start_idx && l.includes('  };'));

console.log("Lines found:", start_idx, end_idx);

for (let i = start_idx; i <= end_idx; i++) {
    // Remove standalone text-emerald-100 (which was erroneously making text light green in light mode)
    lines[i] = lines[i].replace(/(?<!dark:)text-emerald-100/g, '');
    lines[i] = lines[i].replace(/text-white dark:/g, 'dark:');
    
    // Clean up
    lines[i] = lines[i].replace(/  +/g, ' ');
}

content = lines.join('\n');
fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);
