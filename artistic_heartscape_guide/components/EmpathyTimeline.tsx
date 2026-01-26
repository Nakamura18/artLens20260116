
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Dot, CartesianGrid, TooltipProps } from 'recharts';
import { Artist } from '../types';

interface EmpathyTimelineProps {
  artist: Artist;
  currentYear: number;
}

interface TimelineDataPoint {
  year: number;
  mood: number;
  event: string;
  description: string;
  color?: string;
}

const EmpathyTimeline: React.FC<EmpathyTimelineProps> = ({ artist, currentYear }) => {
  // データが存在しない場合の処理
  if (!artist || !artist.timeline || artist.timeline.length === 0) {
    return (
      <div className="w-full bg-slate-900/40 p-5 rounded-xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">Empathy Timeline — 心象風景の推移</h3>
        </div>
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          </div>
          <p className="text-slate-500 text-sm">AIが心象風景の推移を生成中...</p>
        </div>
      </div>
    );
  }

  // タイムラインデータを年順にソート
  const sortedTimeline = [...artist.timeline].sort((a, b) => a.year - b.year);
  
  // 画家の生涯の範囲を取得（periodから生年・没年を抽出、またはtimelineの最初と最後の年を使用）
  const extractYearsFromPeriod = (period: string): { birth?: number; death?: number } => {
    const match = period.match(/\((\d{4})-(\d{4})\)/);
    if (match) {
      return { birth: parseInt(match[1]), death: parseInt(match[2]) };
    }
    return {};
  };
  
  const periodYears = extractYearsFromPeriod(artist.period);
  const minYear = periodYears.birth || (sortedTimeline.length > 0 ? sortedTimeline[0].year : 1850);
  const maxYear = periodYears.death || (sortedTimeline.length > 0 ? sortedTimeline[sortedTimeline.length - 1].year : 1900);
  
  // グラフ用のデータを準備（画家の生涯全体をカバー）
  const data = sortedTimeline.map(m => ({
    year: m.year,
    mood: m.mood,
    event: m.event,
    description: m.description,
  }));

  // 作品の制作年を取得（全ての作品の年を表示、重複を除去）
  const paintingYears = [...new Set(artist.paintings?.map(p => p.year) || [])].sort((a, b) => a - b);

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TimelineDataPoint;
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

  // 感情の値に応じて色を決定する関数
  const getMoodColor = (mood: number) => {
    if (mood >= 3) return '#f59e0b'; // 幸福・歓喜（アンバー）
    if (mood >= 1) return '#fbbf24'; // ややポジティブ（ライトアンバー）
    if (mood >= -1) return '#64748b'; // 中立（スレート）
    if (mood >= -3) return '#3b82f6'; // ややネガティブ（ブルー）
    return '#1e40af'; // 苦悩・絶望（ダークブルー）
  };

  // データポイントに色を追加
  const dataWithColors = data.map(d => ({
    ...d,
    color: getMoodColor(d.mood)
  }));

  return (
    <div className="w-full bg-slate-900/40 p-5 rounded-xl border border-slate-800/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">Empathy Timeline — 心象風景の推移</h3>
        <div className="flex gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.6)]"></div>
            <span>幸福・歓喜</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_4px_rgba(37,99,235,0.6)]"></div>
            <span>苦悩・絶望</span>
          </span>
        </div>
      </div>
      <div className="h-64 min-h-[256px] w-full">
        {dataWithColors.length > 0 ? (
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart 
              data={dataWithColors} 
              margin={{ top: 15, right: 20, left: 10, bottom: 15 }}
            >
            <defs>
              {/* 感情の推移を表現するグラデーション（ゼロラインを基準） */}
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.7}/>
                <stop offset="25%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="#64748b" stopOpacity={0.2}/>
                <stop offset="75%" stopColor="#2563eb" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              axisLine={{ stroke: '#475569', strokeWidth: 1 }}
              tickLine={{ stroke: '#475569' }}
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              axisLine={{ stroke: '#475569', strokeWidth: 1 }}
              tickLine={{ stroke: '#475569' }}
              tick={{ fontSize: 10, fill: '#64748b' }}
              domain={[-5, 5]}
            />
            {/* ゼロライン（中立の感情） */}
            <ReferenceLine 
              y={0} 
              stroke="#64748b" 
              strokeWidth={1.5} 
              strokeDasharray="5 5" 
              opacity={0.5}
              label={{ value: '中立', position: 'right', fill: '#64748b', fontSize: 9 }}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5 5' }} 
            />
            <Area 
              type="monotone" 
              dataKey="mood" 
              stroke="#f59e0b" 
              strokeWidth={3}
              fillOpacity={0.4}
              fill="url(#colorMood)"
              baseValue={0}
              animationDuration={2000}
              animationEasing="ease-out"
              dot={({ cx, cy, payload }: any) => {
                if (!payload || payload.mood === undefined) return null;
                const mood = payload.mood;
                const color = getMoodColor(mood);
                const size = Math.abs(mood) >= 3 ? 7 : 5;
                return (
                  <Dot 
                    cx={cx} 
                    cy={cy} 
                    r={size}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={2.5}
                    className="drop-shadow-lg"
                  />
                );
              }}
              activeDot={{ r: 9, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2, className: 'drop-shadow-xl' }}
            />
            {/* 全ての作品の制作年を示す縦線 */}
            {paintingYears.map((year, index) => (
              <ReferenceLine 
                key={`painting-${year}-${index}`}
                x={year} 
                stroke={year === currentYear ? "#f59e0b" : "#64748b"}
                strokeWidth={year === currentYear ? 3 : 1.5}
                strokeDasharray={year === currentYear ? "8 4" : "3 3"}
                opacity={year === currentYear ? 1 : 0.4}
                label={year === currentYear ? { 
                  position: 'top', 
                  value: 'この作品の制作年', 
                  fill: '#f59e0b', 
                  fontSize: 11,
                  fontWeight: 'bold',
                  offset: 8
                } : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500 text-sm">グラフデータがありません</p>
          </div>
        )}
      </div>
      {/* 感情の説明 */}
      <div className="mt-4 pt-4 border-t border-slate-800/50">
        <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
          <div className="text-center">
            <div className="font-bold text-amber-400 mb-1">+3 〜 +5</div>
            <div>最高の幸福</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-400 mb-1">-1 〜 +1</div>
            <div>平穏・中立</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-400 mb-1">-3 〜 -5</div>
            <div>深い苦悩</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpathyTimeline;
