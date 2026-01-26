import { useState, useEffect, useCallback } from 'react';
import { Artist, Painting } from '../../types';
import { geminiService } from '../../services/gemini';
import { apiCache, CACHE_TTL } from '../utils/cache';

interface UseAICommentaryReturn {
  commentary: string;
  insiderStory: string;
  isLoadingCommentary: boolean;
  isLoadingInsiderStory: boolean;
  error: Error | null;
  refreshCommentary: () => void;
  refreshInsiderStory: () => void;
}

export function useAICommentary(
  painting: Painting | null,
  artist: Artist | null
): UseAICommentaryReturn {
  const [commentary, setCommentary] = useState<string>('');
  const [insiderStory, setInsiderStory] = useState<string>('');
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);
  const [isLoadingInsiderStory, setIsLoadingInsiderStory] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // AI学芸員の解説を取得
  const fetchCommentary = useCallback(async () => {
    if (!painting || !artist) return;

    const cacheKey = apiCache.generateKey(
      'commentary',
      painting.title,
      artist.name,
      painting.year
    );

    // キャッシュチェック
    const cached = apiCache.get<string>(cacheKey);
    if (cached) {
      setCommentary(cached);
      return;
    }

    setIsLoadingCommentary(true);
    setError(null);

    try {
      const result = await geminiService.getCuratorCommentary(
        painting.title,
        artist.name,
        painting.year
      );
      setCommentary(result);
      apiCache.set(cacheKey, result, CACHE_TTL.COMMENTARY);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch commentary'));
    } finally {
      setIsLoadingCommentary(false);
    }
  }, [painting, artist]);

  // 深層背景を取得
  const fetchInsiderStory = useCallback(async () => {
    if (!painting || !artist) return;

    // スプレッドシートにinsiderStoryがある場合はスキップ（AI生成は不要）
    if (painting.insiderStory && painting.insiderStory.trim() !== '') {
      return;
    }

    const cacheKey = apiCache.generateKey(
      'insiderStory',
      painting.title,
      artist.name,
      painting.year
    );

    // キャッシュチェック
    const cached = apiCache.get<string>(cacheKey);
    if (cached) {
      setInsiderStory(cached);
      return;
    }

    setIsLoadingInsiderStory(true);
    setError(null);

    try {
      const result = await geminiService.generateInsiderStory(
        painting.title,
        painting.titleEn || '',
        artist.name,
        painting.year,
        painting.location || ''
      );
      setInsiderStory(result);
      apiCache.set(cacheKey, result, CACHE_TTL.INSIDER_STORY);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch insider story'));
    } finally {
      setIsLoadingInsiderStory(false);
    }
  }, [painting, artist]);

  // 作品・画家変更時に解説を取得
  useEffect(() => {
    setCommentary('');
    fetchCommentary();
  }, [fetchCommentary]);

  // 作品・画家変更時に深層背景を取得
  useEffect(() => {
    setInsiderStory('');
    fetchInsiderStory();
  }, [fetchInsiderStory]);

  // 解説のリフレッシュ（キャッシュを無効化して再取得）
  const refreshCommentary = useCallback(() => {
    if (!painting || !artist) return;
    const cacheKey = apiCache.generateKey(
      'commentary',
      painting.title,
      artist.name,
      painting.year
    );
    apiCache.delete(cacheKey);
    fetchCommentary();
  }, [painting, artist, fetchCommentary]);

  // 深層背景のリフレッシュ
  const refreshInsiderStory = useCallback(() => {
    if (!painting || !artist) return;
    const cacheKey = apiCache.generateKey(
      'insiderStory',
      painting.title,
      artist.name,
      painting.year
    );
    apiCache.delete(cacheKey);
    fetchInsiderStory();
  }, [painting, artist, fetchInsiderStory]);

  return {
    commentary,
    insiderStory,
    isLoadingCommentary,
    isLoadingInsiderStory,
    error,
    refreshCommentary,
    refreshInsiderStory,
  };
}
