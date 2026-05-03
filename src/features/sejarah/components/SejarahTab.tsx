import React, { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "motion/react";
import { History, X, Download, Trash2 } from "lucide-react";
import { Transaction } from "../../../App";

interface SejarahTabProps {
  historyFilterDate: string;
  setHistoryFilterDate: Dispatch<SetStateAction<string>>;
  setShowExportModal: Dispatch<SetStateAction<boolean>>;
  rawData: Transaction[];
  setRecordToDelete: Dispatch<SetStateAction<string | null>>;
}

export const SejarahTab: React.FC<SejarahTabProps> = ({
  historyFilterDate,
  setHistoryFilterDate,
  setShowExportModal,
  rawData,
  setRecordToDelete,
}) => {
  return (
    <div className="w-full">
      <div className="animate-in slide-in-from-right-8 duration-300">
        <div className="flex flex-col items-center justify-center gap-3 mb-4">
          <h2 className="text-xs font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> Sejarah Harian
          </h2>

          <div className="flex justify-center gap-2 w-full px-4">
            <div className="relative flex-1 max-w-[200px]">
              <input
                type="date"
                value={historyFilterDate}
                onChange={(e) => setHistoryFilterDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              {historyFilterDate && (
                <button
                  onClick={() => setHistoryFilterDate("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExportModal(true)}
              className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-sm shrink-0"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export (Excel)</span>
            </motion.button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {(() => {
            let filteredData = rawData || [];
            if (historyFilterDate) {
              filteredData = filteredData.filter(
                (row) => row.tarikh === historyFilterDate,
              );
            } else {
              const now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
              const threeMonthsAgo = new Date(now);
              threeMonthsAgo.setMonth(now.getMonth() - 3);
              const thresholdDate = threeMonthsAgo.toISOString().split("T")[0];
              filteredData = filteredData.filter(
                (row) => row.tarikh >= thresholdDate,
              );
            }

            if (filteredData.length === 0) {
              return (
                <p className="text-center p-6 text-xs font-bold text-slate-400">
                  Tiada rekod hantaran dalam 3 bulan terakhir.
                </p>
              );
            }

            return (
              <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-emerald-50 dark:bg-emerald-900/50 text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap">
                        Tarikh
                      </th>
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap">
                        Resit / Nota
                      </th>
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap">
                        Lori / Seal
                      </th>
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap text-center">
                        Muda
                      </th>
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap text-center">
                        Blok
                      </th>
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap text-center">
                        KPG
                      </th>
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 text-right whitespace-nowrap">
                        Tan
                      </th>
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 text-right whitespace-nowrap">
                        CAPAI (RM)
                      </th>
                      <th className="p-3 border-b border-emerald-100 dark:border-emerald-800 text-center whitespace-nowrap">
                        Tindakan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    <AnimatePresence>
                      {filteredData.map((row, i) => (
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          key={row.no_resit || i}
                          className="border-b border-emerald-50 dark:border-emerald-900/20 last:border-0 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                        >
                          <td className="p-3 whitespace-nowrap">
                            {new Date(row.tarikh).toLocaleDateString("ms-MY", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </td>
                          <td className="p-3 font-mono tracking-tighter whitespace-nowrap">
                            <div className="font-black text-emerald-900 dark:text-white uppercase truncate max-w-[120px]">
                              {row.no_resit}
                            </div>
                            <div className="text-[9px] text-slate-400 dark:text-slate-500 flex flex-col mt-0.5">
                              {row.no_nota_hantaran &&
                                row.no_nota_hantaran !== row.no_resit && (
                                  <span className="truncate max-w-[120px]">
                                    Nota: {row.no_nota_hantaran}
                                  </span>
                                )}
                              {row.no_akaun_terima && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-black truncate max-w-[120px]">
                                  Akaun: {row.no_akaun_terima}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 uppercase whitespace-nowrap">
                            <div className="font-black truncate max-w-[100px]">
                              {row.no_lori}
                            </div>
                            <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">
                              {row.no_seal || "-"}
                            </div>
                          </td>
                          <td className="p-3 font-black text-rose-500 text-center whitespace-nowrap">
                            {row.muda}
                          </td>
                          <td className="p-3 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-black text-emerald-700 dark:text-emerald-400">
                                B{row.blok}
                              </span>
                              {row.peringkat === "EFB" && (
                                <span className="text-[8px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-md font-black mt-1 w-fit">
                                  EFB
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className={`p-3 font-black text-center whitespace-nowrap ${parseFloat(row.kpg || "0") >= 21 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg" : "text-slate-400 dark:text-slate-500"}`}
                          >
                            {row.kpg || "-"}
                          </td>
                          <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-900/10 rounded-lg whitespace-nowrap">
                            {row.tan.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            {(row.hasil_rm || 0).toLocaleString("ms-MY", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => setRecordToDelete(row.no_resit)}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors shadow-sm"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
