import React, { InputHTMLAttributes, useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface FloatingInputProps {
  label: string;
  type?: string;
  value?: string | number;
  onChange?: (e: any) => void;
  onChangeValue?: (v: string) => void;
  step?: string;
  min?: string;
  max?: string;
  required?: boolean;
  className?: string;
}

export function FloatingInput({
  label,
  type = "text",
  value,
  step,
  min,
  max,
  required,
  onChange,
  onChangeValue,
  className,
}: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        step={step}
        min={min}
        max={max}
        required={required}
        placeholder=" "
        onChange={(e) => {
          if (onChange) onChange(e);
          if (onChangeValue) onChangeValue(e.target.value);
        }}
        className={`block px-4 pb-2.5 pt-6 w-full text-base font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 peer shadow-sm ${className || "border-slate-200 dark:border-slate-800"}`}
      />
      <label className="absolute text-[12px] text-slate-400 dark:text-slate-500 font-display font-black uppercase tracking-widest duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400">
        {label}
      </label>
    </div>
  );
}
