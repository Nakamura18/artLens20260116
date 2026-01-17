import React, { useState, useCallback } from 'react';
import { Painting } from './types';
import ArtworkViewer from './components/ArtworkViewer';
import EmpathyTimeline from './components/EmpathyTimeline';
import GoogleSettings from './components/GoogleSettings';
import {
  Header,
  Footer,
  PaintingList,
  ArtistProfile,
  InsiderStoryPanel,
  LoadingScreen,
} from './src/components';
import { useArtistData, useAICommentary, useSpeechSynthesis } from './src/hooks';

const App: React.FC = () => {
  const [showOverlays, setShowOverlays] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // カスタムフック
  const {
    artists,
    selectedArtist,
    selectedPainting,
    allPaintings,
    isInitialLoading,
    selectPainting,
    syncFromSpreadsheet,
  } = useArtistData();

  const {
    commentary,
    insiderStory,
    isLoadingCommentary,
    isLoadingInsiderStory,
  } = useAICommentary(selectedPainting, selectedArtist);

  const { isReading, toggle: toggleReadAloud, stop: stopReading } = useSpeechSynthesis();

  // 作品選択時のハンドラー
  const handlePaintingChange = useCallback(
    (painting: Painting) => {
      selectPainting(painting);
      setShowOverlays(false);
      stopReading();
    },
    [selectPainting, stopReading]
  );

  // 読み上げトグル
  const handleToggleReadAloud = useCallback(() => {
    const text = selectedPainting.insiderStory || insiderStory;
    if (text && text.trim() !== '' && text !== '深層背景を取得中...') {
      toggleReadAloud(text);
    }
  }, [selectedPainting?.insiderStory, insiderStory, toggleReadAloud]);

  // スプレッドシート同期
  const handleSync = useCallback(
    async (id: string) => {
      await syncFromSpreadsheet(id);
    },
    [syncFromSpreadsheet]
  );

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-amber-500/30">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-amber-500/30">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-1000">
        {/* 左サイドバー: 作品リスト */}
        <aside className="lg:col-span-3 space-y-6 h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar">
          <PaintingList
            paintings={allPaintings}
            artists={artists}
            selectedPainting={selectedPainting}
            onSelect={handlePaintingChange}
          />
          <ArtistProfile artist={selectedArtist} />
        </aside>

        {/* メインビュー */}
        <div className="lg:col-span-9 space-y-8 h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar">
          <ArtworkViewer
            painting={selectedPainting}
            showOverlays={showOverlays}
            onToggleOverlays={() => setShowOverlays(!showOverlays)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            <InsiderStoryPanel
              painting={selectedPainting}
              artist={selectedArtist}
              commentary={commentary}
              insiderStory={insiderStory}
              isLoadingCommentary={isLoadingCommentary}
              isLoadingInsiderStory={isLoadingInsiderStory}
              isReading={isReading}
              onToggleReadAloud={handleToggleReadAloud}
            />
            <EmpathyTimeline artist={selectedArtist} currentYear={selectedPainting.year} />
          </div>
        </div>
      </main>

      <GoogleSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSync={handleSync}
      />

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default App;
