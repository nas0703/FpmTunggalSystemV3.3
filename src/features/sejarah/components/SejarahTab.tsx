import React, { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { History, X, Download, Trash2, Edit2, ArrowDownCircle, Search } from "lucide-react";
import { Transaction } from "../../../App";

interface SejarahTabProps {
  rawData: Transaction[];
  historyFilterDate: string;
  setHistoryFilterDate: (date: string) => void;
  setShowExportModal: (show: boolean) => void;
  setRecordToDelete: (no_resit: string | null) => void;
  onEditRecord: (record: Transaction) => void;
  authRole: "staff" | "fc" | "afc" | "fs" | null;
}

// Timezone safe and local-format date formatter (Avoids day shift errors for client offsets)
const formatTarikhMalay = (tarikhStr: string) => {
  if (!tarikhStr) return "-";
  const parts = tarikhStr.split('-');
  if (parts.length === 3) {
    const m = parts[1];
    const d = parts[2];
    const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"];
    const monthIndex = parseInt(m, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${parseInt(d, 10)} ${months[monthIndex]}`;
    }
  }
  // Fallback
  try {
    const d = new Date(tarikhStr);
    if (!isNaN(d.getTime())) {
      const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      return localDate.toLocaleDateString("ms-MY", { day: "2-digit", month: "short" });
    }
  } catch {}
  return tarikhStr;
};

export const SejarahTab: React.FC<SejarahTabProps> = ({
  rawData,
  historyFilterDate,
  setHistoryFilterDate,
  setShowExportModal,
  setRecordToDelete,
  onEditRecord,
  authRole,
}) => {
  const [activeTab, setActiveTab] = useState<"bts" | "efb">("bts");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // HAD RENDERING AWAL (Hanya paparkan 25 rekod pada satu masa untuk kelancaran)
  const [visibleLimit, setVisibleLimit] = useState<number>(25);

  // Setkan semula had jika penapis atau tab bertukar untuk menjaga kelancaran memori
  useEffect(() => {
    setVisibleLimit(25);
  }, [activeTab, historyFilterDate, searchQuery]);

  // ULTRA HIGH PERFORMANCE MEMOIZATION OF FILTERED TRANS
  const filteredData = useMemo(() => {
    // 1. Isihan Berdasarkan Jenis (BTS vs EFB)
    let data = (rawData || []).filter((row) => {
      const isEfb = row.peringkat === "EFB" || row.is_efb === true;
      return activeTab === "efb" ? isEfb : !isEfb;
    });

    // 2. Isihan disusun secara menurun (Terbaru didahulukan)
    data = [...data].sort((a, b) => {
      return (b.tarikh || "").localeCompare(a.tarikh || "");
    });

    // 3. Tapis tarikh atau Carian No Resit/Nota/Lori
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      data = data.filter((row) => {
        const resit = (row.no_resit || "").toLowerCase();
        const nota = (row.no_nota_hantaran || "").toLowerCase();
        const akaun = (row.no_akaun_terima || "").toLowerCase();
        const lori = (row.no_lori || "").toLowerCase();
        const seal = (row.no_seal || "").toLowerCase();
        const blok = `b${row.blok || ""}`.toLowerCase();
        return (
          resit.includes(q) || 
          nota.includes(q) || 
          akaun.includes(q) || 
          lori.includes(q) || 
          seal.includes(q) ||
          blok.includes(q)
        );
      });
    } else if (historyFilterDate) {
      data = data.filter((row) => row.tarikh === historyFilterDate);
    } else {
      // TEMPORAL WINDOWING: Had paparan automatik hanya data 3 bulan terakhir sahaja.
      // Ciri ini memotong carian beratus baris yang membebankan rendering awal.
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      const thresholdDate = threeMonthsAgo.toISOString().split("T")[0];
      
      data = data.filter((row) => {
        const rowDate = row.tarikh || "";
        return rowDate >= thresholdDate;
      });
    }

    return data;
  }, [rawData, activeTab, historyFilterDate, searchQuery]);

  // CHUNK SLICING (Hanya muat turun baris dalam had memori kecil pelayar)
  const displayedData = useMemo(() => {
    return filteredData.slice(0, visibleLimit);
  }, [filteredData, visibleLimit]);

  const hasMore = filteredData.length > visibleLimit;
  const isEfb = activeTab === "efb";

  return (
    <div className="w-full">
      <div className="animate-in fade-in slide-in-from-right-4 duration-200">
        
        {/* Header & Filters */}
        <div className="flex flex-col items-center justify-center gap-3 mb-4">
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> Sejarah Harian ({activeTab.toUpperCase()})
          </h2>

          <div className="flex justify-center w-full px-4 mb-2">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 flex justify-center rounded-2xl w-full max-w-sm">
              <button
                onClick={() => setActiveTab("bts")}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === "bts"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 hover:text-emerald-600"
                }`}
              >
                BTS
              </button>
              <button
                onClick={() => setActiveTab("efb")}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === "efb"
                    ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-slate-500 hover:text-purple-600"
                }`}
              >
                EFB
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2 w-full px-4">
            {/* Tapis Tarikh */}
            <div className="relative flex-1 max-w-[150px]">
              <input
                type="date"
                value={historyFilterDate}
                onChange={(e) => {
                  setHistoryFilterDate(e.target.value);
                  if (e.target.value) {
                    setSearchQuery(""); // Auto clear text search if specific date is manually filtered
                  }
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono tracking-tighter"
              />
              {historyFilterDate && (
                <button
                  onClick={() => setHistoryFilterDate("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Tombol Toggle Carian (Search Toggle) */}
            <button
              onClick={() => {
                const nextShowSearch = !showSearch;
                setShowSearch(nextShowSearch);
                if (nextShowSearch) {
                  setHistoryFilterDate(""); // Auto clear specific date to allow searching across other dates
                } else {
                  setSearchQuery(""); // Cancel/clear search on closing
                }
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                showSearch || searchQuery.trim()
                  ? "bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
              title="Cari No. Resit / Nota / Lori"
            >
              <Search size={14} className="stroke-[2.5]" />
            </button>

            {/* Export (Excel) Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-4 py-2.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-sm shrink-0 uppercase"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export (Excel)</span>
            </button>
          </div>
        </div>

        {/* Slot Input Carian (Animasi Slide Down) */}
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full px-4 mb-3"
          >
            <div className="relative w-full max-w-sm mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan No. Resit, Nota, atau Lori..."
                className={`w-full py-2.5 pl-9 pr-8 bg-white dark:bg-slate-900 border text-xs font-black rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all ${
                  searchQuery.trim() 
                    ? "border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                    : "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                }`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={14} className={`${searchQuery.trim() ? "text-emerald-500 animate-pulse" : ""}`} />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {searchQuery.trim() && (
              <p className="text-[9px] text-center text-emerald-500 font-black uppercase tracking-widest mt-1.5 animate-pulse">
                🔍 Mencari merentasi semua tarikh rekod BTS/EFB...
              </p>
            )}
          </motion.div>
        )}

        {/* Note on Automatic Pagination Filter */}
        {!historyFilterDate && !searchQuery.trim() && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold px-2 py-1 mb-2 tracking-wide text-center">
            * Memaparkan rekod 3 bulan terakhir sahaja untuk kelajuan aplikasi. Sila tapis tarikh untuk rekod lampau.
          </p>
        )}

        {searchQuery.trim() && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black px-2 py-1.5 mb-2 tracking-wide text-center bg-emerald-500/10 border border-emerald-500/25 rounded-xl mx-4">
            ✓ Mod Pencarian Global Aktif: Edit mana-mana resit/nota lama merentasi tarikh pilihan terus.
          </p>
        )}

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {displayedData.length === 0 ? (
            <p className="text-center p-8 text-xs font-bold text-slate-400">
              Tiada rekod ditemui.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-emerald-50/70 dark:bg-emerald-950/20 text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap">Tarikh</th>
                      <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap">Resit / Nota</th>
                      <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap">Lori / Seal</th>
                      {!isEfb && (
                        <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap text-center">Muda</th>
                      )}
                      <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap text-center">Blok</th>
                      {!isEfb && (
                        <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap text-center">KPG</th>
                      )}
                      <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 text-right whitespace-nowrap">Tan</th>
                      {!isEfb && (
                        <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 text-right whitespace-nowrap font-bold">CAPAI (RM)</th>
                      )}
                      <th className="px-3 py-3 border-b border-emerald-100 dark:border-emerald-800 whitespace-nowrap text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.map((row, i) => (
                      <tr 
                        key={row.no_resit || i} 
                        className="border-b border-slate-100 dark:border-slate-800/50 text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-colors"
                      >
                        <td className="px-3 py-3.5 font-bold">
                          {formatTarikhMalay(row.tarikh)}
                        </td>
                        <td className="px-3 py-3.5 font-mono tracking-tighter whitespace-nowrap">
                          <div className="font-black text-emerald-900 dark:text-white uppercase truncate max-w-[120px]">
                            {row.no_resit}
                          </div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 flex flex-col mt-0.5">
                            {row.no_nota_hantaran && row.no_nota_hantaran !== row.no_resit && (
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
                        <td className="px-3 py-3.5 uppercase whitespace-nowrap">
                          <div className="font-black truncate max-w-[100px]">{row.no_lori}</div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">{row.no_seal || "-"}</div>
                        </td>
                        {!isEfb && (
                          <td className="px-3 py-3.5 font-black text-rose-500 text-center whitespace-nowrap">{row.muda}</td>
                        )}
                        <td className="px-3 py-3.5 whitespace-nowrap text-center">
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
                        {!isEfb && (
                          <td className={`px-3 py-3.5 font-black text-center whitespace-nowrap ${
                            parseFloat(row.kpg || "0") >= 21 
                              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg" 
                              : "text-slate-400 dark:text-slate-500"
                          }`}>
                            {row.kpg || "-"}
                          </td>
                        )}
                        <td className="px-3 py-3.5 text-right font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-900/10 rounded-lg whitespace-nowrap">
                          {row.tan.toFixed(2)}
                        </td>
                        {!isEfb && (
                          <td className="px-3 py-3.5 text-right font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            {row.hasil_rm > 0
                              ? row.hasil_rm.toLocaleString("ms-MY", {
                                  minimumFractionDigits: 2,
                                })
                              : "-"}
                          </td>
                        )}
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          {(authRole === "staff" || authRole === "fc") && (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onEditRecord(row)}
                                className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
                                title="Kemaskini Rekod"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setRecordToDelete(row.no_resit)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
                                title="Padam Rekod"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* BUTANG PAGINATION (DYNAMIC LOAD MORE) */}
              {hasMore && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 flex justify-center bg-slate-50/50">
                  <button
                    onClick={() => setVisibleLimit((prev) => prev + 25)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-emerald-600 text-xs font-black uppercase tracking-wider rounded-2xl border border-slate-200 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <ArrowDownCircle size={14} className="animate-bounce" />
                    Tunjukkan Lagi (+{filteredData.length - visibleLimit} rekod)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
