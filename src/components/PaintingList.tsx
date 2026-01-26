import React from 'react';
import { Painting, Artist } from '../../types';
import { Image as ImageIcon, MapPin, Building2 } from 'lucide-react';

interface PaintingListProps {
  paintings: Painting[];
  artists: Artist[];
  selectedPainting: Painting;
  onSelect: (painting: Painting) => void;
}

const PaintingList: React.FC<PaintingListProps> = ({
  paintings,
  artists,
  selectedPainting,
  onSelect,
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0a0c10] py-2 z-10 border-b border-slate-800/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <ImageIcon size={14} /> 全所蔵作品
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
          {paintings.length} items
        </span>
      </div>
      <div className="space-y-3">
        {paintings.map(painting => {
          const artist = artists.find(a =>
            a.paintings.some(p => p.id === painting.id)
          );
          const isSelected = selectedPainting.id === painting.id;

          return (
            <button
              key={painting.id}
              onClick={() => onSelect(painting)}
              className={`w-full group text-left p-2.5 rounded-xl border transition-all duration-500 flex items-center gap-3 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg border border-slate-800">
                <img
                  src={painting.imageUrl}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isSelected ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                  alt={painting.title}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold truncate transition-colors ${
                    isSelected ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  {painting.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                  <MapPin size={10} className="opacity-50" />{' '}
                  {painting.location || '場所不明'} · {painting.year}年
                </p>
                <p className="text-[10px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
                  <Building2 size={10} className="opacity-50" />{' '}
                  {painting.collection || '所蔵先不明'}
                </p>
              </div>
              {isSelected && (
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PaintingList;
