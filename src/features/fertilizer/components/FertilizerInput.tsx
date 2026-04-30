
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  Target,
  ArrowRight
} from 'lucide-react';
import { getPusInfo, calculateProductivity, calculateProgress } from '../helpers';
import { DailyEntrySchema } from '../types';

export const FertilizerInput: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [masterData, setMasterData] = useState<any[]>([]);
  const [existingEntries, setExistingEntries] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    blok_code: '',
    pus: 1,
    fertilizer_type: '',
    workers_count: 0,
    total_beg_completed: 0,
    note: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchMasterData();
    fetchEntries();
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/fertilizer/inventory');
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
      // Initialize with first inventory item if empty
      if (Array.isArray(data) && data.length > 0 && !formData.fertilizer_type) {
        setFormData(prev => ({ ...prev, fertilizer_type: data[0].name }));
      }
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
  };

  const fetchMasterData = async () => {
    try {
      const res = await fetch('/api/fertilizer/master');
      const data = await res.json();
      setMasterData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch master data', err);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/fertilizer/entries');
      const data = await res.json();
      setExistingEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch entries', err);
    }
  };

  const selectedPusInfo = getPusInfo(formData.pus);
  const selectedBlokMaster = (masterData || []).find(b => b.blok_code === formData.blok_code);
  const targetBeg = selectedBlokMaster ? selectedBlokMaster[`pus${formData.pus}_beg`] : 0;
  
  // Calculate cumulative actual for this block and PUS
  const cumulativeActual = (existingEntries || [])
    .filter(e => e.blok_code === formData.blok_code && e.pus === formData.pus)
    .reduce((acc, curr) => acc + curr.total_beg_completed, 0);

  const remainingBeg = Math.max(0, targetBeg - cumulativeActual);
  const currentProgress = calculateProgress(cumulativeActual, targetBeg);
  const currentProductivity = calculateProductivity(formData.total_beg_completed, formData.workers_count);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage(null);

    try {
      // Validate with Zod
      DailyEntrySchema.parse(formData);

      const payload = {
        ...formData,
        interval_name: selectedPusInfo.interval,
        productivity_beg_per_worker: currentProductivity,
        target_beg_for_selected_pus: targetBeg
      };

      const res = await fetch('/api/fertilizer/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Rekod harian berjaya disimpan.' });
        setFormData({
          ...formData,
          blok_code: '',
          workers_count: 0,
          total_beg_completed: 0,
          note: ''
        });
        fetchEntries();
      } else if (res.status === 409) {
        setMessage({ type: 'error', text: result.error });
      } else {
        throw new Error(result.error || 'Gagal menyimpan rekod');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Ralat semasa menyimpan data' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col gap-1 mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kemasukan Kerja Baja</p>
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase leading-none italic">Harian Staff</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tarikh</label>
            <input 
              type="date" 
              value={formData.entry_date}
              onChange={e => setFormData({...formData, entry_date: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Blok</label>
            <select
              value={formData.blok_code}
              onChange={e => setFormData({...formData, blok_code: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Pilih Blok</option>
              {(masterData || []).map(b => (
                <option key={b.blok_code} value={b.blok_code}>Blok {b.blok_code}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">PUS</label>
            <select
              value={formData.pus}
              onChange={e => {
                const newPus = parseInt(e.target.value) as any;
                const info = getPusInfo(newPus);
                setFormData({
                  ...formData, 
                  pus: newPus,
                  fertilizer_type: info.fertilizer // Default to PUS config fertilizer
                });
              }}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/20"
            >
              <option value={1}>PUS 1</option>
              <option value={2}>PUS 2</option>
              <option value={3}>PUS 3</option>
              <option value={4}>PUS 4</option>
            </select>
          </div>
           <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Jenis Baja / Produk</label>
            <select
              value={formData.fertilizer_type}
              onChange={e => setFormData({...formData, fertilizer_type: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Pilih Baja</option>
              {inventory.length > 0 ? (
                inventory.map(item => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))
              ) : (
                <>
                  <option value="COMPACT FELDA 12">COMPACT FELDA 12</option>
                  <option value="FELDA Organic">FELDA Organic</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Bil. Pekerja</label>
            <input 
              type="number" 
              value={formData.workers_count || ''}
              onChange={e => setFormData({...formData, workers_count: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-800 dark:text-white"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Beg Siap</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.total_beg_completed || ''}
              onChange={e => setFormData({...formData, total_beg_completed: parseFloat(e.target.value) || 0})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-800 dark:text-white"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nota Tambahan</label>
          <textarea 
            value={formData.note}
            onChange={e => setFormData({...formData, note: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-800 dark:text-white min-h-[80px]"
            placeholder="Komen kerja (pilihan)..."
          />
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {message.type === 'success' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
            <span className="text-[10px] font-black uppercase">{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          {isProcessing ? 'MEMPROSES...' : 'SIMPAN REKOD BAJA'}
        </button>

        {/* Realtime Summary Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-slate-400 uppercase">Target Blok + PUS</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">{targetBeg} <span className="text-[10px] text-slate-500">BEG</span></p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-slate-400 uppercase">Baki Kerja</p>
            <p className="text-sm font-black text-rose-500">{remainingBeg} <span className="text-[10px] text-rose-300">BEG</span></p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-slate-400 uppercase">Produktiviti</p>
            <p className="text-sm font-black text-emerald-500">{currentProductivity} <span className="text-[10px] text-emerald-300">BEG/PEK</span></p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-slate-400 uppercase">Progress Keseluruhan</p>
            <p className="text-sm font-black text-purple-500">{currentProgress}%</p>
          </div>
        </div>
      </form>
    </div>
  );
};
