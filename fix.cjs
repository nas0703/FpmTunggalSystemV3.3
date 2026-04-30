const fs = require('fs');
let s = fs.readFileSync('src/features/dashboard/components/ReportSummarySection.tsx', 'utf8');
const search = `{mode === "details" && (
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
s = s.split(search).join('');
fs.writeFileSync('src/features/dashboard/components/ReportSummarySection.tsx', s);
