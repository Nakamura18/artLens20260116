
import { GoogleGenAI } from "@google/genai";

// Vite環境変数を使用（VITE_プレフィックスが必要）
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async getCuratorCommentary(paintingTitle: string, artistName: string, year: number) {
    if (!API_KEY) return "AI解説を利用するにはAPIキーの設定が必要です。設定画面からGemini APIキーを登録してください。";

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `あなたは熟練の学芸員です。${artistName}の作品「${paintingTitle}」（${year}年制作）について、教科書的な説明ではなく、当時のスキャンダルや、その時の画家の知られざる感情、時代背景を交えた「裏話」を200文字程度でエモーショナルに語ってください。`,
      });
      return response.text || "解説を取得できませんでした。";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "解説取得中にエラーが発生しました。";
    }
  }

  /**
   * 作品の深層背景（insiderStory）をAIで生成
   */
  async generateInsiderStory(paintingTitle: string, titleEn: string, artistName: string, year: number, location: string) {
    if (!API_KEY) return "";

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
      return response.text || "";
    } catch (error) {
      console.error("Gemini InsiderStory Error:", error);
      return "";
    }
  }
}

export const geminiService = new GeminiService();
