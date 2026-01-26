import React from 'react';
import { Painting, Artist } from '../../types';
import { BookOpen, Sparkles, Volume2, VolumeX, History } from 'lucide-react';

interface InsiderStoryPanelProps {
  painting: Painting;
  artist: Artist;
  commentary: string;
  insiderStory: string;
  isLoadingCommentary: boolean;
  isLoadingInsiderStory: boolean;
  isReading: boolean;
  onToggleReadAloud: () => void;
}

const LoadingDots: React.FC = () => (
  <div className="flex gap-1.5">
    <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
  </div>
);

/**
 * 感情値（-5〜5）を日本語の表現に変換
 */
const getMoodLabel = (mood: number): string => {
  if (mood >= 4) return '歓喜';
  if (mood >= 2) return '幸福';
  if (mood >= 1) return '穏やかな喜び';
  if (mood >= -1) return '平穏';
  if (mood >= -2) return '憂い';
  if (mood >= -4) return '苦悩';
  return '絶望';
};

const InsiderStoryPanel: React.FC<InsiderStoryPanelProps> = ({
  painting,
  artist,
  commentary,
  insiderStory,
  isLoadingCommentary,
  isLoadingInsiderStory,
  isReading,
  onToggleReadAloud,
}) => {
  const displayStory = (painting.insiderStory || insiderStory || '').trim();
  const hasStory =
    displayStory && displayStory.trim() !== '' && displayStory !== '深層背景を取得中...';

  // 現在の作品制作年に対応するムード（数値を日本語表現に変換）
  const moodValue = artist.timeline.find(m => m.year === painting.year)?.mood;
  const currentMoodLabel = moodValue !== undefined ? getMoodLabel(moodValue) : '情熱';

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 h-full flex flex-col shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-500">
            <BookOpen size={20} />
            <h3 className="font-bold">作品の深層背景</h3>
            {!painting.insiderStory && insiderStory && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> AI生成
              </span>
            )}
          </div>
          {hasStory && (
            <button
              onClick={onToggleReadAloud}
              className={`p-2 rounded-lg transition-all ${
                isReading
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              }`}
              title={isReading ? '読み上げを停止' : '音声で読み上げる'}
            >
              {isReading ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>

        {isLoadingInsiderStory ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
            <LoadingDots />
            <p className="text-slate-500 text-xs">AIが深層背景を生成中...</p>
          </div>
        ) : (
          <p
            className="text-slate-300 text-base leading-relaxed italic mb-8 border-l-2 border-amber-500/30 pl-4 animate-in fade-in slide-in-from-bottom-2 duration-700"
            style={{ fontSize: '1rem' }}
          >
            "{displayStory || '深層背景を取得中...'}"
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-800/50">
          <div
            className="flex items-center gap-2 font-bold text-slate-500 mb-3 uppercase tracking-widest"
            style={{ fontSize: '1em' }}
          >
            <Sparkles size={12} className="text-amber-500" /> AI学芸員のエモーショナル解説
          </div>
          {isLoadingCommentary ? (
            <div className="flex gap-1.5 py-2">
              <LoadingDots />
            </div>
          ) : (
            <p
              className="text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700"
              style={{ fontSize: '1rem' }}
            >
              {commentary}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-2xl">
        <h4
          className="font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2"
          style={{ fontSize: '1em' }}
        >
          <History size={12} /> 制作当時の画家の心
        </h4>
        <p className="text-slate-400 leading-relaxed" style={{ fontSize: '1em' }}>
          この作品は、画家の生涯において「{currentMoodLabel}」の波が訪れていた時期に描かれました。
        </p>
      </div>
    </div>
  );
};

export default InsiderStoryPanel;
