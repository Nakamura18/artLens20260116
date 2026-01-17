import React from 'react';
import { History, Database } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <History size={20} className="text-black" />
          </div>
          <h1 className="text-xl font-bold font-serif-art tracking-tight">
            Artistic Heartscape Museum
          </h1>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <span className="text-amber-500 cursor-default border-b-2 border-amber-500 pb-1">
            所蔵コレクション
          </span>
          <span className="cursor-default opacity-20">特別企画展</span>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-white"
            title="スプレッドシート同期設定"
          >
            <Database size={20} />
          </button>
          <div className="w-px h-6 bg-slate-800 mx-2"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Connected
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
