import * as fs from 'fs';

function updateFile(filepath: string) {
    let content = fs.readFileSync(filepath, 'utf8');

    // 1. Update rowClass logic
    content = content.replace(
        `    let rowClass =
      "bg-white dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100";
    let isRankedColor = false;

    if (isGrandTotal) {
      rowClass = "bg-emerald-600 font-black text-white";
    } else if (isSubtotal) {
      rowClass =
        "bg-emerald-100 dark:bg-emerald-900 font-bold text-emerald-900 dark:text-emerald-100";
    } else if (data.blok !== "LF" && (sortBy === "month" || sortBy === "ytd")) {
      // Determines which target percentage context to use
      const pct = sortBy === "month" ? data.pctCapaiMonth : data.pctCapaiYtd;

      if (pct >= 100) {
        rowClass = "bg-emerald-600 text-white font-medium";
        isRankedColor = true;
      } else if (pct >= 90) {
        rowClass =
          "bg-emerald-300 dark:bg-emerald-400 text-emerald-950 font-medium";
        isRankedColor = true;
      } else if (pct >= 70) {
        rowClass =
          "bg-yellow-200 dark:bg-yellow-300 text-yellow-950 font-medium";
        isRankedColor = true;
      } else {
        rowClass = "bg-rose-400 dark:bg-rose-500 text-white font-medium";
        isRankedColor = true;
      }
    }`,
        `    let rowClass = "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-b-slate-100 dark:border-b-slate-800/60";
    let isRankedColor = false;

    if (isGrandTotal) {
        rowClass = "bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 relative";
    } else if (isSubtotal) {
        rowClass = "bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-700";
    } else if (data.blok !== "LF" && (sortBy === "month" || sortBy === "ytd")) {
        const pct = sortBy === "month" ? data.pctCapaiMonth : data.pctCapaiYtd;
        if (pct >= 100) {
            rowClass = "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-900 dark:text-emerald-100 font-medium border-b border-b-slate-100 dark:border-b-slate-800/60";
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
    }`
    );

    // 2. Update border classes and hover states within renderRow
    const lines = content.split('\\n');
    const start_idx = lines.findIndex(l => l.includes('const renderRow ='));
    const end_idx = lines.findIndex((l, i) => i > start_idx && l.includes('  };'));

    for (let i = start_idx; i <= end_idx; i++) {
        lines[i] = lines[i].split("border-emerald-200").join("border-slate-100");
        lines[i] = lines[i].split("dark:border-emerald-800").join("dark:border-slate-800/60");
        lines[i] = lines[i].split("bg-emerald-50 dark:hover:bg-emerald-900/20").join("hover:bg-slate-50 dark:hover:bg-slate-800/40");
        lines[i] = lines[i].split("emerald-400/70").join("slate-400");
        lines[i] = lines[i].split("bg-emerald-50/30").join("bg-slate-50/50");
        lines[i] = lines[i].split("dark:bg-emerald-900/20").join("dark:bg-slate-800/30");
        lines[i] = lines[i].split("border-emerald-400").join("border-slate-200");
        lines[i] = lines[i].split("dark:border-emerald-700").join("dark:border-slate-700");
        
        // Remove left/right borders and use simple bottom borders for sleekness
        lines[i] = lines[i].split("border-r ").join(" ");
        lines[i] = lines[i].split("border-r-2 ").join(" ");
        lines[i] = lines[i].split("border-b border-emerald-200 dark:border-emerald-800 ").join("");
        lines[i] = lines[i].split("border-b border-slate-100 dark:border-slate-800/60 ").join(""); // Cleanup dupes
        lines[i] = lines[i].split("border-b border-b-slate-100 dark:border-b-slate-800/60 ").join(""); // Cleanup dupes
    }

    content = lines.join('\\n');

    // Remove old base border-b in the tr definition if any remains
    content = content.replace(
        'className={`${rowClass} border-b border-emerald-200 dark:border-emerald-800 transition-colors',
        'className={`${rowClass} transition-colors cursor-pointer'
    );

    // 3. Update table parent and thead styling
    content = content.replace(
        'className="w-full border-collapse bg-white dark:bg-emerald-900 shadow-xl"',
        'className="w-full border-collapse bg-white dark:bg-slate-900"'
    );

    content = content.replace(
        'className="sticky top-0 bg-emerald-900 text-[10px] uppercase font-black tracking-wider text-white z-30 shadow-md"',
        'className="sticky top-0 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 z-30 border-b-2 border-slate-200 dark:border-slate-800"'
    );

    // Replace classes manually inside thead (bg-emerald -> transparent or slate, border-emerald -> slate)
    content = content.split('bg-emerald-900').join('bg-white/50 dark:bg-slate-900/50');
    content = content.split('bg-emerald-950').join('bg-slate-50/95 dark:bg-slate-900/95');
    content = content.split('bg-emerald-800').join('bg-slate-50/80 dark:bg-slate-800/50');
    content = content.split('bg-emerald-700').join('text-slate-500 dark:text-slate-400 font-semibold bg-white/50 dark:bg-slate-800/30');
    content = content.split('border-emerald-800').join('border-b border-slate-200 dark:border-slate-800/40 text-slate-600 dark:text-slate-300');
    content = content.split('border-emerald-700').join('border-b border-slate-200 dark:border-slate-800/40 text-slate-500 dark:text-slate-400');
    
    // Remove left and right borders from the header 
    content = content.split('border ').join(" ");
    content = content.split('border-x-2 ').join(" ");
    
    // Make padding slightly larger for Modern UI
    content = content.split(' p-2 ').join(' py-3 px-2 ');
    content = content.split(' p-1 ').join(' py-2 px-1 ');

    // Outer UI cleanups
    // The previous error was due to the backslashes in regex literal, here using split is safe.
    content = content.split('bg-emerald-950 rounded-3xl').join('bg-white dark:bg-slate-900 rounded-3xl');
    
    // Some manual find and replace to remove the heavy table border/shadows
    content = content.split('bg-white dark:bg-slate-900 border-2 border-emerald-900/30 dark:border-emerald-800 shadow-2xl shadow-emerald-900/10').join('bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]');

    fs.writeFileSync(filepath, content);
    console.log("Updated!");
}

updateFile('./src/features/dashboard/components/HasilBulananTable.tsx');
