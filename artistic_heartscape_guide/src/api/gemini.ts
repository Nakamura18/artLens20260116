/**
 * Gemini API Proxy Handler
 * Vercel Edge Functions / Cloudflare Workers 用
 *
 * 使用方法:
 * 1. Vercel: api/gemini.ts としてデプロイ
 * 2. Cloudflare Workers: wrangler でデプロイ
 *
 * 環境変数:
 * - GEMINI_API_KEY: Gemini APIキー（サーバーサイドのみ）
 * - ALLOWED_ORIGINS: 許可するオリジン（カンマ区切り）
 */

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
  data?: string | Array<{
    year: number;
    event: string;
    mood: number;
    description: string;
    category: 'personal' | 'historical' | 'artistic';
  }>;
  error?: string;
}

// レートリミット用（簡易実装）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // 1分あたりのリクエスト数
const RATE_WINDOW = 60 * 1000; // 1分

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function validateOrigin(origin: string | null, allowedOrigins: string): boolean {
  if (!origin) return false;
  const allowed = allowedOrigins.split(',').map(o => o.trim());
  return allowed.some(o => origin === o || o === '*');
}

// プロンプト生成関数
function generatePrompt(request: GeminiRequest): string {
  switch (request.type) {
    case 'commentary':
      return `あなたは熟練の学芸員です。${request.artistName}の作品「${request.paintingTitle}」（${request.year}年制作）について、教科書的な説明ではなく、当時のスキャンダルや、その時の画家の知られざる感情、時代背景を交えた「裏話」を200文字程度でエモーショナルに語ってください。`;

    case 'insiderStory':
      return `あなたは美術史の専門家です。以下の絵画について、教科書には載っていない「深層背景」を300文字程度で語ってください。

作品: ${request.paintingTitle}（${request.titleEn}）
画家: ${request.artistName}
制作年: ${request.year}年
制作地: ${request.location}

以下の観点を含めてください：
- この作品が描かれた時の画家の心理状態や私生活の状況
- 当時の社会情勢や芸術界の動向との関連
- 作品に隠された象徴やメッセージ
- 知られざるエピソードや逸話

文学的で情感豊かな文章で、読者が作品に感情移入できるように書いてください。`;

    case 'timeline':
      const paintingsList = request.paintings?.map(p => `「${p.title}」(${p.year}年)`).join('、') || '';
      return `あなたは美術史の専門家です。以下の画家の「心象風景の推移」を年表形式で生成してください。

画家名: ${request.artistName}
活動期間: ${request.period}
経歴: ${request.bio}
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
- JSON形式のみを返し、他のテキストは含めないでください`;

    default:
      throw new Error(`Unknown request type: ${request.type}`);
  }
}

/**
 * Edge Function ハンドラー
 * Vercel: export default function handler(req, res)
 * Cloudflare: export default { async fetch(request, env) }
 */
export async function handleGeminiRequest(
  request: GeminiRequest,
  apiKey: string
): Promise<GeminiResponse> {
  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    const prompt = generatePrompt(request);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return { success: false, error: 'API request failed' };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (request.type === 'timeline') {
      // JSONをパース
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const timeline = JSON.parse(jsonMatch[0]);
        return { success: true, data: timeline };
      }
      return { success: false, error: 'Failed to parse timeline JSON' };
    }

    return { success: true, data: text };
  } catch (error) {
    console.error('Gemini Handler Error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Vercel Edge Function 用エクスポート
export const config = {
  runtime: 'edge',
};

export { checkRateLimit, validateOrigin };
export type { GeminiRequest, GeminiResponse };
