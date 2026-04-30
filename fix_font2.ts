import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');

const lines = content.split('\n');

let insideRenderRow = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const renderRow =')) {
        insideRenderRow = true;
    }
    
    if (insideRenderRow) {
        // Clean text-emerald-100 when it's not preceded by dark:
        lines[i] = lines[i].replace(/(?<!dark:)text-emerald-100/g, '');
        // Clean text-white dark:text-emerald-100 to dark:text-emerald-100
        lines[i] = lines[i].replace(/text-white dark:text-emerald-100/g, 'dark:text-emerald-100');
        
        lines[i] = lines[i].replace(/  +/g, ' ');
        if (lines[i].trim() === '};' && lines[i-1].includes('</tr>')) {
           insideRenderRow = false; // End of renderRow? No, it ends with } inside the function.
        }
        
        // Let's just process until the next function definition 'const renderHeaderBlocks'
        if (lines[i].includes('const renderHeaderBlocks =')) {
            insideRenderRow = false;
        }
    }
}

content = lines.join('\n');
fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);
