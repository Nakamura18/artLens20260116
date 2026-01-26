
import React, { useState } from 'react';
import { Painting, OverlayNote } from '../types';
import { Info, X, Zap, MapPin, Building2 } from 'lucide-react';

interface ArtworkViewerProps {
  painting: Painting;
  showOverlays: boolean;
  onToggleOverlays: () => void;
}

const ArtworkViewer: React.FC<ArtworkViewerProps> = ({ painting, showOverlays, onToggleOverlays }) => {
  const [activeOverlay, setActiveOverlay] = useState<OverlayNote | null>(null);

  return (
    <div className="relative group w-full aspect-[4/3] md:aspect-video overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl">
      <img 
        src={painting.imageUrl} 
        alt={painting.title}
        className={`w-full h-full object-contain transition-all duration-700 ${showOverlays ? 'scale-105 blur-[2px] opacity-60' : 'scale-100 opacity-100'}`}
      />
      
      {/* Dynamic Overlays */}
      {showOverlays && painting.overlays.map((note) => (
        <button
          key={note.id}
          onClick={() => setActiveOverlay(note)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group/note"
          style={{ left: `${note.x}%`, top: `${note.y}%` }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-amber-500 p-2 rounded-full shadow-lg transition-transform group-hover/note:scale-125">
              <Zap size={16} className="text-white" />
            </div>
          </div>
        </button>
      ))}

      {/* Overlay Content Modal */}
      {activeOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold text-amber-400 font-serif-art">{activeOverlay.title}</h4>
              <button onClick={() => setActiveOverlay(null)} className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              {activeOverlay.content}
            </p>
          </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="absolute bottom-6 right-6 flex gap-3">
        <button 
          onClick={onToggleOverlays}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold text-sm shadow-xl backdrop-blur-md ${showOverlays ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {showOverlays ? <Zap size={18} /> : <Info size={18} />}
          {showOverlays ? '時代背景を表示中' : '時代背景を重ねる'}
        </button>
      </div>

      {/* Title Tag */}
      {!showOverlays && (
        <div className="absolute top-6 left-6 p-4 bg-black/40 backdrop-blur-md border-l-4 border-amber-500 rounded-r-lg">
          <h2 className="text-2xl font-bold font-serif-art leading-tight">{painting.title}</h2>
          {painting.titleEn && (
            <p className="text-slate-500 text-xs italic mt-0.5">{painting.titleEn}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-400 text-sm">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-amber-500/70" />
              {painting.location || '場所不明'} · {painting.year}年
            </span>
            {painting.collection && (
              <span className="flex items-center gap-1">
                <Building2 size={12} className="text-amber-500/70" />
                {painting.collection}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtworkViewer;
