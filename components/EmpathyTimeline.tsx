
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Artist, Milestone } from '../types';

interface EmpathyTimelineProps {
  artist: Artist;
  currentYear: number;
}

const EmpathyTimeline: React.FC<EmpathyTimelineProps> = ({ artist, currentYear }) => {
  const data = artist.timeline.map(m => ({
    year: m.year,
    mood: m.mood,
    event: m.event,
    description: m.description,
  })).sort((a, b) => a.year - b.year);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md max-w-xs">
          <p className="text-sm font-bold text-amber-400">{data.year}年</p>
          <p className="text-sm font-semibold mb-1">{data.event}</p>
          <p className="text-xs text-slate-300 leading-relaxed">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-48 bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Empathy Timeline — 心象風景の推移</h3>
        <div className="flex gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> 幸福・歓喜</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div> 苦悩・絶望</span>
        </div>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.1}/>
                <stop offset="50%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis hide domain={[-6, 6]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="mood" 
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#colorMood)" 
              animationDuration={1500}
            />
            <ReferenceLine x={currentYear} stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'top', value: 'Now Viewing', fill: '#f59e0b', fontSize: 10 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmpathyTimeline;
