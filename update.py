import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Update rowClass logic
    content = re.sub(
        r'''    let rowClass =
      "bg-white dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100";
    let isRankedColor = false;

    if \(isGrandTotal\) \{
      rowClass = "bg-emerald-600 font-black text-white";
    \} else if \(isSubtotal\) \{
      rowClass =
        "bg-emerald-100 dark:bg-emerald-900 font-bold text-emerald-900 dark:text-emerald-100";
    \} else if \(data\.blok !== "LF" && \(sortBy === "month" \|\| sortBy === "ytd"\)\) \{
      // Determines which target percentage context to use
      const pct = sortBy === "month"\ ? data\.pctCapaiMonth : data\.pctCapaiYtd;

      if \(pct >= 100\) \{
        rowClass = "bg-emerald-600 text-white font-medium";
        isRankedColor = true;
      \} else if \(pct >= 90\) \{
        rowClass =
          "bg-emerald-300 dark:bg-emerald-400 text-emerald-950 font-medium";
        isRankedColor = true;
      \} else if \(pct >= 70\) \{
        rowClass =
          "bg-yellow-200 dark:bg-yellow-300 text-yellow-950 font-medium";
        isRankedColor = true;
      \} else \{
        rowClass = "bg-rose-400 dark:bg-rose-500 text-white font-medium";
        isRankedColor = true;
      \}
    \}''',
        '''    let rowClass = "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300";
    let isRankedColor = false;

    if (isGrandTotal) {
      rowClass = "bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 relative";
    } else if (isSubtotal) {
      rowClass = "bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-700";
    } else if (data.blok !== "LF" && (sortBy === "month" || sortBy === "ytd")) {
      const pct = sortBy === "month" ? data.pctCapaiMonth : data.pctCapaiYtd;
      if (pct >= 100) {
        rowClass = "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-900 dark:text-emerald-100 font-medium";
        isRankedColor = true;
      } else if (pct >= 90) {
        rowClass = "bg-teal-50/50 dark:bg-teal-900/10 text-teal-900 dark:text-teal-100 font-medium";
        isRankedColor = true;
      } else if (pct >= 70) {
        rowClass = "bg-amber-50/50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 font-medium";
        isRankedColor = true;
      } else {
        rowClass = "bg-rose-50/50 dark:bg-rose-900/10 text-rose-900 dark:text-rose-100 font-medium";
        isRankedColor = true;
      }
    }''',
        content
    )

    # 2. Update border classes and hover states within renderRow
    # Find the bounds of renderRow
    import copy
    lines = content.split('\\n')
    start_idx = next(i for i, l in enumerate(lines) if 'const renderRow =' in l)
    end_idx = next(i for i, l in enumerate(lines) if '  };' in l and i > start_idx)

    # In that section, replace emerald specific classes with slate
    for i in range(start_idx, end_idx):
        lines[i] = lines[i].replace("border-emerald-200", "border-slate-100")
        lines[i] = lines[i].replace("dark:border-emerald-800", "dark:border-slate-800/60")
        lines[i] = lines[i].replace("bg-emerald-50 dark:hover:bg-emerald-900/20", "bg-slate-50 dark:hover:bg-slate-800/40")
        lines[i] = lines[i].replace("emerald-400/70", "slate-400")
        lines[i] = lines[i].replace("bg-emerald-50/30", "bg-slate-50/50")
        lines[i] = lines[i].replace("dark:bg-emerald-900/20", "dark:bg-slate-800/30")
        lines[i] = lines[i].replace("border-emerald-400", "border-slate-200")
        lines[i] = lines[i].replace("dark:border-emerald-700", "dark:border-slate-700")

    content = '\\n'.join(lines)

    # 3. Update table parent and thead styling
    content = content.replace(
        'className="w-full border-collapse bg-white dark:bg-emerald-900 shadow-xl"',
        'className="w-full border-collapse bg-white dark:bg-slate-900 drop-shadow-sm"'
    )

    content = content.replace(
        'className="sticky top-0 bg-emerald-900 text-[10px] uppercase font-black tracking-wider text-white z-30 shadow-md"',
        'className="sticky top-0 bg-slate-50/95 backdrop-blur-md dark:bg-slate-900/95 text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 z-30 shadow-[0_1px_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)] border-b border-slate-200 dark:border-slate-800"'
    )

    # Replace classes manually inside thead (bg-emerald -> transparent or slate, border-emerald -> slate)
    content = content.replace('bg-emerald-900', '')
    content = content.replace('bg-emerald-950', 'bg-slate-50/95 dark:bg-slate-900/95')
    content = content.replace('bg-emerald-800', '')
    content = content.replace('bg-emerald-700', 'text-slate-500 dark:text-slate-400 font-semibold bg-white/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800/50')
    content = content.replace('border-emerald-800', 'border-slate-150 dark:border-slate-800/40 text-slate-600 dark:text-slate-300')
    content = content.replace('border-emerald-700', 'border-slate-150 dark:border-slate-800/40 text-slate-500 dark:text-slate-400')
    
    # 4. Clean up headers padding
    content = content.replace('p-2', 'py-3 px-2 font-medium')
    content = content.replace('p-1', 'py-2 px-1 font-medium')

    # Some outer UI cleanups
    content = content.replace('bg-emerald-950 rounded-3xl', 'bg-white dark:bg-slate-900 rounded-3xl')
    content = content.replace('bg-emerald-950 border-2 border-emerald-900/30', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md')
    content = content.replace('shadow-emerald-900/10', 'shadow-slate-200/50 dark:shadow-none')

    with open(filepath, 'w') as f:
        f.write(content)

update_file('/src/features/dashboard/components/HasilBulananTable.tsx')
