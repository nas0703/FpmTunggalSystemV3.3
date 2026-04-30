import * as fs from 'fs';

function updateFile(filepath: string) {
    let content = fs.readFileSync(filepath, 'utf8');

    // 1. rowClass
    content = content.replace(
        `    let rowClass = "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-b-slate-100 dark:border-b-slate-800/60";
    let isRankedColor = false;

    if (isGrandTotal) {
        rowClass = "bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 relative";
    } else if (isSubtotal) {
        rowClass = "bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-700";
    } else if (data.blok !== "LF" && (sortBy === "month" || sortBy === "ytd")) {
        const pct = sortBy === "month" ? data.pctCapaiMonth : data.pctCapaiYtd;
        if (pct >= 100) {
            rowClass = "bg-emerald-50/50 dark:bg-white/50 dark:bg-slate-900/50/10 text-emerald-900 dark:text-emerald-100 font-medium border-b border-b-slate-100 dark:border-b-slate-800/60";
            isRankedColor = true;
        } else if (pct >= 90) {
            rowClass = "bg-teal-50/50 dark:bg-teal-900/10 text-teal-900 dark:text-teal-100 font-medium border-b border-b-slate-100 dark:border-b-slate-800/60";
            isRankedColor = true;
        } else if (pct >= 70) {
            rowClass = "bg-amber-50/50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 font-medium border-b border-b-slate-100 dark:border-b-slate-800/60";
            isRankedColor = true;
        } else {
            rowClass = "bg-rose-50/50 dark:bg-rose-900/10 text-rose-900 dark:text-rose-100 font-medium border-b border-b-slate-100 dark:border-b-slate-800/60";
            isRankedColor = true;
        }
    }`,
        `    let rowClass = "bg-white dark:bg-[#072d1f] text-emerald-900 dark:text-emerald-100 border-b border-emerald-100 dark:border-emerald-900/50";
    let isRankedColor = false;

    if (isGrandTotal) {
        rowClass = "bg-emerald-800 dark:bg-emerald-400 text-white dark:text-emerald-950 font-black shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 relative";
    } else if (isSubtotal) {
        rowClass = "bg-emerald-50 dark:bg-emerald-900/60 font-bold text-emerald-900 dark:text-emerald-100 border-b-2 border-emerald-200 dark:border-emerald-800";
    } else if (data.blok !== "LF" && (sortBy === "month" || sortBy === "ytd")) {
        const pct = sortBy === "month" ? data.pctCapaiMonth : data.pctCapaiYtd;
        if (pct >= 100) {
            rowClass = "bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 font-medium border-b border-emerald-100 dark:border-emerald-900/50";
            isRankedColor = true;
        } else if (pct >= 90) {
            rowClass = "bg-teal-50/80 dark:bg-teal-900/40 text-teal-900 dark:text-teal-100 font-medium border-b border-emerald-100 dark:border-emerald-900/50";
            isRankedColor = true;
        } else if (pct >= 70) {
            rowClass = "bg-amber-50/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 font-medium border-b border-emerald-100 dark:border-emerald-900/50";
            isRankedColor = true;
        } else {
            rowClass = "bg-rose-50/80 dark:bg-rose-900/40 text-rose-900 dark:text-rose-100 font-medium border-b border-emerald-100 dark:border-emerald-900/50";
            isRankedColor = true;
        }
    }`
    );

    // 2. We'll find all hover effects and adjust from slate/teal back to emerald
    // We can also adjust the thead header background.
    const theadFind = 'className="sticky top-0 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 z-30 border-b-2 border-slate-200 dark:border-slate-800"';
    const theadReplace = 'className="sticky top-0 bg-[#0c4a34]/95 backdrop-blur-md dark:bg-[#072d1f]/95 text-[10px] uppercase font-bold tracking-widest text-emerald-100 dark:text-emerald-200 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border-b-2 border-emerald-700 dark:border-emerald-800"';
    content = content.replace(theadFind, theadReplace);

    // Some general replacement
    content = content.split('hover:bg-slate-50 dark:hover:bg-slate-800/40').join('hover:bg-emerald-50 dark:hover:bg-emerald-900/40');
    content = content.split('bg-slate-50/50').join('bg-emerald-50/50');
    content = content.split('bg-slate-50 dark:bg-slate-800/80').join('bg-emerald-50 dark:bg-emerald-800/80');
    content = content.split('bg-slate-800 dark:bg-white').join('bg-emerald-800 dark:bg-emerald-400');
    content = content.split('border-slate-100').join('border-emerald-100');
    content = content.split('border-slate-200').join('border-emerald-200');
    content = content.split('border-slate-800/60').join('border-emerald-800/60');
    content = content.split('border-slate-700').join('border-emerald-700');
    content = content.split('text-slate-500').join('text-emerald-600 dark:text-emerald-400');
    content = content.split('text-slate-600').join('text-emerald-700 dark:text-emerald-300');
    content = content.split('text-slate-700').join('text-emerald-800 dark:text-emerald-200');
    content = content.split('dark:text-slate-300').join('dark:text-emerald-100');
    content = content.split('dark:text-slate-400').join('dark:text-emerald-300');
    content = content.split('dark:text-slate-200').join('dark:text-emerald-100');
    
    // Header cells colors
    content = content.split('bg-white/50 dark:bg-slate-900/50').join('bg-transparent');
    content = content.split('bg-slate-50/95 dark:bg-slate-900/95').join('bg-emerald-900/20 dark:bg-emerald-950/20');
    content = content.split('bg-slate-50/80 dark:bg-slate-800/50').join('bg-emerald-800/20 dark:bg-emerald-900/20');
    content = content.split('bg-white/50 dark:bg-slate-800/30').join('bg-emerald-950/10 dark:bg-emerald-950/30');

    content = content.split('dark:bg-slate-900').join('dark:bg-[#072d1f]');

    // Border in the headers
    content = content.split('border-b border-emerald-200 dark:border-slate-800/40 text-slate-600 dark:text-slate-300').join('border-b border-emerald-700/50 dark:border-emerald-800/80 text-emerald-100 dark:text-emerald-200');
    content = content.split('border-b border-emerald-200 dark:border-slate-800/40 text-emerald-600 dark:text-emerald-400 dark:text-slate-400').join('border-b border-emerald-700/50 dark:border-emerald-800/80 text-emerald-100 dark:text-emerald-300');

    // Outer container
    content = content.split('shadow-xl shadow-emerald-200/50 dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]').join('shadow-xl shadow-emerald-900/10 dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]');

    fs.writeFileSync(filepath, content);
}

updateFile('./src/features/dashboard/components/HasilBulananTable.tsx');
