
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Loader2,
  X,
  AlertTriangle
} from 'lucide-react';
import { getPusInfo } from '../helpers';

export const FertilizerHistory: React.FC<{ authRole: string }> = ({ authRole }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPus, setFilterPus] = useState<number | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteRecordType, setDeleteRecordType] = useState<'ENTRY' | 'TRANSACTION' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const [entriesRes, transactionsRes, inventoryRes] = await Promise.all([
        fetch('/api/fertilizer/entries'),
        fetch('/api/fertilizer/inventory/transactions'),
        fetch('/api/fertilizer/inventory')
      ]);

      const [entriesData, transData, invData] = await Promise.all([
        entriesRes.ok ? entriesRes.json() : [],
        transactionsRes.ok ? transactionsRes.json() : [],
        inventoryRes.ok ? inventoryRes.json() : []
      ]);

      const unifiedData: any[] = [];

      if (Array.isArray(entriesData)) {
        entriesData.forEach((e: any) => {
          unifiedData.push({
            id: e.id,
            recordType: 'ENTRY',
            title: `Blok ${e.blok_code}`,
            subtitle: e.fertilizer_type,
            badge: `PUS ${e.pus}`,
            date: new Date(e.entry_date).toLocaleDateString('en-GB'),
            count1: `${e.total_beg_completed} Beg`,
            count2: `${e.workers_count} Pek`,
            note: e.note,
            searchString: `${e.blok_code} ${e.fertilizer_type} pus ${e.pus}`.toLowerCase(),
            sortDate: new Date(e.entry_date).getTime(),
            pusFilter: e.pus
          });
        });
      }

      if (Array.isArray(transData)) {
        const inTrans = transData.filter((t: any) => t.type === 'IN');
        
        inTrans.forEach((t: any) => {
           const invItem = Array.isArray(invData) ? invData.find((i: any) => i.id === t.inventory_id) : null;
           const invName = invItem ? invItem.name : 'Unknown';
           
           unifiedData.push({
             id: t.id,
             recordType: 'TRANSACTION',
             title: `TERIMA STOK`,
             subtitle: invName,
             badge: `INVENTORI`,
             date: new Date(t.created_at).toLocaleDateString('en-GB'),
             count1: `+${t.quantity} ${invItem?.unit || 'KG'}`,
             count2: undefined,
             note: t.reference || '',
             searchString: `terima stok inventori ${invName}`.toLowerCase(),
             sortDate: new Date(t.created_at).getTime(),
             pusFilter: null
           });
        });
      }

      unifiedData.sort((a, b) => b.sortDate - a.sortDate);
      setEntries(unifiedData);
    } catch (err) {
      console.error('Failed to fetch entries', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, recordType: 'ENTRY' | 'TRANSACTION') => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!id) {
      alert('Ralat: ID rekod tidak dijumpai.');
      return;
    }
    setDeleteConfirmId(id);
    setDeleteRecordType(recordType);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId || !deleteRecordType) return;
    setIsDeleting(true);
    
    try {
      let endpoint = '';
      if (deleteRecordType === 'ENTRY') {
         endpoint = `/api/fertilizer/entries/${deleteConfirmId}`;
      } else {
         endpoint = `/api/fertilizer/inventory/transactions/${deleteConfirmId}`;
      }

      const res = await fetch(endpoint, { method: 'DELETE' });
      const result = await res.json();
      
      if (res.ok) {
        setEntries((prev) => (prev || []).filter(e => e.id !== deleteConfirmId));
        setDeleteConfirmId(null);
        setDeleteRecordType(null);
      } else {
        alert(`Gagal memadam: ${result.error || 'Ralat tidak diketahui'}`);
      }
    } catch (err: any) {
      console.error('Failed to delete', err);
      alert(`Ralat rangkaian: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.searchString.includes(searchTerm.toLowerCase());
    const matchesPus = filterPus === 'all' || e.pusFilter === filterPus || e.pusFilter === null;
    return matchesSearch && matchesPus;
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari Blok atau Jenis Baja..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold text-slate-800 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
           <select 
             value={filterPus}
             onChange={e => setFilterPus(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
             className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-800 dark:text-white"
           >
             <option value="all">Semua PUS</option>
             <option value={1}>PUS 1</option>
             <option value={2}>PUS 2</option>
             <option value={3}>PUS 3</option>
             <option value={4}>PUS 4</option>
           </select>
        </div>
      </div>

      {/* History Table (Mobile List Pattern) */}
      <div className="space-y-2">
        {filteredEntries.map((entry) => (
          <div key={entry.id || Math.random()} className={`bg-white dark:bg-slate-900 p-4 rounded-3xl border ${entry.recordType === 'TRANSACTION' ? 'border-sky-100 dark:border-sky-900/50' : 'border-slate-100 dark:border-slate-800'} shadow-sm flex justify-between items-center group transition-all hover:border-emerald-200`}>
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 ${entry.recordType === 'TRANSACTION' ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'} rounded-xl flex flex-col items-center justify-center font-black`}>
                 <span className={`text-[7px] leading-none uppercase ${entry.recordType === 'TRANSACTION' ? 'mt-1' : 'mb-0.5'}`}>
                   {entry.recordType === 'TRANSACTION' ? 'IN' : 'Blok'}
                 </span>
                 <span className="text-sm leading-none">{entry.recordType === 'TRANSACTION' ? '' : entry.title.replace('Blok ', '')}</span>
               </div>
               <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-800 dark:text-white uppercase leading-none">{entry.subtitle}</span>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${entry.recordType === 'TRANSACTION' ? 'bg-sky-100 dark:bg-sky-900 text-sky-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {entry.badge}
                    </span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1.5 flex items-center gap-2">
                    {entry.date} • {entry.count1}{entry.count2 ? ` • ${entry.count2}` : ''}
                  </p>
                  {entry.note && (
                    <p className="text-[8px] italic text-slate-400 mt-1 truncate max-w-[200px]">"{entry.note}"</p>
                  )}
               </div>
            </div>
            
            <div className="flex items-center gap-1">
              { (authRole === 'fc' || authRole === 'afc' || authRole === 'fs' || authRole === 'admin') && (
                <button 
                  onClickCapture={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteClick(e as any, entry.id, entry.recordType);
                  }}
                  className="relative z-[100] p-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-90 rounded-2xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40 min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer pointer-events-auto"
                  title="Padam Rekod"
                >
                  <Trash2 size={24} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredEntries.length === 0 && (
          <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiada rekod dijumpai</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pl-12 md:pl-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => !isDeleting && setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-white/10 p-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">
                Sahkan Padaman
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Adakah anda pasti mahu memadam rekod ini secara kekal? Tindakan ini tidak boleh dikembalikan.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>Padam</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
