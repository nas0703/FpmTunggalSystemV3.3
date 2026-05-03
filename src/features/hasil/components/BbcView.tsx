import React from "react";
import { Package } from "lucide-react";

export const BbcView: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-12 text-center shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
      <Package className="text-emerald-500 opacity-20 mb-4" size={80} />
      <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-2">Black Bunch Count</h3>
      <p className="text-slate-500 font-bold text-sm">Modul BBC sedang dalam pembangunan dan akan dimasukkan pada fasa akan datang.</p>
    </div>
  );
};
