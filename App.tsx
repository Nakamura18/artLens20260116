
import React, { useState, useEffect, useMemo } from 'react';
import { ARTISTS as localArtists } from './data/mockData';
import { Artist, Painting } from './types';
import ArtworkViewer from './components/ArtworkViewer';
import EmpathyTimeline from './components/EmpathyTimeline';
import GoogleSettings from './components/GoogleSettings';
import { geminiService } from './services/gemini.ts';
import { googleSheetsService } from './services/googleSheets.ts';
import { 
  BookOpen, 
  Sparkles, 
  User, 
  ChevronRight, 
  History, 
  Database, 
  Loader2,
  Image as ImageIcon,
  MapPin,
  Building2,
  Volume2,
  VolumeX
} from 'lucide-react';

// 指定されたスプレッドシートIDをデフォルトに設定
const DEFAULT_SHEET_ID = '1M6POiOjOKRJ0-1iB-WvPeRzO3O6TPa_T7014CKzTBqc';

const App: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>(localArtists);
  const [selectedPainting, setSelectedPainting] = useState<Painting>(localArtists[0].paintings[0]);
  const [showOverlays, setShowOverlays] = useState(false);
  const [aiCommentary, setAiCommentary] = useState<string>('');
  const [aiInsiderStory, setAiInsiderStory] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingInsiderStory, setIsLoadingInsiderStory] = useState(false);
  const [isGoogleSettingsOpen, setIsGoogleSettingsOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);

  // 全ての画家の作品を一つの所蔵リストとしてフラット化
  const allPaintings = useMemo(() => {
    return artists.flatMap(artist => artist.paintings);
  }, [artists]);

  // 現在選択されている作品を描いた画家を特定
  const selectedArtist = useMemo(() => {
    return artists.find(artist => 
      artist.paintings.some(p => p.id === selectedPainting.id)
    ) || artists[0];
  }, [artists, selectedPainting]);

  const handleSync = async (id: string) => {
    setIsInitialLoading(true);
    try {
      const freshArtists = await googleSheetsService.getAllData(id);
      const allPaintingsFromSheet = freshArtists.flatMap(a => a.paintings);
      
      // スプレッドシートから作品が取得できた場合のみ更新
      if (freshArtists.length > 0 && allPaintingsFromSheet.length > 0) {
        setArtists(freshArtists);
        setSelectedPainting(allPaintingsFromSheet[0]);
      } else {
        // 作品が取得できなかった場合はローカルデータを使用
        console.log("No paintings from spreadsheet, using local data");
        setArtists(localArtists);
        if (localArtists[0]?.paintings[0]) {
          setSelectedPainting(localArtists[0].paintings[0]);
        }
      }
    } catch (e) {
      console.error("Spreadsheet Sync Error:", e);
      // エラー時もローカルデータにフォールバック
      setArtists(localArtists);
      if (localArtists[0]?.paintings[0]) {
        setSelectedPainting(localArtists[0].paintings[0]);
      }
    } finally {
      setIsInitialLoading(false);
    }
  };

  // OSに応じて音声を選択
  useEffect(() => {
    const selectVoiceByOS = () => {
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(v => v.lang.startsWith('ja'));
      
      // OSを検出
      const userAgent = navigator.userAgent.toLowerCase();
      const platform = navigator.platform.toLowerCase();
      const isMac = platform.includes('mac') || userAgent.includes('mac');
      const isWindows = platform.includes('win') || userAgent.includes('windows');
      
      let targetVoiceName = '';
      if (isMac) {
        // macOS: Kyokoを優先、なければ日本語の女性音声を探す
        targetVoiceName = 'Kyoko';
      } else if (isWindows) {
        // Windows: Microsoft Harukaを優先、なければ日本語の女性音声を探す
        targetVoiceName = 'Microsoft Haruka';
      }
      
      // 指定された音声を探す
      let selected = japaneseVoices.find(v => v.name.includes(targetVoiceName));
      
      // 見つからない場合は、日本語の女性音声を探す（KyokoやHaruka以外でも）
      if (!selected && japaneseVoices.length > 0) {
        // デフォルト音声を優先
        selected = japaneseVoices.find(v => v.default) || japaneseVoices[0];
      }
      
      if (selected) {
        setSelectedVoice(selected);
        console.log('選択された音声:', selected.name);
      }
    };
    
    // 音声リストが読み込まれるまで待つ
    const loadVoices = () => {
      selectVoiceByOS();
    };
    
    // 初回読み込み
    loadVoices();
    
    // 音声リストが非同期で読み込まれる場合があるため
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    // 起動時に同期を実行（保存されたIDがなければデフォルトを使用）
    const savedId = localStorage.getItem('gs_id') || DEFAULT_SHEET_ID;
    handleSync(savedId);
  }, []);

  // AI学芸員の解説を取得
  useEffect(() => {
    if (!selectedPainting || !selectedArtist) return;
    const fetchCommentary = async () => {
      setIsLoadingAi(true);
      const comment = await geminiService.getCuratorCommentary(
        selectedPainting.title,
        selectedArtist.name,
        selectedPainting.year
      );
      setAiCommentary(comment);
      setIsLoadingAi(false);
    };
    fetchCommentary();
  }, [selectedPainting, selectedArtist]);

  // 深層背景が空の場合はAIで生成
  useEffect(() => {
    if (!selectedPainting || !selectedArtist) return;
    
    // スプレッドシートにinsiderStoryがある場合はスキップ
    if (selectedPainting.insiderStory && selectedPainting.insiderStory.trim() !== '') {
      setAiInsiderStory('');
      return;
    }
    
    const fetchInsiderStory = async () => {
      setIsLoadingInsiderStory(true);
      const story = await geminiService.generateInsiderStory(
        selectedPainting.title,
        selectedPainting.titleEn || '',
        selectedArtist.name,
        selectedPainting.year,
        selectedPainting.location || ''
      );
      setAiInsiderStory(story);
      setIsLoadingInsiderStory(false);
    };
    fetchInsiderStory();
  }, [selectedPainting, selectedArtist]);

  // コンポーネントのアンマウント時に読み上げを停止
  useEffect(() => {
    return () => {
      if (speechUtterance) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechUtterance]);

  // 画家のtimelineが空の場合、AIで生成
  useEffect(() => {
    const generateTimelineIfNeeded = async () => {
      if (!selectedArtist || !selectedArtist.name) return;
      
      // timelineが既にある場合はスキップ
      if (selectedArtist.timeline && selectedArtist.timeline.length > 0) return;
      
      // 既に生成中の場合はスキップ
      if (isGeneratingTimeline) return;
      
      setIsGeneratingTimeline(true);
      
      try {
        const paintings = selectedArtist.paintings.map(p => ({
          title: p.title,
          year: p.year
        }));
        
        const generatedTimeline = await geminiService.generateEmpathyTimeline(
          selectedArtist.name,
          selectedArtist.period || '',
          selectedArtist.bio || '',
          paintings
        );
        
        if (generatedTimeline.length > 0) {
          // 生成したtimelineをartistに追加
          setArtists(prevArtists => 
            prevArtists.map(artist => 
              artist.id === selectedArtist.id
                ? { ...artist, timeline: generatedTimeline }
                : artist
            )
          );
        }
      } catch (error) {
        console.error("Failed to generate timeline:", error);
      } finally {
        setIsGeneratingTimeline(false);
      }
    };
    
    generateTimelineIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtist?.id]);

  const handlePaintingChange = (painting: Painting) => {
    setSelectedPainting(painting);
    setShowOverlays(false);
    setAiCommentary('');
    setAiInsiderStory('');
    // 読み上げを停止
    if (speechUtterance) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setSpeechUtterance(null);
    }
  };

  const handleReadAloud = () => {
    const text = selectedPainting.insiderStory || aiInsiderStory;
    if (!text || text.trim() === '' || text === '深層背景を取得中...') {
      return;
    }

    // 既に読み上げ中の場合は停止
    if (isReading && speechUtterance) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setSpeechUtterance(null);
      return;
    }

    // 新しい読み上げを開始
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0; // 読み上げ速度（0.1-10、デフォルト1）
    utterance.pitch = 1.0; // 音の高さ（0-2、デフォルト1）
    utterance.volume = 1.0; // 音量（0-1、デフォルト1）
    
    // OSに応じて選択された音声を設定
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsReading(false);
      setSpeechUtterance(null);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsReading(false);
      setSpeechUtterance(null);
    };

    window.speechSynthesis.speak(utterance);
    setIsReading(true);
    setSpeechUtterance(utterance);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-amber-500/30">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <History size={20} className="text-black" />
            </div>
            <h1 className="text-xl font-bold font-serif-art tracking-tight">Artistic Heartscape Museum</h1>
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <span className="text-amber-500 cursor-default border-b-2 border-amber-500 pb-1">所蔵コレクション</span>
            <span className="cursor-default opacity-20">特別企画展</span>
          </div>

          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setIsGoogleSettingsOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-white"
              title="スプレッドシート同期設定"
            >
              <Database size={20} />
            </button>
            <div className="w-px h-6 bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Connected</span>
            </div>
          </div>
        </div>
      </header>

      {isInitialLoading ? (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <div className="relative">
            <Loader2 size={64} className="text-amber-500 animate-spin opacity-20" />
            <ImageIcon size={32} className="text-amber-500 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-slate-400 font-serif-art italic text-lg">スプレッドシートからアーカイブを復元中...</p>
            <p className="text-slate-600 text-[10px] mt-2 uppercase tracking-[0.3em]">Decoding Artistic Memories</p>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-1000">
          {/* 左サイドバー: 作品リスト */}
          <aside className="lg:col-span-3 space-y-6 h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar">
            <section>
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0a0c10] py-2 z-10 border-b border-slate-800/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <ImageIcon size={14} /> 全所蔵作品
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{allPaintings.length} items</span>
              </div>
              <div className="space-y-3">
                {allPaintings.map(painting => {
                  const artist = artists.find(a => a.paintings.some(p => p.id === painting.id));
                  const isSelected = selectedPainting.id === painting.id;
                  
                  return (
                    <button
                      key={painting.id}
                      onClick={() => handlePaintingChange(painting)}
                      className={`w-full group text-left p-2.5 rounded-xl border transition-all duration-500 flex items-center gap-3 ${isSelected ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/5' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'}`}
                    >
                      <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg border border-slate-800">
                        <img 
                          src={painting.imageUrl} 
                          className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} 
                          alt={painting.title} 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate transition-colors ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                          {painting.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                          <MapPin size={10} className="opacity-50" /> {painting.location || '場所不明'} · {painting.year}年
                        </p>
                        <p className="text-[10px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
                          <Building2 size={10} className="opacity-50" /> {painting.collection || '所蔵先不明'}
                        </p>
                      </div>
                      {isSelected && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                <User size={12} /> 画家プロフィール
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <img src={selectedArtist.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-700" alt="" />
                <span className="text-xs font-bold text-slate-300">{selectedArtist.name}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-6">
                {selectedArtist.bio}
              </p>
            </section>
          </aside>

          {/* メインビュー */}
          <div className="lg:col-span-9 space-y-8 h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar">
            <ArtworkViewer 
              painting={selectedPainting} 
              showOverlays={showOverlays} 
              onToggleOverlays={() => setShowOverlays(!showOverlays)} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              <div className="space-y-4">
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 h-full flex flex-col shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-amber-500">
                      <BookOpen size={20} />
                      <h3 className="font-bold">作品の深層背景</h3>
                      {!selectedPainting.insiderStory && aiInsiderStory && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={10} /> AI生成
                        </span>
                      )}
                    </div>
                    {(selectedPainting.insiderStory || aiInsiderStory) && 
                     (selectedPainting.insiderStory || aiInsiderStory) !== '深層背景を取得中...' && (
                      <button
                        onClick={handleReadAloud}
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
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                      <p className="text-slate-500 text-xs">AIが深層背景を生成中...</p>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-base leading-relaxed italic mb-8 border-l-2 border-amber-500/30 pl-4 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ fontSize: '1rem' }}>
                      "{selectedPainting.insiderStory || aiInsiderStory || '深層背景を取得中...'}"
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 font-bold text-slate-500 mb-3 uppercase tracking-widest" style={{ fontSize: '1em' }}>
                      <Sparkles size={12} className="text-amber-500" /> AI学芸員のエモーショナル解説
                    </div>
                    {isLoadingAi ? (
                      <div className="flex gap-1.5 py-2">
                        <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                    ) : (
                      <p className="text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ fontSize: '1rem' }}>
                        {aiCommentary}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 年表 */}
              <div className="space-y-4">
                <EmpathyTimeline artist={selectedArtist} currentYear={selectedPainting.year} />
                <div className="p-5 bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-2xl">
                  <h4 className="font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2" style={{ fontSize: '1em' }}>
                    <History size={12} /> 制作当時の画家の心
                  </h4>
                  <p className="text-slate-400 leading-relaxed" style={{ fontSize: '1em' }}>
                    この作品は、画家の生涯において「{selectedArtist.timeline.find(m => m.year === selectedPainting.year)?.mood ?? '情熱'}」の波が訪れていた時期に描かれました。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      <GoogleSettings 
        isOpen={isGoogleSettingsOpen} 
        onClose={() => setIsGoogleSettingsOpen(false)} 
        onSync={handleSync}
      />

      <footer className="mt-8 py-8 border-t border-slate-800 text-center">
        <p className="font-serif-art text-sm text-slate-500 mb-1">Artistic Heartscape Museum</p>
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em]">&copy; 2024 画家の心象風景を読み解く没入型デジタル・アーカイブ</p>
      </footer>

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
