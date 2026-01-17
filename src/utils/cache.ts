/**
 * APIキャッシュユーティリティ
 * メモリベースのキャッシュでAPI呼び出しを最適化
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分

  /**
   * キャッシュからデータを取得
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // TTL超過チェック
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * キャッシュにデータを保存
   */
  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * キャッシュキーを生成
   */
  generateKey(prefix: string, ...args: (string | number | undefined)[]): string {
    const sanitizedArgs = args
      .filter((arg): arg is string | number => arg !== undefined)
      .map(arg => String(arg).replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '_'));
    return `${prefix}:${sanitizedArgs.join(':')}`;
  }

  /**
   * 特定のキーを削除
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * プレフィックスに一致するキーをすべて削除
   */
  deleteByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * 全キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * キャッシュサイズを取得
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 期限切れエントリを削除（メンテナンス用）
   */
  cleanup(): number {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
}

// シングルトンインスタンス
export const apiCache = new APICache();

// キャッシュTTL定数
export const CACHE_TTL = {
  COMMENTARY: 5 * 60 * 1000, // 5分
  INSIDER_STORY: 10 * 60 * 1000, // 10分
  TIMELINE: 30 * 60 * 1000, // 30分
  SPREADSHEET: 2 * 60 * 1000, // 2分
} as const;
