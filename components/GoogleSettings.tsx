
import React, { useState, useEffect } from 'react';
import { X, Database, ExternalLink, Info, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface GoogleSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (id: string) => Promise<void>;
}

const GoogleSettings: React.FC<GoogleSettingsProps> = ({ isOpen, onClose, onSync }) => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('gs_id');
    if (savedId) setSpreadsheetId(savedId);
  }, [isOpen]);

  const handleSync = async () => {
    if (!spreadsheetId) return;
    setIsSyncing(true);
    setError(null);
    try {
      await onSync(spreadsheetId);
      localStorage.setItem('gs_id', spreadsheetId);
      onClose();
    } catch (e) {
      setError("スプレッドシートの取得に失敗しました。IDと公開設定を確認してください。");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Database size={20} className="text-emerald-500" />
            </div>
            <h3 className="font-bold text-lg">Google Sheets 連携</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spreadsheet ID</label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="1A2B3C4D5E6F7G8H9I..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-slate-200"
            />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-3">
            <div className="flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p>
                スプレッドシートを「リンクを知っている全員が閲覧可能」に設定してください。Artists, Paintings, Timeline, Overlaysの各シートが必要です。
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-xs">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-950/30 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-sm font-semibold hover:bg-slate-800 transition-all text-slate-400"
          >
            キャンセル
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing || !spreadsheetId}
            className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            {isSyncing ? <Loader2 size={18} className="animate-spin" /> : 'データを同期'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSettings;
