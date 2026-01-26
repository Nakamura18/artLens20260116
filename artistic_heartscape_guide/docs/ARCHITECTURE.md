# Artistic Heartscape アーキテクチャ改善設計書

## 1. 現状の課題と改善方針

### 1.1 課題サマリー

| 優先度 | カテゴリ | 課題 |
|--------|----------|------|
| 高 | セキュリティ | APIキーがクライアントサイドに露出 |
| 中 | 保守性 | App.tsxが肥大化（515行） |
| 中 | パフォーマンス | API呼び出し結果のキャッシュがない |
| 低 | コード品質 | デバッグログ残存、未使用インポート |

---

## 2. 目標アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Pages     │  │ Components  │  │      Custom Hooks       │ │
│  │  - App.tsx  │  │ - Artwork   │  │ - useArtistData         │ │
│  │             │  │ - Timeline  │  │ - useAICommentary       │ │
│  │             │  │ - Settings  │  │ - useSpeechSynthesis    │ │
│  │             │  │             │  │ - useSpreadsheetSync    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                              │                                  │
│                    ┌─────────▼─────────┐                       │
│                    │   API Service     │                       │
│                    │ (with Cache)      │                       │
│                    └─────────┬─────────┘                       │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Edge Functions    │
                    │ (Cloudflare/Vercel) │
                    │  - /api/gemini      │
                    │  - /api/sheets      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
      ┌───────▼───────┐ ┌─────▼─────┐ ┌───────▼───────┐
      │  Gemini API   │ │  Google   │ │  Environment  │
      │               │ │  Sheets   │ │  Variables    │
      └───────────────┘ └───────────┘ └───────────────┘
```

---

## 3. 改善タスク詳細

### Phase 1: セキュリティ改善（優先度: 高）

#### 3.1.1 APIプロキシの導入

**目的**: APIキーをサーバーサイドに移動し、クライアントから隠蔽

**実装方針**:
- Cloudflare Workers または Vercel Edge Functions を使用
- 環境変数でAPIキーを管理
- レートリミットを実装

**新規ファイル**:
```
/api/
├── gemini.ts          # Gemini API プロキシ
└── sheets.ts          # Google Sheets API プロキシ
```

**`/api/gemini.ts` 設計**:
```typescript
// Cloudflare Workers / Vercel Edge Function
export default async function handler(req: Request) {
  // 1. リクエスト検証（Origin チェック）
  // 2. レートリミットチェック
  // 3. Gemini API 呼び出し（サーバーサイドでAPIキー使用）
  // 4. レスポンス返却
}
```

**フロントエンド変更**:
```typescript
// Before (gemini.ts)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const response = await this.ai.models.generateContent({...});

// After (gemini.ts)
const response = await fetch('/api/gemini', {
  method: 'POST',
  body: JSON.stringify({ paintingTitle, artistName, year })
});
```

---

### Phase 2: コード分割・保守性改善（優先度: 中）

#### 3.2.1 ディレクトリ構造の再編成

**現状**:
```
/
├── App.tsx (515行 - 肥大化)
├── components/
├── services/
├── data/
└── types.ts
```

**改善後**:
```
/src/
├── App.tsx (100行以下)
├── components/
│   ├── ArtworkViewer.tsx
│   ├── EmpathyTimeline.tsx
│   ├── GoogleSettings.tsx
│   ├── Header.tsx (新規)
│   ├── Footer.tsx (新規)
│   ├── PaintingList.tsx (新規)
│   ├── ArtistProfile.tsx (新規)
│   └── InsiderStoryPanel.tsx (新規)
├── hooks/
│   ├── useArtistData.ts (新規)
│   ├── useAICommentary.ts (新規)
│   ├── useSpeechSynthesis.ts (新規)
│   ├── useSpreadsheetSync.ts (新規)
│   └── useAPICache.ts (新規)
├── services/
│   ├── api.ts (新規 - 統合APIクライアント)
│   ├── gemini.ts (リファクタ)
│   └── googleSheets.ts (リファクタ)
├── store/
│   └── artistContext.tsx (新規 - 状態管理)
├── types/
│   ├── index.ts
│   └── api.ts (新規)
├── utils/
│   └── cache.ts (新規)
└── data/
    └── mockData.ts
```

#### 3.2.2 カスタムフック設計

**`useArtistData.ts`**:
```typescript
interface UseArtistDataReturn {
  artists: Artist[];
  selectedArtist: Artist | null;
  selectedPainting: Painting | null;
  allPaintings: Painting[];
  isLoading: boolean;
  error: Error | null;
  selectPainting: (painting: Painting) => void;
  syncFromSpreadsheet: (id: string) => Promise<void>;
}

export function useArtistData(): UseArtistDataReturn {
  // 状態管理ロジックをここに集約
}
```

**`useAICommentary.ts`**:
```typescript
interface UseAICommentaryReturn {
  commentary: string;
  insiderStory: string;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useAICommentary(
  painting: Painting | null,
  artist: Artist | null
): UseAICommentaryReturn {
  // AI解説取得ロジック + キャッシュ
}
```

**`useSpeechSynthesis.ts`**:
```typescript
interface UseSpeechSynthesisReturn {
  isReading: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  speak: (text: string) => void;
  stop: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  // 音声読み上げロジック
}
```

#### 3.2.3 App.tsx の簡素化

**改善後の App.tsx イメージ**:
```typescript
const App: React.FC = () => {
  const {
    artists,
    selectedArtist,
    selectedPainting,
    allPaintings,
    isLoading,
    selectPainting,
    syncFromSpreadsheet
  } = useArtistData();

  const { commentary, insiderStory } = useAICommentary(selectedPainting, selectedArtist);
  const { isReading, speak, stop } = useSpeechSynthesis();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#0a0c10]">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        <PaintingList
          paintings={allPaintings}
          selected={selectedPainting}
          onSelect={selectPainting}
        />
        <ArtworkViewer painting={selectedPainting} />
        <InsiderStoryPanel
          story={insiderStory}
          commentary={commentary}
          onReadAloud={speak}
          isReading={isReading}
        />
        <EmpathyTimeline artist={selectedArtist} />
      </main>
      <Footer />
    </div>
  );
};
```

---

### Phase 3: パフォーマンス改善（優先度: 中）

#### 3.3.1 APIキャッシュの実装

**`utils/cache.ts`**:
```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  generateKey(prefix: string, ...args: (string | number)[]): string {
    return `${prefix}:${args.join(':')}`;
  }
}

export const apiCache = new APICache();
```

**キャッシュ適用例**:
```typescript
async getCuratorCommentary(paintingTitle: string, artistName: string, year: number) {
  const cacheKey = apiCache.generateKey('commentary', paintingTitle, artistName, year);

  // キャッシュチェック
  const cached = apiCache.get<string>(cacheKey);
  if (cached) return cached;

  // API呼び出し
  const result = await this.fetchFromAPI(...);

  // キャッシュ保存
  apiCache.set(cacheKey, result);
  return result;
}
```

---

### Phase 4: コード品質改善（優先度: 低）

#### 3.4.1 型安全性の向上

**`EmpathyTimeline.tsx` の修正**:
```typescript
// Before
const CustomTooltip = ({ active, payload }: any) => { ... }

// After
import { TooltipProps } from 'recharts';

interface TimelineDataPoint {
  year: number;
  mood: number;
  event: string;
  description: string;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as TimelineDataPoint;
  // ...
}
```

#### 3.4.2 クリーンアップタスク

| ファイル | 修正内容 |
|----------|----------|
| `EmpathyTimeline.tsx:59-66` | console.log 削除 |
| `App.tsx:117` | console.log 削除 |
| `App.tsx:492` | 著作権年を動的に（`{new Date().getFullYear()}`） |
| `GoogleSettings.tsx:3` | 未使用インポート削除（CheckCircle2, ExternalLink） |
| `googleSheets.ts:8-24` | DEFAULT_ARTIST を mockData.ts からインポート |

#### 3.4.3 ESLint 警告の解消

**`App.tsx:233-234` の修正**:
```typescript
// Before
useEffect(() => {
  generateTimelineIfNeeded();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedArtist?.id]);

// After
const generateTimelineIfNeeded = useCallback(async () => {
  // ... ロジック
}, [selectedArtist?.id, selectedArtist?.name, selectedArtist?.timeline]);

useEffect(() => {
  generateTimelineIfNeeded();
}, [generateTimelineIfNeeded]);
```

---

## 4. 実装スケジュール

```
Phase 1: セキュリティ改善
├── APIプロキシ設計・実装
├── 環境変数移行
└── フロントエンド修正

Phase 2: コード分割
├── カスタムフック作成
├── コンポーネント分割
└── ディレクトリ再編成

Phase 3: パフォーマンス改善
├── キャッシュ機構実装
└── API呼び出し最適化

Phase 4: コード品質改善
├── 型定義強化
├── デバッグコード削除
└── ESLint警告解消
```

---

## 5. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| APIプロキシ導入によるレイテンシ増加 | ユーザー体験低下 | Edge Functions使用で最小化、キャッシュ併用 |
| 大規模リファクタリングによるリグレッション | 機能破損 | 段階的移行、各Phase完了後に動作確認 |
| Cloudflare/Vercelへの依存 | ベンダーロックイン | 抽象化レイヤーを設けて移行容易に |

---

## 6. 成功基準

- [ ] APIキーがクライアントバンドルに含まれないこと
- [ ] App.tsxが150行以下になること
- [ ] 同一作品の再選択時にAPIキャッシュが効くこと
- [ ] ESLint警告が0件になること
- [ ] 全機能が改修後も正常動作すること
