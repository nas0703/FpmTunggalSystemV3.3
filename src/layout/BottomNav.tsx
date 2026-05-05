import React from 'react';
import { motion } from 'framer-motion';
import { ScanLine, LayoutDashboard, Calendar } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  handleTabChange: (tab: string) => void;
  authRole: string | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, handleTabChange, authRole }) => {
  return (
    <nav className="fixed bottom-4 landscape:bottom-2 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-full p-1.5 flex justify-between z-50">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleTabChange("scan")}
        className={`flex-1 flex justify-center items-center gap-2 py-3 landscape:py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "scan" ? "bg-emerald-900 dark:bg-emerald-600 text-white shadow-md" : "text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400"}`}
      >
        <ScanLine size={16} /> Input
      </motion.button>

      {(authRole === "fc" || authRole === "afc" || authRole === "fs") && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleTabChange("dashboard")}
          className={`flex-1 flex justify-center items-center gap-2 py-3 landscape:py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "dashboard" ? "bg-emerald-900 dark:bg-emerald-600 text-white shadow-md" : "text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400"}`}
        >
          <LayoutDashboard size={14} /> Dashboard
        </motion.button>
      )}

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleTabChange("sejarah")}
        className={`flex-1 flex justify-center items-center gap-2 py-3 landscape:py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "sejarah" ? "bg-emerald-900 dark:bg-emerald-600 text-white shadow-md" : "text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400"}`}
      >
        <Calendar size={16} /> Sejarah
      </motion.button>
    </nav>
  );
};
