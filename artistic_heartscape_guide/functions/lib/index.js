"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gemini = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
const allowedOriginsSecret = (0, params_1.defineSecret)('ALLOWED_ORIGINS');
// 簡易レートリミット
// NOTE: Cloud Functionsは複数インスタンスで実行されるため、このメモリベースの
// レートリミットは完全ではありません。本番環境ではFirestoreやRedis等の
// 永続ストレージを使用するか、Firebase App Checkの導入を検討してください。
const rateLimitMap = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000;
function checkRateLimit(clientIp) {
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
/**
 * リクエストボディのバリデーション
 */
function validateRequest(body) {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: 'Request body must be an object' };
    }
    const req = body;
    // type の検証（必須）
    if (!req.type || !['commentary', 'insiderStory', 'timeline'].includes(req.type)) {
        return { valid: false, error: 'Invalid or missing type. Must be one of: commentary, insiderStory, timeline' };
    }
    // artistName の検証（必須）
    if (!req.artistName || typeof req.artistName !== 'string' || req.artistName.trim() === '') {
        return { valid: false, error: 'artistName is required and must be a non-empty string' };
    }
    // オプションフィールドの型検証
    if (req.paintingTitle !== undefined && typeof req.paintingTitle !== 'string') {
        return { valid: false, error: 'paintingTitle must be a string' };
    }
    if (req.titleEn !== undefined && typeof req.titleEn !== 'string') {
        return { valid: false, error: 'titleEn must be a string' };
    }
    if (req.year !== undefined && typeof req.year !== 'number') {
        return { valid: false, error: 'year must be a number' };
    }
    if (req.location !== undefined && typeof req.location !== 'string') {
        return { valid: false, error: 'location must be a string' };
    }
    if (req.period !== undefined && typeof req.period !== 'string') {
        return { valid: false, error: 'period must be a string' };
    }
    if (req.bio !== undefined && typeof req.bio !== 'string') {
        return { valid: false, error: 'bio must be a string' };
    }
    if (req.paintings !== undefined) {
        if (!Array.isArray(req.paintings)) {
            return { valid: false, error: 'paintings must be an array' };
        }
        for (const p of req.paintings) {
            if (!p || typeof p !== 'object' || typeof p.title !== 'string' || typeof p.year !== 'number') {
                return { valid: false, error: 'Each painting must have title (string) and year (number)' };
            }
        }
    }
    return { valid: true, request: body };
}
function validateOrigin(origin, allowedOrigins) {
    if (!origin)
        return false;
    const allowed = allowedOrigins.split(',').map(o => o.trim());
    return allowed.some(o => origin === o || o === '*');
}
function generatePrompt(request) {
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
        case 'timeline': {
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
        }
        default:
            throw new Error(`Unknown request type: ${request.type}`);
    }
}
async function handleGeminiRequest(request, apiKey) {
    if (!apiKey) {
        return { success: false, error: 'API key not configured' };
    }
    const prompt = generatePrompt(request);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            },
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', errorText);
        return { success: false, error: 'API request failed' };
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (request.type === 'timeline') {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const timeline = JSON.parse(jsonMatch[0]);
                if (!Array.isArray(timeline)) {
                    return { success: false, error: 'Timeline must be an array' };
                }
                return { success: true, data: timeline };
            }
            catch (parseError) {
                console.error('JSON parse error:', parseError);
                return { success: false, error: 'Failed to parse timeline JSON: invalid format' };
            }
        }
        return { success: false, error: 'Failed to parse timeline JSON: no valid JSON found' };
    }
    return { success: true, data: text };
}
exports.gemini = (0, https_1.onRequest)({ region: 'asia-northeast1', secrets: [geminiApiKey, allowedOriginsSecret] }, async (req, res) => {
    const allowedOrigins = allowedOriginsSecret.value() || '*';
    const origin = req.get('origin');
    // プリフライトリクエスト（OPTIONS）でもオリジン検証を実施
    if (req.method === 'OPTIONS') {
        if (!validateOrigin(origin, allowedOrigins)) {
            res.status(403).json({ success: false, error: 'Origin not allowed' });
            return;
        }
        res.set('Access-Control-Allow-Origin', origin || '');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'Method not allowed' });
        return;
    }
    if (!validateOrigin(origin, allowedOrigins)) {
        res.status(403).json({ success: false, error: 'Origin not allowed' });
        return;
    }
    const clientIp = req.ip || req.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(String(clientIp))) {
        res.status(429).json({ success: false, error: 'Rate limit exceeded' });
        return;
    }
    // リクエストボディのバリデーション
    const validation = validateRequest(req.body);
    if (!validation.valid) {
        res.status(400).json({ success: false, error: validation.error });
        return;
    }
    try {
        const apiKey = geminiApiKey.value() || '';
        const result = await handleGeminiRequest(validation.request, apiKey);
        res.set('Access-Control-Allow-Origin', origin || '');
        res.json(result);
    }
    catch (error) {
        console.error('Gemini Handler Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
