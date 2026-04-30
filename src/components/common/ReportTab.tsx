import React from "react";
import { Reorder, useDragControls } from "motion/react";

export const ReportTab = ({
  r,
  reportType,
  setReportType,
  isReordering,
  setIsReordering,
  longPressTimer,
}: {
  key?: any;
  r: any;
  reportType: string;
  setReportType: (id: any) => void;
  isReordering: boolean;
  setIsReordering: (val: boolean) => void;
  longPressTimer: React.MutableRefObject<any>;
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={r.id}
      value={r}
      dragListener={false}
      dragControls={dragControls}
      onPointerDown={(event) => {
        longPressTimer.current = setTimeout(() => {
          setIsReordering(true);
          dragControls.start(event);
          if (typeof window !== "undefined" && "vibrate" in navigator)
            navigator.vibrate(50);
        }, 500);
      }}
      onPointerUp={() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setIsReordering(false);
      }}
      onPointerCancel={() => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setIsReordering(false);
      }}
      className="flex-shrink-0"
    >
      <button
        data-report-id={r.id}
        onClick={(e) => {
          if (isReordering) return;
          setReportType(r.id);

          // Center the clicked button
          (e.currentTarget as HTMLElement).scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }}
        className={`whitespace-nowrap px-6 text-[12px] font-black py-2.5 rounded-full transition-all duration-300 uppercase tracking-widest flex-shrink-0 ${reportType === r.id ? "bg-white text-emerald-900 shadow-[0_4px_12px_rgba(255,255,255,0.3)] scale-[1.02]" : "text-emerald-100/60 hover:text-white hover:bg-white/5"} ${isReordering ? "scale-110 !bg-emerald-500 !text-white cursor-grabbing shadow-2xl z-50" : ""}`}
      >
        {r.label}
      </button>
    </Reorder.Item>
  );
};
