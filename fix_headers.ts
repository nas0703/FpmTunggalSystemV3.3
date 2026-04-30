import * as fs from 'fs';
let content = fs.readFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', 'utf8');

// clean up weird duplicate dark: text classes
content = content.split('dark:text-emerald-300 dark:text-emerald-100').join('dark:text-emerald-100');
content = content.split('dark:text-emerald-300 dark:text-emerald-300').join('dark:text-emerald-300');
content = content.split('text-emerald-700 dark:text-emerald-100 dark:text-emerald-100').join('text-emerald-700 dark:text-emerald-100');
content = content.split('text-emerald-600 dark:text-emerald-400 dark:text-emerald-100').join('text-emerald-600 dark:text-emerald-100');
content = content.split('border-b border-emerald-200 dark:border-slate-800/40 text-emerald-700 dark:text-emerald-100').join('border-b border-emerald-700/50 dark:border-emerald-800/80 text-emerald-100');
content = content.split('border-b border-emerald-200 dark:border-slate-800/40').join('border-b border-emerald-700/50 dark:border-emerald-800/80');

// make the header text white
content = content.split('text-emerald-700 dark:text-emerald-100').join('text-white dark:text-emerald-100');
content = content.split('text-emerald-600 dark:text-emerald-400').join('text-white dark:text-emerald-100');

// Fix the main outer card shadow
content = content.split('shadow-[0_10px_40px_rgba(0,0,0,0.5)]').join('shadow-emerald-900/40');

// Revert some header BG to solid emerald so it looks like the prompt
content = content.split('bg-transparent').join('bg-emerald-900 dark:bg-emerald-900');
content = content.split('bg-emerald-900/20 dark:bg-emerald-950/20').join('bg-emerald-950 dark:bg-emerald-950');
content = content.split('bg-emerald-800/20 dark:bg-emerald-900/20').join('bg-emerald-800 dark:bg-emerald-800');
content = content.split('text-emerald-100 font-semibold bg-emerald-950/10 dark:bg-emerald-950/30').join('text-emerald-100 font-semibold bg-emerald-700 dark:bg-emerald-700');

// Header borders to match solid bg
content = content.split('border-b border-emerald-700/50 dark:border-emerald-800/80').join('border border-emerald-700 dark:border-emerald-600');

fs.writeFileSync('./src/features/dashboard/components/HasilBulananTable.tsx', content);
