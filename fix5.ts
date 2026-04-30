import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');

content = content.split('dark:text-emerald-200 dark:text-emerald-100').join('dark:text-emerald-100');
content = content.split('shadow-slate-200/50').join('shadow-emerald-900/10');

fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);

