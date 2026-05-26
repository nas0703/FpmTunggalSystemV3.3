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
    <div className="fixed bottom-0 left-0 right-0 w-full bg-[#031d17]/98 border-t border-emerald-500/20 px-4 pt-2.5 pb-5 z-40 select-none shadow-[0_-8px_30px_rgba(2,18,14,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between relative max-w-lg mx-auto">
        
        {/* TAB 1: INPUT */}
        <motion.button
          whileTap={{ scale: 0.88, y: 0.5 }}
          transition={microBounceConfig}
          onClick={() => selectTab("scan")}
          className="flex-1 flex flex-col items-center justify-center py-1 h-[44px] rounded-xl cursor-pointer relative overflow-hidden group min-w-[50px]"
        >
          {isInputActive && (
            <motion.div
              layoutId="activeTabPill"
              transition={springConfig}
              className="absolute inset-x-1 inset-y-0.5 bg-[#0a3127]/80 border border-emerald-500/30 rounded-xl z-0"
            />
          )}

          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                scale: isInputActive ? 1.06 : 1.0,
                y: isInputActive ? -0.5 : 0 
              }}
              transition={springConfig}
            >
              <Home
                size={14}
                className={`transition-colors duration-200 ${
                  isInputActive
                    ? "text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
            </motion.div>
            <span
              className={`text-[8px] font-black tracking-wider uppercase mt-0.5 transition-colors duration-200 ${
                isInputActive ? "text-emerald-400" : "text-slate-400 font-bold"
              }`}
            >
              Input
            </span>
          </div>
        </motion.button>

        {/* TAB 2: DASHBOARD */}
        <motion.button
          whileTap={{ scale: 0.88, y: 0.5 }}
          transition={microBounceConfig}
          onClick={() => selectTab("dashboard")}
          className="flex-1 flex flex-col items-center justify-center py-1 h-[44px] rounded-xl cursor-pointer relative overflow-hidden group min-w-[50px]"
        >
          {isDashboardActive && (
            <motion.div
              layoutId="activeTabPill"
              transition={springConfig}
              className="absolute inset-x-1 inset-y-0.5 bg-[#0a3127]/80 border border-emerald-500/30 rounded-xl z-0"
            />
          )}

          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                scale: isDashboardActive ? 1.06 : 1.0,
                y: isDashboardActive ? -0.5 : 0
              }}
              transition={springConfig}
            >
              <LayoutGrid
                size={14}
                className={`transition-colors duration-200 ${
                  isDashboardActive
                    ? "text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
            </motion.div>
            <span
              className={`text-[8px] font-black tracking-wider uppercase mt-0.5 transition-colors duration-200 ${
                isDashboardActive ? "text-emerald-400" : "text-slate-400 font-bold"
              }`}
            >
              Dashboard
            </span>
          </div>
        </motion.button>

        {/* TAB 3: CAMERA (Modern Matte-Metallic Camera Button) */}
        <div className="w-[48px] flex justify-center items-center relative -mt-5 z-20 shrink-0 select-none mx-0.5">
          {/* Ambient Breathing Glow */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 rounded-full blur-[6px] opacity-40 animate-pulse pointer-events-none" />
          
          {/* Floating Actions Menu */}
          <AnimatePresence>
            {showQuickMenu && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute bottom-14 w-32 bg-[#041e18]/95 border border-emerald-500/20 backdrop-blur-md rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-50 mb-1.5"
              >
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onUploadClick?.();
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-500/10 rounded-md text-[8px] font-black uppercase tracking-wider text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  Muat Naik
                  <Upload size={12} className="text-emerald-400" />
                </button>
                <div className="h-px bg-emerald-500/10" />
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onCameraClick?.();
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-500/10 rounded-md text-[8px] font-black uppercase tracking-wider text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  Imbas Resit
                  <Camera size={12} className="text-emerald-450" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1, y: -1 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            onClick={toggleQuickMenu}
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden outline-none bg-gradient-to-b from-[#0a3127] to-[#01140f] border border-emerald-400/50 shadow-[0_6px_15px_rgba(1,20,15,0.7),_inset_0_1px_1.5px_rgba(255,255,255,0.3)] select-none group"
          >
            {/* Glossy Overlay Sheen (Toned down matte-metallic finish) */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-full pointer-events-none" />
            
            {/* Inner Ring Alignment (Camera Lens Effect) */}
            <div className="absolute inset-1 rounded-full border border-emerald-500/10 bg-[#011f19]/20 pointer-events-none flex items-center justify-center" />

            <AnimatePresence mode="wait">
              {showQuickMenu ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex items-center justify-center relative z-10"
                >
                  <X className="text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.4)]" size={15} />
                </motion.div>
              ) : (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex items-center justify-center relative z-10"
                >
                  <Camera className="text-emerald-300 drop-shadow-[0_1.5px_3px_rgba(6,78,59,0.4)] group-hover:text-emerald-100 transition-colors duration-200" size={15} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtle Radiant Shine Line Transition */}
            <div className="absolute top-0 -left-[100%] h-full w-1/2 block bg-gradient-to-r from-transparent via-white/8 to-transparent transform -skew-x-12 group-hover:animate-shine pointer-events-none" />
          </motion.button>
        </div>

        {/* TAB 4: SEJARAH */}
        <motion.button
          whileTap={{ scale: 0.88, y: 0.5 }}
          transition={microBounceConfig}
          onClick={() => selectTab("sejarah")}
          className="flex-1 flex flex-col items-center justify-center py-1 h-[44px] rounded-xl cursor-pointer relative overflow-hidden group min-w-[50px]"
        >
          {isSejarahActive && (
            <motion.div
              layoutId="activeTabPill"
              transition={springConfig}
              className="absolute inset-x-1 inset-y-0.5 bg-[#0a3127]/80 border border-emerald-500/30 rounded-xl z-0"
            />
          )}

          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                scale: isSejarahActive ? 1.06 : 1.0,
                y: isSejarahActive ? -0.5 : 0
              }}
              transition={springConfig}
            >
              <History
                size={14}
                className={`transition-colors duration-200 ${
                  isSejarahActive
                    ? "text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
            </motion.div>
            <span
              className={`text-[8px] font-black tracking-wider uppercase mt-0.5 transition-colors duration-205 ${
                isSejarahActive ? "text-emerald-400" : "text-slate-400 font-bold"
              }`}
            >
              Sejarah
            </span>
          </div>
        </motion.button>

        {/* TAB 5: PROFIL */}
        <motion.button
          whileTap={{ scale: 0.88, y: 0.5 }}
          transition={microBounceConfig}
          onClick={selectProfile}
          className="flex-1 flex flex-col items-center justify-center py-1 h-[44px] rounded-xl cursor-pointer relative overflow-hidden group min-w-[50px] bottom-nav-profile-btn"
        >
          {isProfileActive && (
            <motion.div
              layoutId="activeTabPill"
              transition={springConfig}
              className="absolute inset-x-1 inset-y-0.5 bg-[#0a3127]/80 border border-emerald-500/30 rounded-xl z-0"
            />
          )}

          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                scale: isProfileActive ? 1.06 : 1.0,
                y: isProfileActive ? -0.5 : 0
              }}
              transition={springConfig}
            >
              <User
                size={14}
                className={`transition-colors duration-200 ${
                  isProfileActive
                    ? "text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
            </motion.div>
            <span
              className={`text-[8px] font-black tracking-wider uppercase mt-0.5 transition-colors duration-205 ${
                isProfileActive ? "text-emerald-400" : "text-slate-400 font-bold"
              }`}
            >
              Profil
            </span>
          </div>
        </motion.button>

      </div>
    </div>
  );
};
