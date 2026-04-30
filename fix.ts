import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');
content = content.replace(/cell\.\s*=\s*\{/g, 'cell.border = {');
// Wait, I also did: content = content.split('border-border').join('border');
fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);
