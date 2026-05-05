import React from "react";
import { Leaf, Delete } from "lucide-react";

interface LoginScreenProps {
  pin: string;
  loginError: boolean;
  isDarkMode: boolean;
  handlePinPress: (num: string) => void;
  handleDeletePress: () => void;
}

export function LoginScreen({
  pin,
  loginError,
  isDarkMode,
  handlePinPress,
  handleDeletePress,
}: LoginScreenProps) {
  return (
    <div
      className={`max-w-md mx-auto min-h-screen ${isDarkMode ? "bg-slate-950" : "bg-slate-50"} flex flex-col justify-center items-center p-6 relative overflow-hidden transition-colors duration-500`}
    >
      <div
        className={`absolute top-[-10%] left-[-20%] w-96 h-96 ${isDarkMode ? "bg-emerald-600/10" : "bg-emerald-600/5"} rounded-full blur-3xl`}
      />

      <div className="relative z-10 w-full max-w-xs flex flex-col items-center">
        <div className="mb-8 relative">
          <div
            className={`w-20 h-20 ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-500/5 border-emerald-500/20"} rounded-3xl border flex items-center justify-center rotate-12 shadow-lg`}
          >
            <div
              className={`w-16 h-16 ${isDarkMode ? "bg-emerald-500/20 border-emerald-500/40" : "bg-emerald-500/10 border-emerald-500/30"} rounded-2xl border flex items-center justify-center -rotate-12`}
            >
              <Leaf className="text-emerald-500" size={32} />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
        </div>
        <h1 className="text-center uppercase mb-10">
          <span
            className={`block text-xl font-display font-black ${isDarkMode ? "text-white" : "text-slate-800"} tracking-widest mb-2`}
          >
            FPMSB TUNGGAL
          </span>
          <span className="block text-[11px] text-emerald-500 font-sans font-black uppercase tracking-[0.3em] opacity-80 mb-1">
            Integrated Plantation Data System
          </span>
          <span
            className={`block text-[10px] font-sans font-medium ${isDarkMode ? "text-emerald-400" : "text-emerald-600"} tracking-[0.2em]`}
          >
            Sistem Maklumat Ladang
          </span>
        </h1>

        <div className="flex gap-4 mb-10 h-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${pin.length > i ? "bg-emerald-400 scale-110 shadow-[0_0_10px_rgba(52,211,153,0.8)]" : isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
            />
          ))}
        </div>

        {loginError && (
          <p className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-4 animate-pulse">
            PIN Tidak Sah
          </p>
        )}

        <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinPress(num.toString())}
              className={`text-2xl font-black p-4 rounded-full transition-all active:scale-90 ${isDarkMode ? "text-white hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"}`}
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePinPress("0")}
            className={`text-2xl font-black p-4 rounded-full transition-all active:scale-90 ${isDarkMode ? "text-white hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"}`}
          >
            0
          </button>
          <button
            onClick={handleDeletePress}
            className={`flex justify-center items-center p-4 rounded-full transition-all active:scale-90 ${isDarkMode ? "text-slate-500 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}
          >
            <Delete size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
