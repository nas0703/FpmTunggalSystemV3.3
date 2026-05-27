import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, LayoutGrid, History, User, X, Camera, Upload } from "lucide-react";

interface BottomNavProps {
  activeTab: "scan" | "dashboard" | "sejarah";
  handleTabChange: (tab: "scan" | "dashboard" | "sejarah") => void;
  isProfileActive: boolean;
  setIsProfileActive: (active: boolean) => void;
  onUploadClick?: () => void;
  onCameraClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  handleTabChange,
  isProfileActive,
  setIsProfileActive,
  onUploadClick,
  onCameraClick,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Fizikal Spring Konfigurasi - Sangat responsif dan organik
  const springConfig = { type: "spring", stiffness: 380, damping: 30 };
  const microBounceConfig = { type: "spring", stiffness: 450, damping: 22 };

  const toggleQuickMenu = () => {
    setShowQuickMenu((prev) => !prev);
  };

  const selectTab = (tab: "scan" | "dashboard" | "sejarah") => {
    setShowQuickMenu(false);
    setIsProfileActive(false);
    handleTabChange(tab);
  };

  const selectProfile = () => {
    setShowQuickMenu(false);
    setIsProfileActive(!isProfileActive);
  };

  const isInputActive = activeTab === "scan" && !isProfileActive;
  const isDashboardActive = activeTab === "dashboard" && !isProfileActive;
  const isSejarahActive = activeTab === "sejarah" && !isProfileActive;

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full h-[76px] z-40 select-none pb-safe">
      
      {/* 1. CURVED BACKDROP COMBINATION WITH STRETCHED SIDES AND CENTER NOTCH */}
      <div className="absolute inset-0 flex pointer-events-none">
        
        {/* Left flat bar */}
        <div className="flex-1 h-[58px] mt-[18px] bg-gradient-to-b from-[#011f19] to-[#01140f] border-t border-emerald-500/20" />
        
        {/* Center notch SVG */}
        <div className="w-[88px] h-[76px] relative shrink-0">
          <svg
            width="88"
            height="76"
            viewBox="0 0 88 76"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
          >
            <defs>
              {/* Natural Deep Emerald Gradient fill */}
              <linearGradient id="navBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#011f19" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#01140f" stopOpacity="0.99" />
              </linearGradient>

              {/* Glowing Green stroke gradient */}
              <linearGradient id="navBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#047857" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Seamless solid fill for center cutout (scaled by 20%) */}
            <path
              d="M 0,18
                 L 6,18
                 C 11,18 15,22 15,28
                 A 29,29 0 0 0 73,28
                 C 73,22 77,18 82,18
                 L 88,18
                 L 88,76
                 L 0,76
                 Z"
              fill="url(#navBgGrad)"
            />

            {/* Glowing top line connecting the shoulder edges (scaled by 20%) */}
            <path
              d="M 0,18
                 L 6,18
                 C 11,18 15,22 15,28
                 A 29,29 0 0 0 73,28
                 C 73,22 77,18 82,18
                 L 88,18"
              stroke="url(#navBorderGrad)"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        </div>

        {/* Right flat bar */}
        <div className="flex-1 h-[58px] mt-[18px] bg-gradient-to-b from-[#011f19] to-[#01140f] border-t border-emerald-500/20" />
        
      </div>

      {/* 2. NAVIGATION BUTTONS LAYER */}
      <div className="absolute left-0 right-0 top-[18px] h-[58px] flex items-center justify-between px-3 pb-2.5 max-w-lg mx-auto">
        
        {/* LEFT BUTTONS CONTAINER */}
        <div className="flex-grow flex-shrink basis-0 grid grid-cols-2 w-full h-full justify-items-center items-center">
          {/* BUTTON 1: INPUT */}
          <button
            onClick={() => selectTab("scan")}
            className="w-full flex flex-col items-center justify-center h-full cursor-pointer relative group outline-none"
          >
            <div className="flex flex-col items-center justify-center relative">
              <Home
                size={15}
                className={`transition-colors duration-250 ${
                  isInputActive
                    ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span
                className={`text-[8.5px] font-black tracking-wider uppercase mt-1 transition-colors duration-250 ${
                  isInputActive ? "text-emerald-400" : "text-slate-500 font-bold"
                }`}
              >
                Input
              </span>
              {isInputActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.9)]"
                  transition={springConfig}
                />
              )}
            </div>
          </button>

          {/* BUTTON 2: DASHBOARD */}
          <button
            onClick={() => selectTab("dashboard")}
            className="w-full flex flex-col items-center justify-center h-full cursor-pointer relative group outline-none"
          >
            <div className="flex flex-col items-center justify-center relative">
              <LayoutGrid
                size={15}
                className={`transition-colors duration-250 ${
                  isDashboardActive
                    ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span
                className={`text-[8.5px] font-black tracking-wider uppercase mt-1 transition-colors duration-250 ${
                  isDashboardActive ? "text-emerald-400" : "text-slate-500 font-bold"
                }`}
              >
                Dashboard
              </span>
              {isDashboardActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.9)]"
                  transition={springConfig}
                />
              )}
            </div>
          </button>
        </div>

        {/* 100% SPACER FOR THE CENTRAL NOTCH */}
        <div className="w-[88px] shrink-0" />

        {/* RIGHT BUTTONS CONTAINER */}
        <div className="flex-grow flex-shrink basis-0 grid grid-cols-2 w-full h-full justify-items-center items-center">
          {/* BUTTON 4: SEJARAH */}
          <button
            onClick={() => selectTab("sejarah")}
            className="w-full flex flex-col items-center justify-center h-full cursor-pointer relative group outline-none"
          >
            <div className="flex flex-col items-center justify-center relative">
              <History
                size={15}
                className={`transition-colors duration-250 ${
                  isSejarahActive
                    ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span
                className={`text-[8.5px] font-black tracking-wider uppercase mt-1 transition-colors duration-250 ${
                  isSejarahActive ? "text-emerald-400" : "text-slate-500 font-bold"
                }`}
              >
                Sejarah
              </span>
              {isSejarahActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.9)]"
                  transition={springConfig}
                />
              )}
            </div>
          </button>

          {/* BUTTON 5: PROFIL */}
          <button
            onClick={selectProfile}
            className="w-full flex flex-col items-center justify-center h-full cursor-pointer relative group bottom-nav-profile-btn outline-none"
          >
            <div className="flex flex-col items-center justify-center relative">
              <User
                size={15}
                className={`transition-colors duration-250 ${
                  isProfileActive
                    ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span
                className={`text-[8.5px] font-black tracking-wider uppercase mt-1 transition-colors duration-250 ${
                  isProfileActive ? "text-emerald-400" : "text-slate-500 font-bold"
                }`}
              >
                Profil
              </span>
              {isProfileActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5 shadow-[0_0_8px_rgba(16,185,129,0.9)]"
                  transition={springConfig}
                />
              )}
            </div>
          </button>
        </div>

      </div>

      {/* 3. CENTRAL CAMERA ACTION BUTTON */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[2px] z-50">
        
        {/* Subtle breathing outer glow behind the circle */}
        <div className="absolute -inset-1 bg-emerald-500/30 rounded-full blur-[8px] pointer-events-none animate-pulse" />

        {/* Floating dropdown actions menu */}
        <AnimatePresence>
          {showQuickMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-36 bg-[#041e18]/95 border border-emerald-500/20 backdrop-blur-md rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-50"
            >
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onUploadClick?.();
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-500/10 rounded-md text-[9.5px] font-black uppercase tracking-wider text-slate-50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="text-slate-100">Muat Naik</span>
                <Upload size={14} className="text-emerald-400" />
              </button>
              <div className="h-px bg-emerald-500/10" />
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onCameraClick?.();
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[#10b981]/15 rounded-md text-[9.5px] font-black uppercase tracking-wider text-slate-50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="text-slate-100">Imbas Resit</span>
                <Camera size={14} className="text-emerald-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main circular Camera button (scaled up by 20% to 52px) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 450, damping: 20 }}
          onClick={toggleQuickMenu}
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden outline-none bg-gradient-to-tr from-[#024a3b] to-[#10b981] border-2 border-emerald-400/50 shadow-[0_6px_18px_rgba(2,26,20,0.5),_inset_0_1px_1.5px_rgba(255,255,255,0.3)] select-none group"
        >
          {/* Shiny overlay sheen decoration */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            {showQuickMenu ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-center justify-center relative z-10"
              >
                <X className="text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]" size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="camera"
                initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-center justify-center relative z-10"
              >
                <Camera className="text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-200" size={20} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glancing shine animation line */}
          <div className="absolute top-0 -left-[100%] h-full w-1/2 block bg-gradient-to-r from-transparent via-white/12 to-transparent transform -skew-x-12 group-hover:animate-shine pointer-events-none" />
        </motion.button>
      </div>

    </div>
  );
};

