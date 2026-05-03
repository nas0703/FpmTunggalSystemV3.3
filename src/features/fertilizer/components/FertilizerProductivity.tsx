
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { Zap, TrendingUp, Users, Package, Calendar } from 'lucide-react';

const mockGanttData = [
  {
    name: 'PUS 1 (Felda 12)',
    planned: [new Date(2026, 1, 1).getTime(), new Date(2026, 2, 31).getTime()], // Feb - Mac
    progress: 75, 
    color: '#a855f7' // purple-500
  },
  {
    name: 'PUS 2 (Organic)',
    planned: [new Date(2026, 3, 1).getTime(), new Date(2026, 4, 31).getTime()], // Apr - Mei
    progress: 0,
    color: '#10b981' // emerald-500
  },
  {
    name: 'PUS 3 (Felda 12)',
    planned: [new Date(2026, 5, 1).getTime(), new Date(2026, 6, 31).getTime()], // Jun - Jul
    progress: 0,
    color: '#a855f7' // purple-500
  },
  {
    name: 'PUS 4 (Organic)',
    planned: [new Date(2026, 7, 1).getTime(), new Date(2026, 8, 30).getTime()], // Ogo - Sep
    progress: 0,
    color: '#10b981' // emerald-500
  }
];

const GanttBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  const progressWidth = (width * payload.progress) / 100;
  const barHeight = 24;
  const barY = y + (height - barHeight) / 2;
  
  return (
    <g>
      {/* Background (Planned timeframe) */}
      <rect x={x} y={barY} width={width} height={barHeight} fill={payload.color} opacity={0.2} rx={6} />
      {/* Foreground (Actual progress) */}
      {progressWidth > 0 && (
         <rect x={x} y={barY} width={progressWidth} height={barHeight} fill={payload.color} rx={6} />
      )}
      {/* Percentage text */}
      <text x={x + progressWidth + 8} y={barY + barHeight / 2 + 4} fill={payload.progress > 0 ? payload.color : '#94a3b8'} fontSize={10} fontWeight="900">
        {payload.progress}%
      </text>
    </g>
  );
};

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
      {/* Gantt Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-emerald-500" size={16} />
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">
            Gantt Chart: Program vs Kemajuan
          </h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={mockGanttData} margin={{ top: 0, right: 40, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                domain={[new Date(2026, 0, 1).getTime(), new Date(2026, 11, 31).getTime()]} 
                tickFormatter={(tick) => new Date(tick).toLocaleDateString('ms-MY', { month: 'short' })}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                labelFormatter={(value) => value}
                formatter={(value: any, name: string, props: any) => [
                  `${props.payload.progress}% Siap`,
                  'Kemajuan'
                ]}
              />
              <Bar dataKey="planned" shape={<GanttBar />} isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
           <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
             <div className="w-3 h-3 rounded-md bg-emerald-500 opacity-20"></div> Tempoh Program
           </div>
           <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
             <div className="w-3 h-3 rounded-md bg-emerald-500"></div> Telah Dilaksanakan
           </div>
        </div>
      </div>

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

