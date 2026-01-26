import { useState, useEffect, useMemo, useCallback } from 'react';
import { Artist, Painting, Milestone } from '../../types';
import { ARTISTS as localArtists } from '../../data/mockData';
import { googleSheetsService } from '../../services/googleSheets';
import { geminiService } from '../../services/gemini';

const DEFAULT_SHEET_ID = '1M6POiOjOKRJ0-1iB-WvPeRzO3O6TPa_T7014CKzTBqc';

interface UseArtistDataReturn {
  artists: Artist[];
  selectedArtist: Artist;
  selectedPainting: Painting;
  allPaintings: Painting[];
  isInitialLoading: boolean;
  isGeneratingTimeline: boolean;
  error: Error | null;
  selectPainting: (painting: Painting) => void;
  syncFromSpreadsheet: (id: string) => Promise<void>;
  updateArtistTimeline: (artistId: string, timeline: Milestone[]) => void;
}

export function useArtistData(): UseArtistDataReturn {
  const [artists, setArtists] = useState<Artist[]>(localArtists);
  const [selectedPainting, setSelectedPainting] = useState<Painting>(
    localArtists[0]?.paintings[0] || ({} as Painting)
  );
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 全ての画家の作品をフラット化
  const allPaintings = useMemo(() => {
    return artists.flatMap(artist => artist.paintings);
  }, [artists]);

  // 現在選択されている作品の画家を特定
  const selectedArtist = useMemo(() => {
    return (
      artists.find(artist =>
        artist.paintings.some(p => p.id === selectedPainting.id)
      ) || artists[0]
    );
  }, [artists, selectedPainting]);

  // スプレッドシートから同期
  const syncFromSpreadsheet = useCallback(async (id: string) => {
    setIsInitialLoading(true);
    setError(null);

    try {
      const freshArtists = await googleSheetsService.getAllData(id);
      const allPaintingsFromSheet = freshArtists.flatMap(a => a.paintings);

      if (freshArtists.length > 0 && allPaintingsFromSheet.length > 0) {
        setArtists(freshArtists);
        setSelectedPainting(allPaintingsFromSheet[0]);
      } else {
        setArtists(localArtists);
        if (localArtists[0]?.paintings[0]) {
          setSelectedPainting(localArtists[0].paintings[0]);
        }
      }
    } catch (e) {
      console.error('Spreadsheet Sync Error:', e);
      setError(e instanceof Error ? e : new Error('Sync failed'));
      setArtists(localArtists);
      if (localArtists[0]?.paintings[0]) {
        setSelectedPainting(localArtists[0].paintings[0]);
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // 作品選択
  const selectPainting = useCallback((painting: Painting) => {
    setSelectedPainting(painting);
  }, []);

  // 画家のタイムラインを更新
  const updateArtistTimeline = useCallback(
    (artistId: string, timeline: Milestone[]) => {
      setArtists(prevArtists =>
        prevArtists.map(artist =>
          artist.id === artistId ? { ...artist, timeline } : artist
        )
      );
    },
    []
  );

  // 起動時にスプレッドシートから同期
  useEffect(() => {
    const savedId = localStorage.getItem('gs_id') || DEFAULT_SHEET_ID;
    syncFromSpreadsheet(savedId);
  }, [syncFromSpreadsheet]);

  // タイムラインがない場合、AIで生成
  useEffect(() => {
    const generateTimelineIfNeeded = async () => {
      if (!selectedArtist?.name) return;
      if (selectedArtist.timeline && selectedArtist.timeline.length > 0) return;
      if (isGeneratingTimeline) return;

      setIsGeneratingTimeline(true);

      try {
        const paintings = selectedArtist.paintings.map(p => ({
          title: p.title,
          year: p.year,
        }));

        const generatedTimeline = await geminiService.generateEmpathyTimeline(
          selectedArtist.name,
          selectedArtist.period || '',
          selectedArtist.bio || '',
          paintings
        );

        if (generatedTimeline.length > 0) {
          updateArtistTimeline(selectedArtist.id, generatedTimeline);
        }
      } catch (err) {
        console.error('Failed to generate timeline:', err);
      } finally {
        setIsGeneratingTimeline(false);
      }
    };

    generateTimelineIfNeeded();
  }, [selectedArtist?.id, selectedArtist?.name, selectedArtist?.timeline?.length, isGeneratingTimeline, updateArtistTimeline]);

  return {
    artists,
    selectedArtist,
    selectedPainting,
    allPaintings,
    isInitialLoading,
    isGeneratingTimeline,
    error,
    selectPainting,
    syncFromSpreadsheet,
    updateArtistTimeline,
  };
}
