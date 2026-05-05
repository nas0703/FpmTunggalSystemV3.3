import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ClipboardCheck, Share2 } from 'lucide-react';
import { HasilBulananTable } from '../../dashboard/components/HasilBulananTable';
import { PendapatanBulananTable } from './PendapatanBulananTable';

interface LaporanViewProps {
  showFSA13Report: boolean;
  setShowFSA13Report: (show: boolean) => void;
  handleCopyReport: () => void;
  handleWhatsAppShare: () => void;
  showReportDatePicker: boolean;
  dashboardDate: string;
  setDashboardDate: (date: string) => void;
  executeWhatsAppShare: () => void;
  generateRCReport: () => React.ReactNode;
  tableToCaptureRef: React.RefObject<HTMLDivElement>;
  analytics: any;
  isDarkMode: boolean;
  captureTableScreenshot: () => void;
  isCapturing: boolean;
  setShowExportModal: (show: boolean) => void;
  handleDownloadPdf: () => void;
  isDownloadingPdf: boolean;
  handlePrint: () => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  showFSA13Report,
  setShowFSA13Report,
  handleCopyReport,
  handleWhatsAppShare,
  showReportDatePicker,
  dashboardDate,
  setDashboardDate,
  executeWhatsAppShare,
  generateRCReport,
  tableToCaptureRef,
  analytics,
  isDarkMode,
  captureTableScreenshot,
  isCapturing,
  setShowExportModal,
  handleDownloadPdf,
  isDownloadingPdf,
  handlePrint
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState<'prestasi' | 'pendapatan' | 'fsa13'>('fsa13');

  return (
    <>
      <div className="flex mt-2 mb-4 space-x-2 px-1 overflow-x-auto custom-scrollbar pb-2">
        <button
          onClick={() => setActiveSubTab('fsa13')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'fsa13'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-500'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FileText size={12} /> Live FSA 13
        </button>
        <button
          onClick={() => setActiveSubTab('prestasi')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'prestasi'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-500'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Prestasi Bulanan
        </button>
        <button
          onClick={() => setActiveSubTab('pendapatan')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'pendapatan'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-500'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Pendapatan Peneroka
        </button>
      </div>

      <div ref={tableToCaptureRef} className="-mx-2 sm:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeSubTab === 'fsa13' ? (
          <div className="bg-slate-900 rounded-[24px] p-5 shadow-2xl border border-slate-800 relative overflow-hidden group mb-6">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText size={80} className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    Laporan Live FSA 13
                  </h3>
                  <p className="text-[7px] font-bold text-emerald-400/70 uppercase tracking-widest mt-0.5">
                    Format Regional Controller
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyReport}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ClipboardCheck size={12} className="text-emerald-400" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleWhatsAppShare}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors"
                  >
                    <Share2 size={12} className="text-white" />
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {showReportDatePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-2"
                  >
                    <label className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest px-1">
                      Pilih Tarikh Laporan
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dashboardDate}
                        onChange={(e) => setDashboardDate(e.target.value)}
                        className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <button
                        onClick={executeWhatsAppShare}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                      >
                        <Share2 size={12} /> Share
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-black/40 rounded-2xl p-4 font-mono text-[9px] leading-relaxed text-emerald-400/90 whitespace-pre shadow-inner overflow-hidden border border-white/5 relative">
                {generateRCReport()}
              </div>
            </div>
          </div>
        ) : activeSubTab === 'prestasi' ? (
          <HasilBulananTable
            analytics={analytics}
            dashboardDate={dashboardDate}
            isDarkMode={isDarkMode}
            onScreenshot={captureTableScreenshot}
            isCapturing={isCapturing}
            onExcel={() => setShowExportModal(true)}
            onDownloadPdf={handleDownloadPdf}
            isDownloadingPdf={isDownloadingPdf}
            onPrint={handlePrint}
          />
        ) : (
          <PendapatanBulananTable
            analytics={analytics}
            dashboardDate={dashboardDate}
            setDashboardDate={setDashboardDate}
            isDarkMode={isDarkMode}
            onScreenshot={captureTableScreenshot}
            isCapturing={isCapturing}
          />
        )}
      </div>
    </>
  );
};
