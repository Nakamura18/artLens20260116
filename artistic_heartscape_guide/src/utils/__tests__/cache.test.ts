import { describe, test, expect, beforeEach, vi } from 'vitest';
import { apiCache, CACHE_TTL } from '../cache';

describe('APICache', () => {
  beforeEach(() => {
    apiCache.clear();
    vi.clearAllTimers();
  });

  describe('get and set', () => {
    test('should store and retrieve data', () => {
      apiCache.set('test-key', 'test-value');
      expect(apiCache.get('test-key')).toBe('test-value');
    });

    test('should return null for non-existent keys', () => {
      expect(apiCache.get('non-existent')).toBeNull();
    });

    test('should handle different data types', () => {
      // String
      apiCache.set('string-key', 'hello');
      expect(apiCache.get('string-key')).toBe('hello');

      // Number
      apiCache.set('number-key', 42);
      expect(apiCache.get('number-key')).toBe(42);

      // Object
      const obj = { name: 'test', value: 123 };
      apiCache.set('object-key', obj);
      expect(apiCache.get('object-key')).toEqual(obj);

      // Array
      const arr = [1, 2, 3];
      apiCache.set('array-key', arr);
      expect(apiCache.get('array-key')).toEqual(arr);
    });

    test('should overwrite existing keys', () => {
      apiCache.set('key', 'value1');
      apiCache.set('key', 'value2');
      expect(apiCache.get('key')).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    test('should return null after TTL expires', async () => {
      vi.useFakeTimers();
      apiCache.set('expiring-key', 'value', 100); // 100ms TTL

      // Before expiration
      expect(apiCache.get('expiring-key')).toBe('value');

      // After expiration
      vi.advanceTimersByTime(150);
      expect(apiCache.get('expiring-key')).toBeNull();

      vi.useRealTimers();
    });

    test('should return data before TTL expires', async () => {
      vi.useFakeTimers();
      apiCache.set('key', 'value', 1000);

      vi.advanceTimersByTime(500);
      expect(apiCache.get('key')).toBe('value');

      vi.useRealTimers();
    });

    test('should handle custom TTL values', () => {
      vi.useFakeTimers();

      apiCache.set('short-ttl', 'value1', 100);
      apiCache.set('long-ttl', 'value2', 1000);

      vi.advanceTimersByTime(150);
      expect(apiCache.get('short-ttl')).toBeNull();
      expect(apiCache.get('long-ttl')).toBe('value2');

      vi.useRealTimers();
    });
  });

  describe('generateKey', () => {
    test('should generate consistent keys for same inputs', () => {
      const key1 = apiCache.generateKey('prefix', 'arg1', 'arg2');
      const key2 = apiCache.generateKey('prefix', 'arg1', 'arg2');
      expect(key1).toBe(key2);
    });

    test('should generate different keys for different inputs', () => {
      const key1 = apiCache.generateKey('prefix', 'arg1');
      const key2 = apiCache.generateKey('prefix', 'arg2');
      expect(key1).not.toBe(key2);
    });

    test('should sanitize special characters', () => {
      const key = apiCache.generateKey('prefix', 'hello world!', 'test@email.com');
      expect(key).toMatch(/^prefix:hello_world_:test_email_com$/);
    });

    test('should handle undefined parameters', () => {
      const key = apiCache.generateKey('prefix', 'arg1', undefined, 'arg2');
      expect(key).toBe('prefix:arg1:arg2');
    });

    test('should handle Japanese characters', () => {
      const key = apiCache.generateKey('commentary', '星月夜', 'ゴッホ', 1889);
      expect(key).toContain('星月夜');
      expect(key).toContain('ゴッホ');
      expect(key).toContain('1889');
    });

    test('should handle numbers', () => {
      const key = apiCache.generateKey('prefix', 123, 456);
      expect(key).toBe('prefix:123:456');
    });

    test('should handle mixed types', () => {
      const key = apiCache.generateKey('prefix', 'string', 123, 'another');
      expect(key).toBe('prefix:string:123:another');
    });
  });

  describe('delete operations', () => {
    test('should delete specific key', () => {
      apiCache.set('key1', 'value1');
      apiCache.set('key2', 'value2');

      const deleted = apiCache.delete('key1');
      expect(deleted).toBe(true);
      expect(apiCache.get('key1')).toBeNull();
      expect(apiCache.get('key2')).toBe('value2');
    });

    test('should return false for non-existent key', () => {
      const deleted = apiCache.delete('non-existent');
      expect(deleted).toBe(false);
    });

    test('should delete by prefix', () => {
      apiCache.set('commentary:1', 'value1');
      apiCache.set('commentary:2', 'value2');
      apiCache.set('insider:1', 'value3');

      const count = apiCache.deleteByPrefix('commentary');
      expect(count).toBe(2);
      expect(apiCache.get('commentary:1')).toBeNull();
      expect(apiCache.get('commentary:2')).toBeNull();
      expect(apiCache.get('insider:1')).toBe('value3');
    });

    test('should return count of deleted items', () => {
      apiCache.set('test:1', 'v1');
      apiCache.set('test:2', 'v2');
      apiCache.set('test:3', 'v3');

      const count = apiCache.deleteByPrefix('test');
      expect(count).toBe(3);
    });

    test('should return 0 when no matching prefix', () => {
      apiCache.set('key1', 'value1');
      const count = apiCache.deleteByPrefix('non-matching');
      expect(count).toBe(0);
    });
  });

  describe('clear and size', () => {
    test('should clear all cache entries', () => {
      apiCache.set('key1', 'value1');
      apiCache.set('key2', 'value2');
      apiCache.set('key3', 'value3');

      apiCache.clear();
      expect(apiCache.size()).toBe(0);
      expect(apiCache.get('key1')).toBeNull();
      expect(apiCache.get('key2')).toBeNull();
      expect(apiCache.get('key3')).toBeNull();
    });

    test('should report correct cache size', () => {
      expect(apiCache.size()).toBe(0);

      apiCache.set('key1', 'value1');
      expect(apiCache.size()).toBe(1);

      apiCache.set('key2', 'value2');
      expect(apiCache.size()).toBe(2);

      apiCache.delete('key1');
      expect(apiCache.size()).toBe(1);

      apiCache.clear();
      expect(apiCache.size()).toBe(0);
    });
  });

  describe('cleanup', () => {
    test('should remove expired entries', async () => {
      vi.useFakeTimers();

      apiCache.set('expired1', 'value1', 100);
      apiCache.set('expired2', 'value2', 100);
      apiCache.set('valid', 'value3', 1000);

      vi.advanceTimersByTime(150);

      const count = apiCache.cleanup();
      expect(count).toBe(2);
      expect(apiCache.size()).toBe(1);
      expect(apiCache.get('valid')).toBe('value3');

      vi.useRealTimers();
    });

    test('should keep non-expired entries', async () => {
      vi.useFakeTimers();

      apiCache.set('key1', 'value1', 1000);
      apiCache.set('key2', 'value2', 1000);

      vi.advanceTimersByTime(500);

      const count = apiCache.cleanup();
      expect(count).toBe(0);
      expect(apiCache.size()).toBe(2);

      vi.useRealTimers();
    });

    test('should return count of cleaned entries', () => {
      vi.useFakeTimers();

      apiCache.set('exp1', 'v1', 100);
      apiCache.set('exp2', 'v2', 100);
      apiCache.set('exp3', 'v3', 100);

      vi.advanceTimersByTime(150);

      const count = apiCache.cleanup();
      expect(count).toBe(3);

      vi.useRealTimers();
    });

    test('should handle empty cache', () => {
      const count = apiCache.cleanup();
      expect(count).toBe(0);
    });
  });

  describe('boundary conditions', () => {
    test('should handle empty string key', () => {
      apiCache.set('', 'value');
      expect(apiCache.get('')).toBe('value');
    });

    test('should handle empty string value', () => {
      apiCache.set('key', '');
      expect(apiCache.get('key')).toBe('');
    });

    test('should handle null value', () => {
      apiCache.set('key', null);
      expect(apiCache.get('key')).toBeNull();
    });

    test('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      apiCache.set(longKey, 'value');
      expect(apiCache.get(longKey)).toBe('value');
    });

    test('should handle very long values', () => {
      const longValue = 'x'.repeat(10000);
      apiCache.set('key', longValue);
      expect(apiCache.get('key')).toBe(longValue);
    });
  });
});

describe('CACHE_TTL constants', () => {
  test('should have correct TTL values', () => {
    expect(CACHE_TTL.COMMENTARY).toBe(5 * 60 * 1000);
    expect(CACHE_TTL.INSIDER_STORY).toBe(10 * 60 * 1000);
    expect(CACHE_TTL.TIMELINE).toBe(30 * 60 * 1000);
    expect(CACHE_TTL.SPREADSHEET).toBe(2 * 60 * 1000);
  });

  test('should be readonly', () => {
    // TypeScript should prevent this, but test at runtime
    expect(() => {
      (CACHE_TTL as any).COMMENTARY = 1000;
    }).toThrow();
  });
});
