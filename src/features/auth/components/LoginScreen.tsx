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
  // Safe helper to trigger premium tactile physical haptic vibration feedback on touch devices
  const triggerHapticFeedback = () => {
    if (typeof window !== "undefined" && window.navigator && typeof window.navigator.vibrate === "function") {
      try {
        window.navigator.vibrate(12); // Subtle 12ms haptic pulse
      } catch (e) {
        // Safe fallback for browsers/webview contexts restricting vibration
      }
    }
  };

  const onNumberPress = (num: string) => {
    triggerHapticFeedback();
    handlePinPress(num);
  };

  const onBackspacePress = () => {
    triggerHapticFeedback();
    handleDeletePress();
  };

  return (
    <div
      className={`max-w-md mx-auto min-h-screen ${isDarkMode ? "bg-[#090f1e]" : "bg-slate-50"} flex flex-col justify-between items-center py-10 px-6 relative overflow-hidden transition-colors duration-500`}
    >
      {/* Dynamic Background Glowing Blobs */}
      <div
        className={`absolute top-[-10%] left-[-20%] w-96 h-96 ${isDarkMode ? "bg-emerald-600/15" : "bg-emerald-500/10"} rounded-full blur-3xl`}
      />
      <div
        className={`absolute bottom-[-10%] right-[-20%] w-96 h-96 ${isDarkMode ? "bg-teal-600/10" : "bg-teal-500/5"} rounded-full blur-3xl`}
      />

      <div /> {/* Spacer for clean flex vertical spread */}

      <div className="relative z-10 w-full max-w-xs flex flex-col items-center my-auto">
        {/* Animated App Icon Wrapper */}
        <div className="mb-6 relative">
          <div
            className={`w-20 h-20 ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-500/5 border-emerald-500/20"} rounded-3xl border flex items-center justify-center rotate-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md transition-all duration-500 hover:rotate-0`}
          >
            <div
              className={`w-16 h-16 ${isDarkMode ? "bg-emerald-500/20 border-emerald-500/40" : "bg-emerald-500/10 border-emerald-500/30"} rounded-2xl border flex items-center justify-center -rotate-12 transition-all duration-500 hover:rotate-0`}
            >
              <Leaf className="text-emerald-400 dark:text-emerald-400" size={32} />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        </div>

        {/* Brand and Version Info */}
        <h1 className="text-center uppercase mb-8">
          <div className="flex items-center gap-2 justify-center mb-2">
            <span
              className={`block text-xl font-display font-black ${isDarkMode ? "text-white" : "text-slate-800"} tracking-widest`}
            >
              FPMSB TUNGGAL
            </span>
            <span className="inline-block px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-sans font-black text-emerald-400 tracking-wider">
              V3.4
            </span>
          </div>
          <span className="block text-[11px] text-emerald-500 font-sans font-black uppercase tracking-[0.3em] opacity-85 mb-1.5">
            Integrated Plantation Data System
          </span>
          <span
            className={`block text-[10px] font-sans font-medium ${isDarkMode ? "text-emerald-400/80" : "text-emerald-600"} tracking-[0.2em]`}
          >
            Sistem Maklumat Ladang
          </span>
        </h1>

        {/* PIN Indicators with a refined backdrop-blur container and soft shadows */}
        <div className={`flex items-center justify-center px-6 py-3 rounded-2xl mb-8 ${isDarkMode ? "bg-slate-900/50 border border-slate-800/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]" : "bg-white border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(148,163,184,0.06),0_4px_20px_rgba(148,163,184,0.08)]"} transition-all duration-300`}>
          <div className="flex gap-4.5 h-4 items-center">
            {[...Array(6)].map((_, i) => {
              const active = pin.length > i;
              return (
                <div
                  key={i}
                  className={`relative flex items-center justify-center transition-all duration-300`}
                >
                  {/* Outer glowing halo active */}
                  <div
                    className={`absolute inset-[-4px] rounded-full transition-all duration-300 ${
                      active 
                        ? "bg-emerald-500/20 scale-125 animate-pulse blur-[1px]" 
                        : "bg-transparent scale-50"
                    }`}
                  />
                  {/* Primary Dot Indicator */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border ${
                      active 
                        ? "bg-emerald-400 border-emerald-300 scale-110 shadow-[0_0_14px_rgba(52,211,153,0.95)]" 
                        : isDarkMode 
                          ? "bg-slate-950 border-slate-800" 
                          : "bg-slate-100 border-slate-300/80"
                    }`}
                  >
                    {/* Inner core circle detail for technical/luxury design */}
                    {!active && (
                      <div className={`w-1 h-1 rounded-full m-auto mt-1 ${isDarkMode ? "bg-slate-700" : "bg-slate-400"}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Errors */}
        {loginError && (
          <p className="text-rose-500 text-xs font-black uppercase tracking-widest mb-6 animate-pulse bg-rose-500/10 border border-rose-500/20 py-1.5 px-4 rounded-lg shadow-sm">
            PIN Tidak Sah
          </p>
        )}

        {/* Soft, Tactile Keypad */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4.5 w-full px-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => onNumberPress(num.toString())}
              className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-sans font-extrabold text-2xl transition-all duration-100 active:scale-90 select-none shadow-sm ${
                isDarkMode 
                  ? "text-slate-100 bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:bg-emerald-500/20 active:border-emerald-400/80 active:shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
                  : "text-slate-900 bg-white border border-slate-200 hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:text-emerald-600 hover:shadow-[0_6px_15px_rgba(148,163,184,0.12)] active:bg-emerald-500/10 active:border-emerald-500 active:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              }`}
            >
              {num}
            </button>
          ))}
          
          {/* Backspace Button */}
          <button
            onClick={onBackspacePress}
            className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-all duration-100 active:scale-90 select-none shadow-sm ${
              isDarkMode 
                ? "text-slate-300 bg-slate-900/40 border border-slate-800/60 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 active:bg-rose-500/20 active:border-rose-500 active:shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                : "text-slate-700 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-500/20 hover:text-rose-600 hover:shadow-[0_6px_15px_rgba(244,63,94,0.08)] active:bg-rose-100 active:border-rose-500 active:shadow-[0_0_12px_rgba(244,63,94,0.2)]"
            }`}
          >
            <Delete size={20} className="stroke-[2.5]" />
          </button>

          {/* 0 Button */}
          <button
            onClick={() => onNumberPress("0")}
            className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-sans font-extrabold text-2xl transition-all duration-100 active:scale-90 select-none shadow-sm ${
              isDarkMode 
                ? "text-slate-100 bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:bg-emerald-500/20 active:border-emerald-400/80 active:shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
                : "text-slate-900 bg-white border border-slate-200 hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:text-emerald-600 hover:shadow-[0_6px_15px_rgba(148,163,184,0.12)] active:bg-emerald-500/10 active:border-emerald-500 active:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            }`}
          >
            0
          </button>

          {/* Touch visual balance spacer */}
          <div className="w-14 h-14 mx-auto flex items-center justify-center text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 select-none">
            PIN
          </div>
        </div>
      </div>

      {/* Corporate Metadata Footer */}
      <div className="relative z-10 text-center space-y-1">
        <p className="text-[8px] font-black tracking-[0.25em] text-slate-500 dark:text-slate-500 uppercase leading-none">
          FPMSB INTEGRATED PLANTATION SYSTEM
        </p>
        <p className="text-[7.5px] font-bold text-slate-400 dark:text-slate-600 leading-none">
          © 2026 FPMSB • Hak Cipta Terpelihara
        </p>
      </div>
    </div>
  );
}
