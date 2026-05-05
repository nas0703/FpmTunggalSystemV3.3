import React, { RefObject, Dispatch, SetStateAction } from "react";
import { motion } from "motion/react";
import { FileText, Factory, Droplets, Scissors, Save, AlertCircle, RefreshCw, Loader2, Send, Container, CloudRain } from "lucide-react";
import { FloatingInput } from "../../../components/ui/FloatingInput";
import { FertilizerInput } from "../../fertilizer/components/FertilizerInput";
import { PruningInput } from "../../pruning/components/PruningInput";
import { HujanInput } from "../../hujan/components/HujanInput";

export interface InputTabProps {
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
  fileInputRef: RefObject<HTMLInputElement>;
  uploadInputRef: RefObject<HTMLInputElement>;
  handleOcrScan: (e: any) => void;
  submitTransaction: (e: any) => void;
  isProcessing: boolean;
  onAddHujan?: (bulan: string, tahun: string, jumlah: number) => void;
}

export const InputTab: React.FC<InputTabProps> = ({
  formData,
  setFormData,
  fileInputRef,
  uploadInputRef,
  handleOcrScan,
  submitTransaction,
  isProcessing,
  onAddHujan,
}) => {
  const isBlokValid =
    formData.blok === "" ||
    (parseInt(formData.blok) >= 1 && parseInt(formData.blok) <= 99);

  return (
    <div className="w-full">
      <div className="animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center mb-3">
          <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} /> Rekod Hantaran
          </h2>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleOcrScan}
            accept="image/*"
            className="hidden"
            capture="environment"
          />
          <input
            type="file"
            ref={uploadInputRef}
            onChange={handleOcrScan}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="space-y-3 mt-2">
          {/* TOGGLES SECTION */}
          <div className="grid grid-cols-1 gap-2">
            {/* REKOD HANTARAN Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    !formData.is_efb && !formData.is_baja && !formData.is_pruning && !formData.is_hujan
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Container size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">
                    Rekod Hantaran
                  </p>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Buah Tandan Segar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    is_efb: false,
                    is_baja: false,
                    is_pruning: false,
                    is_hujan: false,
                  });
                }}
                className={`w-[48px] h-[26px] p-1 rounded-full relative transition-all duration-300 overflow-hidden ${
                  !formData.is_efb && !formData.is_baja && !formData.is_pruning && !formData.is_hujan
                    ? "bg-blue-500 shadow-inner"
                    : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-inner"
                }`}
              >
                <div
                  className={`w-full h-full rounded-full transition-transform duration-300 relative`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white rounded-full shadow-md transition-transform duration-300 ${
                      !formData.is_efb && !formData.is_baja && !formData.is_pruning && !formData.is_hujan
                        ? "translate-x-[20px]"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* RESIT EFB Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    formData.is_efb
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Factory size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">
                    Resit EFB
                  </p>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Tandan Kosong
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newIsEfb = true; // explicitly making it true when clicked
                  if (!formData.is_efb) {
                    setFormData({
                      ...formData,
                      is_efb: true,
                      is_baja: false,
                      is_pruning: false,
                      is_hujan: false,
                      kpg: "",
                      muda: "0",
                      reject: "0.00",
                      sample: "0",
                      no_seal: "",
                      rm_mt: "",
                    });
                  }
                }}
                className={`w-[48px] h-[26px] p-1 rounded-full relative transition-all duration-300 overflow-hidden ${
                  formData.is_efb
                    ? "bg-purple-500 shadow-inner"
                    : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-inner"
                }`}
              >
                <div
                  className={`w-full h-full rounded-full transition-transform duration-300 relative`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white rounded-full shadow-md transition-transform duration-300 ${
                      formData.is_efb ? "translate-x-[20px]" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* RECORD BAJA Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    formData.is_baja
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Droplets size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">
                    Rekod Baja
                  </p>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Pembajaan Ladang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!formData.is_baja) {
                    setFormData({
                      ...formData,
                      is_baja: true,
                      is_efb: false,
                      is_pruning: false,
                      is_hujan: false,
                    });
                  }
                }}
                className={`w-[48px] h-[26px] p-1 rounded-full relative transition-all duration-300 overflow-hidden ${
                  formData.is_baja
                    ? "bg-emerald-500 shadow-inner"
                    : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-inner"
                }`}
              >
                <div
                  className={`w-full h-full rounded-full transition-transform duration-300 relative`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white rounded-full shadow-md transition-transform duration-300 ${
                      formData.is_baja ? "translate-x-[20px]" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* PRUNING Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    formData.is_pruning
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                      : "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Scissors size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">
                    Rekod Pruning
                  </p>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Pemangkasan Pokok
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!formData.is_pruning) {
                    setFormData({
                      ...formData,
                      is_pruning: true,
                      is_baja: false,
                      is_efb: false,
                      is_hujan: false,
                    });
                  }
                }}
                className={`w-[48px] h-[26px] p-1 rounded-full relative transition-all duration-300 overflow-hidden ${
                  formData.is_pruning
                    ? "bg-amber-500 shadow-inner"
                    : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-inner"
                }`}
              >
                <div
                  className={`w-full h-full rounded-full transition-transform duration-300 relative`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white rounded-full shadow-md transition-transform duration-300 ${
                      formData.is_pruning ? "translate-x-[20px]" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* HUJAN Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    formData.is_hujan
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <CloudRain size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">
                    Laporan Hujan
                  </p>
                  <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Rekod Hujan Bulanan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!formData.is_hujan) {
                    setFormData({
                      ...formData,
                      is_hujan: true,
                      is_pruning: false,
                      is_baja: false,
                      is_efb: false,
                    });
                  }
                }}
                className={`w-[48px] h-[26px] p-1 rounded-full relative transition-all duration-300 overflow-hidden ${
                  formData.is_hujan
                    ? "bg-blue-500 shadow-inner"
                    : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-inner"
                }`}
              >
                <div
                  className={`w-full h-full rounded-full transition-transform duration-300 relative`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white rounded-full shadow-md transition-transform duration-300 ${
                      formData.is_hujan ? "translate-x-[20px]" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-4" />

          {/* DYNAMIC FORMS */}
          {formData.is_hujan ? (
            <HujanInput 
              onSuccess={() => {
                setFormData({ ...formData, is_hujan: false });
              }}
              onAddHujan={onAddHujan!}
            />
          ) : formData.is_baja ? (
            <FertilizerInput
              onSuccess={() => {
                setFormData({ ...formData, is_baja: false });
              }}
            />
          ) : formData.is_pruning ? (
            <PruningInput
              onSuccess={() => {
                setFormData({ ...formData, is_pruning: false });
              }}
            />
          ) : (
            <form onSubmit={submitTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="No Resit Kilang"
                  value={formData.no_resit}
                  onChange={(e) =>
                    setFormData({ ...formData, no_resit: e.target.value })
                  }
                  required
                />
                {!formData.is_efb && (
                  <FloatingInput
                    label="Nota Hantaran"
                    value={formData.no_nota_hantaran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        no_nota_hantaran: e.target.value,
                      })
                    }
                  />
                )}
              </div>

              {!formData.is_efb && (
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput
                    label="No Lori"
                    value={formData.no_lori}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        no_lori: e.target.value,
                      })
                    }
                    required
                  />
                  <FloatingInput
                    label="Kadar KPG (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.kpg}
                    onChange={(e) =>
                      setFormData({ ...formData, kpg: e.target.value })
                    }
                    className="font-mono text-emerald-600 dark:text-emerald-400 focus:border-emerald-500"
                  />
                </div>
              )}

              {/* ... The rest of the form ... */}
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Tan (MT)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tan}
                  onChange={(e) =>
                    setFormData({ ...formData, tan: e.target.value })
                  }
                  required
                />
                <div className="relative">
                  <FloatingInput
                    label="Blok (1-99)"
                    type="number"
                    value={formData.blok}
                    onChange={(e) =>
                      setFormData({ ...formData, blok: e.target.value })
                    }
                    required
                    className={`font-mono \${!isBlokValid ? "border-rose-500 dark:border-rose-500 text-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : ""}`}
                  />
                  {!isBlokValid && (
                    <AlertCircle
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500"
                    />
                  )}
                </div>
              </div>

              {!formData.is_efb && (
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput
                    label="Bil Tandan Muda"
                    type="number"
                    min="0"
                    value={formData.muda}
                    onChange={(e) =>
                      setFormData({ ...formData, muda: e.target.value })
                    }
                    className="text-amber-600 dark:text-amber-500 focus:border-amber-500"
                  />
                  <FloatingInput
                    label="Akaun Terima"
                    value={formData.no_akaun_terima}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        no_akaun_terima: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {!formData.is_efb && (
                  <FloatingInput
                    label="No Seal (Pilihan)"
                    value={formData.no_seal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        no_seal: e.target.value,
                      })
                    }
                  />
                )}
                {formData.is_efb && (
                  <FloatingInput
                    label="No Lori (L/D)"
                    value={formData.no_lori}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        no_lori: e.target.value,
                      })
                    }
                    required
                  />
                )}
                <div className="relative">
                  <input
                    type="date"
                    value={formData.tarikh}
                    onChange={(e) =>
                      setFormData({ ...formData, tarikh: e.target.value })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    required
                  />
                  <span className="absolute -top-2 left-3 bg-white dark:bg-slate-900 px-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 capitalize tracking-wider">
                    Tarikh
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setFormData({
                    no_resit: "", no_akaun_terima: "", no_lori: "", no_seal: "", no_nota_hantaran: "", kpg: "", blok: "", tan: "", muda: "", reject: "0.00", sample: "0", rm_mt: "", tarikh: "", masa_masuk: "", is_efb: false
                  })}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black py-4 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <RefreshCw size={16} /> Reset
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !isBlokValid}
                  className={`flex-[2] text-white text-xs font-black py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-xl shadow-emerald-600/20 outline-none active:scale-95 ${
                    isProcessing || !isBlokValid
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Simpan Data
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
