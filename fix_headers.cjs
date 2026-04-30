const fs = require('fs');

let content = fs.readFileSync('src/features/dashboard/components/ReportSummarySection.tsx', 'utf8');

const targetPattern1 = `{(showDetails || isPkt1 || isPkt2 || isFelda) && (
            <div className="flex flex-col gap-1 h-full">`;

const replacement1 = `{(showDetails || isPkt1 || isPkt2 || isFelda) && (
            <div className="flex flex-col gap-1 h-full pt-1.5">
              {mode === "details" && (
                <div className="flex items-center justify-center py-1 mb-1 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
                  <Calendar size={10} className="text-emerald-500 mr-1.5" />
                  <h3 className="text-[7.5px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none">
                    {period === "day"
                      ? "HARI INI"
                      : period === "month"
                        ? "BULAN INI"
                        : "TAHUN INI"}
                  </h3>
                </div>
              )}`;

content = content.replaceAll(targetPattern1, replacement1);

const pkt1Pattern = /\{showDetails && \(\s*<p\s*className=\{\`text-\[.*?px\].*?\`\}\s*>\s*PERINGKAT 1\s*<\/p>\s*\)\}/g;
const pkt2Pattern = /\{showDetails && \(\s*<p\s*className=\{\`text-\[.*?px\].*?\`\}\s*>\s*PERINGKAT 2\s*<\/p>\s*\)\}/g;
const feldaPattern = /\{showDetails && \(\s*<p\s*className=\{\`text-\[.*?px\].*?\`\}\s*>\s*LOT FELDA\s*<\/p>\s*\)\}/g;

const replacementPkt1 = `{showDetails && period === "day" && (
                    <div className="absolute -top-2.5 left-1 z-10 p-0 pointer-events-none">
                      <div className="bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-md px-1.5 py-0.5 rounded-sm">
                        <p className="text-[6px] font-black text-white uppercase tracking-[0.1em] leading-none">
                          PERINGKAT 1
                        </p>
                      </div>
                    </div>
                  )}`;

const replacementPkt2 = `{showDetails && period === "day" && (
                    <div className="absolute -top-2.5 left-1 z-10 p-0 pointer-events-none">
                      <div className="bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-md px-1.5 py-0.5 rounded-sm">
                        <p className="text-[6px] font-black text-white uppercase tracking-[0.1em] leading-none">
                          PERINGKAT 2
                        </p>
                      </div>
                    </div>
                  )}`;

const replacementFelda = `{showDetails && period === "day" && (
                    <div className="absolute -top-2.5 left-1 z-10 p-0 pointer-events-none">
                      <div className="bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-md px-1.5 py-0.5 rounded-sm">
                        <p className="text-[6px] font-black text-white uppercase tracking-[0.1em] leading-none">
                          LOT FELDA
                        </p>
                      </div>
                    </div>
                  )}`;

content = content.replaceAll(pkt1Pattern, replacementPkt1);
content = content.replaceAll(pkt2Pattern, replacementPkt2);
content = content.replaceAll(feldaPattern, replacementFelda);

content = content.replaceAll(
  `className="bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col justify-center"`, 
  `className="bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col justify-center mt-1"`
);

content = content.replaceAll(
  `className="space-y-0 h-full flex flex-col"`, 
  `className="space-y-0 h-full flex flex-col relative"`
);

fs.writeFileSync('src/features/dashboard/components/ReportSummarySection.tsx', content);
