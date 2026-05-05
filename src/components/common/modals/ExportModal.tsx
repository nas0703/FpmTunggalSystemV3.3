import React from "react";
import { Download, X, Loader2 } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  setReportType: (id: string) => void;
  exportFilter: "all" | "date" | "month";
  setExportFilter: (filter: "all" | "date" | "month") => void;
  exportMonth: string;
  setExportMonth: (val: string) => void;
  exportDate: string;
  setExportDate: (val: string) => void;
  exportColumns: string[];
  setExportColumns: (cols: string[]) => void;
  isExporting: boolean;
  exportToExcel: () => void;
}

export function ExportModal({
  isOpen,
  onClose,
  reportType,
  setReportType,
  exportFilter,
  setExportFilter,
  exportMonth,
  setExportMonth,
  exportDate,
  setExportDate,
  exportColumns,
  setExportColumns,
  isExporting,
  exportToExcel,
}: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-black text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <Download size={20} className="text-emerald-500" />
            Muat Turun Excel
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 block ml-1">
              Jenis Laporan
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              {(
                [
                  { id: "hasil", label: "CAPAI" },
                  { id: "muda", label: "Muda" },
                  { id: "kpa_kpg", label: "Kpg=Kpa" },
                  { id: "efb", label: "EFB" },
                  { id: "efc_format", label: "Efc Format" },
                ] as const
              ).map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReportType(r.id)}
                  className={`py-2 px-1 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${reportType === r.id ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 block ml-1">
              Pilihan Muat Turun
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setExportFilter("all")}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${exportFilter === "all" ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
              >
                Semua
              </button>
              <button
                onClick={() => setExportFilter("month")}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${exportFilter === "month" ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
              >
                Bulan
              </button>
              <button
                onClick={() => setExportFilter("date")}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${exportFilter === "date" ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
              >
                Tarikh
              </button>
            </div>
          </div>

          {exportFilter === "month" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                Pilih Bulan
              </label>
              <input
                type="month"
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          )}

          {exportFilter === "date" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                Pilih Tarikh
              </label>
              <input
                type="date"
                value={exportDate}
                onChange={(e) => setExportDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 block ml-1">
              Pilihan Kolum
            </label>
            <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
              {[
                { id: "tarikh", label: "Tarikh" },
                { id: "no_resit", label: "Resit" },
                { id: "no_lori", label: "Lori" },
                { id: "no_seal", label: "Seal" },
                { id: "no_nota", label: "Nota" },
                { id: "kpg", label: "KPG" },
                { id: "blok", label: "Blok" },
                { id: "peringkat", label: "Pkt" },
                { id: "tan", label: "Tan" },
                { id: "muda", label: "Muda" },
                { id: "thek", label: "T/H" },
                { id: "masa", label: "Masa" },
                { id: "created", label: "Cipta" },
              ].map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    if (exportColumns.includes(col.id)) {
                      if (exportColumns.length > 1)
                        setExportColumns(
                          exportColumns.filter((c) => c !== col.id),
                        );
                    } else {
                      setExportColumns([...exportColumns, col.id]);
                    }
                  }}
                  className={`px-2 py-1 text-[8px] font-black rounded-lg border transition-all uppercase tracking-tighter ${exportColumns.includes(col.id) ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"}`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-2">
            <button
              onClick={exportToExcel}
              disabled={isExporting}
              className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isExporting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isExporting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Download size={16} />
              )}
              <span className="text-xs">
                {isExporting
                  ? "Menjana Fail..."
                  : "Muat Turun Excel (.xlsx)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
