import { vi } from 'vitest';

export function mockSheetResponse(data: string[][]) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({ values: data }),
    text: vi.fn().mockResolvedValue(convertToCSV(data)),
  };
}

export function mockSheetError(status: number, statusText: string) {
  return {
    ok: false,
    status,
    statusText,
    json: vi.fn().mockRejectedValue(new Error(statusText)),
    text: vi.fn().mockRejectedValue(new Error(statusText)),
  };
}

export function convertToCSV(data: string[][]): string {
  return data
    .map(row =>
      row.map(cell => {
        // エスケープが必要な場合はダブルクォートで囲む
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
    .join('\n');
}

// サンプルシートデータ
export const mockArtistSheetData = [
  ['id', 'name', 'period', 'bio', 'avatar'],
  ['van-gogh', 'Vincent van Gogh', '1853-1890', 'Dutch painter', 'https://example.com/avatar.jpg'],
];

export const mockArtworksSheetData = [
  ['year', 'title_jp', 'title_en', 'location', 'collection', 'image_url', 'description', 'artist_id'],
  ['1889', '星月夜', 'Starry Night', 'Saint-Rémy', 'MoMA', 'https://example.com/starry.jpg', 'Famous painting', 'van-gogh'],
  ['1890', 'ひまわり', 'Sunflowers', 'Arles', 'National Gallery', 'https://example.com/sunflowers.jpg', 'Yellow flowers', 'van-gogh'],
];

export const mockTimelineSheetData = [
  ['artist_id', 'year', 'event', 'mood', 'description', 'category'],
  ['van-gogh', '1880', 'Started painting', '2', 'Began his art career', 'artistic'],
  ['van-gogh', '1888', 'Arles period', '4', 'Most productive period', 'artistic'],
];

export const mockOverlaysSheetData = [
  ['painting_id', 'x', 'y', 'title', 'content'],
  ['starry-night', '50', '30', 'Swirling Sky', 'The night sky during asylum'],
  ['starry-night', '70', '60', 'Village', 'The peaceful village below'],
];

// グローバルfetchのモック設定ヘルパー
export function setupMockFetch(responses: Record<string, any>) {
  global.fetch = vi.fn((url: string | URL) => {
    const urlString = url.toString();
    for (const [key, response] of Object.entries(responses)) {
      if (urlString.includes(key)) {
        return Promise.resolve(response);
      }
    }
    // デフォルトは404
    return Promise.resolve(mockSheetError(404, 'Not Found'));
  }) as any;
}

export function clearMockFetch() {
  vi.clearAllMocks();
  (global.fetch as any) = undefined;
}
