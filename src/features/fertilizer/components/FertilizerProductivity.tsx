
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { Zap, TrendingUp, Users, Package } from 'lucide-react';

export const FertilizerProductivity: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/fertilizer/entries')
      .then(res => res.json())
      .then(data => setEntries(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Failed to fetch entries', err);
        setEntries([]);
      });
  }, []);

  // Productivity trend (Group by date)
  const dailyStats = (entries || []).reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.date === curr.entry_date);
    if (existing) {
      existing.begs += curr.total_beg_completed;
      existing.workers += curr.workers_count;
    } else {
      acc.push({ 
        date: curr.entry_date, 
        begs: curr.total_beg_completed, 
        workers: curr.workers_count 
      });
    }
    return acc;
  }, [])
  .map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' }),
    productivity: d.workers > 0 ? parseFloat((d.begs / d.workers).toFixed(2)) : 0
  }))
  .sort((a, b) => a.date.localeCompare(b.date));

  const avgProductivity = dailyStats.length > 0 
    ? (dailyStats.reduce((acc, curr) => acc + curr.productivity, 0) / dailyStats.length).toFixed(2) 
    : 0;

  const bestDay = dailyStats.length > 0 ? [...dailyStats].sort((a, b) => b.productivity - a.productivity)[0] : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
           <Zap className="mx-auto text-amber-500 mb-2" size={20} />
           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Avg productivity</p>
           <p className="text-xl font-black text-slate-800 dark:text-white">{avgProductivity}</p>
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Beg / Pekerja</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
           <TrendingUp className="mx-auto text-emerald-500 mb-2" size={20} />
           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Best productivity</p>
           <p className="text-xl font-black text-emerald-600">{bestDay?.productivity || 0}</p>
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{bestDay?.displayDate || '-'}</p>
        </div>
      </div>

       <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Trend Produktiviti</h3>
         <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={dailyStats}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis 
                 dataKey="displayDate" 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 8, fontWeight: 'bold', fill: '#94a3b8' }}
               />
               <YAxis 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 8, fontWeight: 'bold', fill: '#94a3b8' }}
               />
               <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
               />
               <Line 
                 type="monotone" 
                 dataKey="productivity" 
                 stroke="#8b5cf6" 
                 strokeWidth={3} 
                 dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                 activeDot={{ r: 6 }}
                 name="Produktiviti"
               />
             </LineChart>
           </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};
