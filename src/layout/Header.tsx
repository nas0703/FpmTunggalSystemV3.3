import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Leaf, ChevronDown, Moon, Info, Download, 
  Settings, HelpCircle, LogOut 
} from 'lucide-react';
import { ReportTab } from '../components/common/ReportTab';

interface HeaderProps {
  authRole: string | null;
  showUserMenu: boolean;
  setShowUserMenu: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  setShowNewFeaturesModal: (val: boolean) => void;
  setShowExportModal: (val: boolean) => void;
  setShowSettingsModal: (val: boolean) => void;
  handleLogout: () => void;
  userMenuRef: React.RefObject<HTMLDivElement>;
  activeTab: string;
  reportTabs: any[];
  setReportTabs: (val: any[]) => void;
  reportType: string;
  setReportType: (val: string) => void;
  isReordering: boolean;
  setIsReordering: (val: boolean) => void;
  longPressTimer: React.MutableRefObject<any>;
}

export const Header: React.FC<HeaderProps> = ({
  authRole,
  showUserMenu,
  setShowUserMenu,
  isDarkMode,
  setIsDarkMode,
  setShowNewFeaturesModal,
  setShowExportModal,
  setShowSettingsModal,
  handleLogout,
  userMenuRef,
  activeTab,
  reportTabs,
  setReportTabs,
  reportType,
  setReportType,
  isReordering,
  setIsReordering,
  longPressTimer
}) => {
  return (
    <header className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 pt-12 pb-8 px-5 rounded-b-[48px] shadow-2xl relative z-40 border-b border-white/5">
      {/* Modern decorative elements */}
      <div className="absolute inset-0 rounded-b-[48px] overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/5 rounded-full blur-[80px] -ml-24 -mb-24" />
      </div>

      <div className="relative z-50 flex justify-between items-start mb-4">
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-[22px] border border-white/10 flex items-center justify-center shadow-2xl shrink-0 group transition-all duration-500 hover:bg-emerald-500/20 hover:border-emerald-500/30">
            <Leaf
              className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-transform duration-500 group-hover:rotate-12"
              size={28}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-widest leading-none uppercase drop-shadow-lg">
              FPMSB TUNGGAL
              <div className="flex items-center gap-2 mt-2.5">
                <span className="inline-block px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] sm:text-[10px] font-sans font-black text-emerald-300 tracking-widest uppercase">
                  Version 3.3
                </span>
                <div className="h-px bg-white/10 flex-grow max-w-[40px]" />
              </div>
              <span className="block text-[10px] sm:text-[11px] font-sans font-black text-emerald-400/90 tracking-[0.25em] mt-1.5 uppercase opacity-90">
                Integrated Plantation Data System
              </span>
              <span className="block text-[8px] sm:text-[9px] font-sans font-medium text-emerald-200/50 tracking-[0.3em] mt-1 uppercase">
                Sistem Maklumat Ladang Bersepadu
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all shadow-lg active:scale-[0.97] z-50 group"
              aria-label="User Menu"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-inner ring-2 ring-white/10 group-hover:ring-emerald-400 transition-all">
                {authRole === "fc"
                  ? "FC"
                  : authRole === "afc"
                    ? "AFC"
                    : authRole === "fs"
                      ? "FS"
                      : "O"}
              </div>
              <div className="hidden sm:flex flex-col items-start mr-1">
                <span className="text-[10px] font-black text-white uppercase leading-none">
                  {authRole === "fc"
                    ? "Field Controller (FC)"
                    : authRole === "afc"
                      ? "Asst. Field Controller (AFC)"
                      : authRole === "fs"
                        ? "Field Supervisor (FS)"
                        : "Operator"}
                </span>
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
                  Online
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-white/50 transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 w-56 bg-slate-900/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden"
                >
                  {/* User Profile Header */}
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg ring-2 ring-emerald-500/20">
                        {authRole === "fc"
                          ? "FC"
                          : authRole === "afc"
                            ? "AFC"
                            : authRole === "fs"
                              ? "FS"
                              : "O"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-black text-white uppercase truncate">
                          {authRole === "fc"
                            ? "Field Controller (FC)"
                            : authRole === "afc"
                              ? "Asst. Field Controller (AFC)"
                              : authRole === "fs"
                                ? "Field Supervisor (FS)"
                                : "Operator"}
                        </p>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                          {authRole === "fc" || authRole === "afc"
                            ? "Akses Penuh"
                            : "Akses Terhad"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-0.5">
                    {/* DARK MODE TOGGLE */}
                    <div className="w-full flex items-center justify-between px-2.5 py-1 text-white/70 bg-white/5 rounded-xl border border-white/5 mb-1.5 mt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                          <Moon size={16} className="text-slate-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                          Mod Gelap
                        </span>
                      </div>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? "bg-emerald-500" : "bg-slate-700"}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-5.5" : "translate-x-1"}`}
                        />
                      </button>
                    </div>

                    {/* SYSTEM STATUS */}
                    <div className="w-full flex items-center justify-between px-2.5 py-1 text-white/70 bg-white/5 rounded-xl border border-white/5 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                          Sistem
                        </span>
                      </div>
                      <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-md uppercase tracking-tighter">
                        Online
                      </span>
                    </div>

                    {/* MENU ITEMS */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setShowNewFeaturesModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                            <Info size={16} className="text-cyan-400" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Ciri Baharu
                          </span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      </button>

                      <button
                        onClick={() => {
                          setShowExportModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-2.5 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                      >
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                          <Download size={16} className="text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Muat Turun Excel
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowSettingsModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-2.5 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                      >
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-slate-500/20 transition-all">
                          <Settings size={16} className="text-slate-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Tetapan
                        </span>
                      </button>

                      <a
                        href="https://wa.me/601138404285?text=Salam%2C%20saya%20memerlukan%20bantuan%20berkenaan%20aplikasi%20FPMSB%20Tunggal."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-2.5 py-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                      >
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                          <HelpCircle size={16} className="text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Bantuan
                        </span>
                      </a>
                    </div>

                    <div className="h-px bg-white/5 my-2 mx-1" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center">
                        <LogOut size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Log Keluar
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Toggle Laporan (Dashboard) */}
      {(authRole === "fc" || authRole === "afc" || authRole === "fs") &&
        activeTab === "dashboard" && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
            {/* Level 1: Jenis Laporan (Pill Style) - Scrollable */}
            <Reorder.Group
              axis="x"
              values={reportTabs}
              onReorder={setReportTabs}
              className="flex w-full overflow-x-auto scrollbar-hide bg-black/30 p-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-inner gap-1"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {reportTabs.map((r) => (
                <ReportTab
                  key={r.id}
                  r={r}
                  reportType={reportType}
                  setReportType={setReportType}
                  isReordering={isReordering}
                  setIsReordering={setIsReordering}
                  longPressTimer={longPressTimer}
                />
              ))}
            </Reorder.Group>
          </div>
        )}
    </header>
  );
};
