import React from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <div className="relative">
        <Loader2 size={64} className="text-amber-500 animate-spin opacity-20" />
        <ImageIcon
          size={32}
          className="text-amber-500 absolute inset-0 m-auto animate-pulse"
        />
      </div>
      <div className="text-center">
        <p className="text-slate-400 font-serif-art italic text-lg">
          スプレッドシートからアーカイブを復元中...
        </p>
        <p className="text-slate-600 text-[10px] mt-2 uppercase tracking-[0.3em]">
          Decoding Artistic Memories
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
