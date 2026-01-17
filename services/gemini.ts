import { GoogleGenAI } from "@google/genai";
import { Milestone } from '../types';
import { apiCache, CACHE_TTL } from '../src/utils/cache';

// Vite環境変数を使用（VITE_プレフィックスが必要）
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async getCuratorCommentary(paintingTitle: string, artistName: string, year: number): Promise<string> {
    if (!API_KEY) return "AI解説を利用するにはAPIキーの設定が必要です。設定画面からGemini APIキーを登録してください。";

    // キャッシュチェック
    const cacheKey = apiCache.generateKey('commentary', paintingTitle, artistName, year);
    const cached = apiCache.get<string>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `あなたは熟練の学芸員です。${artistName}の作品「${paintingTitle}」（${year}年制作）について、教科書的な説明ではなく、当時のスキャンダルや、その時の画家の知られざる感情、時代背景を交えた「裏話」を200文字程度でエモーショナルに語ってください。`,
      });
      const result = response.text || "解説を取得できませんでした。";
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
    if (!API_KEY) return "";

    // キャッシュチェック
    const cacheKey = apiCache.generateKey('insiderStory', paintingTitle, artistName, year);
    const cached = apiCache.get<string>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `あなたは美術史の専門家です。以下の絵画について、教科書には載っていない「深層背景」を300文字程度で語ってください。

作品: ${paintingTitle}（${titleEn}）
画家: ${artistName}
制作年: ${year}年
制作地: ${location}

以下の観点を含めてください：
- この作品が描かれた時の画家の心理状態や私生活の状況
- 当時の社会情勢や芸術界の動向との関連
- 作品に隠された象徴やメッセージ
- 知られざるエピソードや逸話

文学的で情感豊かな文章で、読者が作品に感情移入できるように書いてください。`,
      });
      const result = response.text || "";
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
    if (!API_KEY) return [];

    // キャッシュチェック
    const cacheKey = apiCache.generateKey('timeline', artistName, period);
    const cached = apiCache.get<Milestone[]>(cacheKey);
    if (cached) return cached;

    try {
      const paintingsList = paintings.map(p => `「${p.title}」(${p.year}年)`).join('、');

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `あなたは美術史の専門家です。以下の画家の「心象風景の推移」を年表形式で生成してください。

画家名: ${artistName}
活動期間: ${period}
経歴: ${bio}
主要作品: ${paintingsList}

以下のJSON形式で、5〜8個の重要なマイルストーンを返してください：
[
  {
    "year": 1880,
    "event": "イベント名（20文字以内）",
    "mood": 3,
    "description": "詳細説明（50文字以内）",
    "category": "personal"
  }
]

注意事項：
- moodは-5（絶望）から5（歓喜）の整数
- categoryは "personal"（私生活）, "historical"（歴史的事件）, "artistic"（芸術活動）のいずれか
- 画家の作品制作年を含め、感情の起伏が分かるように
- JSON形式のみを返し、他のテキストは含めないでください`,
      });

      const text = response.text || '';

      // JSONをパース
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const timeline: Milestone[] = JSON.parse(jsonMatch[0]);
        // カテゴリの型を検証
        const validatedTimeline = timeline.map(m => ({
          ...m,
          category: (['personal', 'historical', 'artistic'].includes(m.category)
            ? m.category
            : 'personal') as 'personal' | 'historical' | 'artistic'
        }));
        apiCache.set(cacheKey, validatedTimeline, CACHE_TTL.TIMELINE);
        return validatedTimeline;
      }

      return [];
    } catch (error) {
      console.error("Gemini Timeline Error:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
