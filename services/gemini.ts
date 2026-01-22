import { Milestone } from '../types';
import { apiCache, CACHE_TTL } from '../src/utils/cache';

// Gemini API プロキシのエンドポイント
const API_URL = import.meta.env.VITE_GEMINI_API_URL || '';

interface GeminiRequest {
  type: 'commentary' | 'insiderStory' | 'timeline';
  paintingTitle?: string;
  titleEn?: string;
  artistName: string;
  year?: number;
  location?: string;
  period?: string;
  bio?: string;
  paintings?: Array<{ title: string; year: number }>;
}

interface GeminiResponse {
  success: boolean;
  data?: string | Milestone[];
  error?: string;
}

export class GeminiService {
  private async callApi(request: GeminiRequest): Promise<GeminiResponse> {
    if (!API_URL) {
      return { success: false, error: 'API endpoint not configured' };
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return { success: false, error: text || 'API request failed' };
    }

    return response.json() as Promise<GeminiResponse>;
  }

  async getCuratorCommentary(paintingTitle: string, artistName: string, year: number): Promise<string> {
    if (!API_URL) return "AI解説を利用するにはAPIエンドポイントの設定が必要です。";

    // キャッシュチェック
    const cacheKey = apiCache.generateKey('commentary', paintingTitle, artistName, year);
    const cached = apiCache.get<string>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callApi({
        type: 'commentary',
        paintingTitle,
        artistName,
        year,
      });

      if (!response.success || typeof response.data !== 'string') {
        return "解説を取得できませんでした。";
      }

      const result = response.data || "解説を取得できませんでした。";
      apiCache.set(cacheKey, result, CACHE_TTL.COMMENTARY);
      return result;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "解説取得中にエラーが発生しました。";
    }
  }

  /**
   * 作品の深層背景（insiderStory）をAIで生成
   */
  async generateInsiderStory(
    paintingTitle: string,
    titleEn: string,
    artistName: string,
    year: number,
    location: string
  ): Promise<string> {
    if (!API_URL) return "";

    // キャッシュチェック
    const cacheKey = apiCache.generateKey('insiderStory', paintingTitle, artistName, year);
    const cached = apiCache.get<string>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callApi({
        type: 'insiderStory',
        paintingTitle,
        titleEn,
        artistName,
        year,
        location,
      });

      if (!response.success || typeof response.data !== 'string') {
        return "";
      }

      const result = response.data || "";
      apiCache.set(cacheKey, result, CACHE_TTL.INSIDER_STORY);
      return result;
    } catch (error) {
      console.error("Gemini InsiderStory Error:", error);
      return "";
    }
  }

  /**
   * 画家の心象風景タイムラインをAIで生成
   */
  async generateEmpathyTimeline(
    artistName: string,
    period: string,
    bio: string,
    paintings: Array<{ title: string; year: number }>
  ): Promise<Milestone[]> {
    if (!API_URL) return [];

    // キャッシュチェック
    const cacheKey = apiCache.generateKey('timeline', artistName, period);
    const cached = apiCache.get<Milestone[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.callApi({
        type: 'timeline',
        artistName,
        period,
        bio,
        paintings,
      });

      if (!response.success || !Array.isArray(response.data)) {
        return [];
      }

      const timeline = response.data as Milestone[];
      const validatedTimeline = timeline.map(m => ({
        ...m,
        category: (['personal', 'historical', 'artistic'].includes(m.category)
          ? m.category
          : 'personal') as 'personal' | 'historical' | 'artistic'
      }));
      apiCache.set(cacheKey, validatedTimeline, CACHE_TTL.TIMELINE);
      return validatedTimeline;
    } catch (error) {
      console.error("Gemini Timeline Error:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
