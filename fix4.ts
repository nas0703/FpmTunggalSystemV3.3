import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');

// Replace table bg
content = content.replace('w-full border-collapse bg-white dark:bg-[#072d1f]', 'w-full border-collapse bg-white dark:bg-emerald-950');

// Replace weird duplicated classes
content = content.replace(/text-white dark:text-emerald-100 dark:text-emerald-300 py-2 px-1 text-white dark:text-emerald-100 dark:text-emerald-300 font-semibold bg-emerald-[^"]+/g, 'text-emerald-50 py-2 px-1 font-semibold bg-emerald-800/80');
content = content.replace(/text-white dark:text-emerald-100 dark:text-emerald-300 py-3 px-2 text-white dark:text-emerald-100 dark:text-emerald-300 font-semibold bg-emerald-[^"]+/g, 'text-emerald-50 py-3 px-2 font-semibold bg-emerald-800/80');

content = content.split('dark:text-emerald-100 dark:text-emerald-300').join('dark:text-emerald-100');
content = content.split('text-emerald-700 dark:text-emerald-300 dark:text-emerald-100').join('text-emerald-100');
content = content.split('text-white dark:text-emerald-100 dark:text-emerald-300').join('text-emerald-100');
content = content.split('text-emerald-100 dark:text-emerald-300').join('text-emerald-100');

// Sticky column head
content = content.split('py-3 px-2 w-[5%] bg-emerald-950/90 dark:bg-emerald-950 z-40 shadow-[2px_0_10px_rgba(0,0,0,0.3)]').join('py-3 px-2 w-[5%] bg-emerald-900/95 dark:bg-emerald-950/95 z-40 shadow-md');

// Header cell borders
content = content.split('border border-emerald-800/40 dark:border-emerald-700/50').join('border-b border-r border-emerald-700/50 dark:border-emerald-800/40');

fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);

