import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');

// Header borders to be lighter
content = content.split('border border-emerald-700 dark:border-emerald-600').join('border border-emerald-800/40 dark:border-emerald-700/50');
content = content.split('bg-emerald-900 dark:bg-emerald-900').join('bg-emerald-900/90 dark:bg-emerald-900');
content = content.split('bg-emerald-950 dark:bg-emerald-950').join('bg-emerald-950/90 dark:bg-emerald-950');

fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);
