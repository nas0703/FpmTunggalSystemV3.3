import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Sun, Moon } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  isDarkMode,
  setIsDarkMode,
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-[#0f172a] rounded-[32px] p-0 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Settings size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white text-lg leading-tight">
                    Tetapan
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                    App Configuration
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 p-2 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {/* Visual Preference Section */}
              <section>
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">
                  Paparan Visual
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${!isDarkMode ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-600" : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-400"}`}
                  >
                    <Sun size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Cahaya
                    </span>
                  </button>
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${isDarkMode ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400" : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-400"}`}
                  >
                    <Moon size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Gelap
                    </span>
                  </button>
                </div>
              </section>

              <div className="pt-2 text-center pb-6">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                  FPMSB TUNGGAL v3.3 • 2026
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
