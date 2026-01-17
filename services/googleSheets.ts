import { Artist, Painting, Milestone, OverlayNote } from '../types';
import { ARTISTS as DEFAULT_ARTISTS } from '../data/mockData';

// Vite環境変数を使用（VITE_プレフィックスが必要）
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// デフォルトアーティスト（mockData.tsから取得）
const DEFAULT_ARTIST: Artist = DEFAULT_ARTISTS[0] || {
  id: 'van-gogh',
  name: 'Vincent van Gogh',
  period: 'Post-Impressionism (1853-1890)',
  bio: 'オランダの画家。情熱的で鮮やかな色彩と大胆な筆致で知られ、現代美術に多大な影響を与えた。',
  avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg',
  timeline: [],
  paintings: [],
};

type MilestoneCategory = 'personal' | 'historical' | 'artistic';

function validateCategory(value: string | undefined): MilestoneCategory {
  if (value === 'personal' || value === 'historical' || value === 'artistic') {
    return value;
  }
  return 'personal';
}

export class GoogleSheetsService {
  private hasApiKey(): boolean {
    return !!API_KEY && API_KEY.length > 0;
  }

  private async fetchSheetData(spreadsheetId: string, range: string): Promise<string[][]> {
    // APIキーがある場合はGoogle Sheets APIを使用
    if (this.hasApiKey()) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${API_KEY}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch ${range}: ${response.status} ${response.statusText}`);
          // APIキーがあるが失敗した場合は、CSVフォールバックを試す
          return await this.fetchSheetDataCSV(spreadsheetId, range);
        }
        const data = await response.json();
        return data.values || [];
      } catch (error) {
        console.error(`Error fetching sheet range ${range}:`, error);
        // エラー時もCSVフォールバックを試す
        return await this.fetchSheetDataCSV(spreadsheetId, range);
      }
    }

    // APIキーがない場合はCSVエクスポートを使用（公開スプレッドシートの場合）
    return await this.fetchSheetDataCSV(spreadsheetId, range);
  }

  private async fetchSheetDataCSV(spreadsheetId: string, range: string): Promise<string[][]> {
    // 範囲からシート名を抽出（例: 'art!A2:H' -> 'art'）
    let sheetName = range.split('!')[0];
    // シート名がない場合は空文字（最初のシート）
    if (!sheetName || sheetName === range) {
      sheetName = '';
    }

    // CSVエクスポートURL（シート名がある場合は指定、ない場合は最初のシート）
    let url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
    if (sheetName) {
      url += `&sheet=${encodeURIComponent(sheetName)}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch CSV for ${range}: ${response.status} ${response.statusText}`);
        return [];
      }
      const csvText = await response.text();
      // CSVをパース（改善版：引用符内のカンマを考慮）
      const lines = csvText.split('\n').filter(line => line.trim());
      // 範囲がA2以降の場合は最初の行（ヘッダー）をスキップ
      const startRow = range.includes('A2') ? 1 : 0;
      return lines.slice(startRow).map(line => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        return values;
      });
    } catch (error) {
      console.error(`Error fetching CSV for ${range}:`, error);
      return [];
    }
  }

  /**
   * artシートから作品リストを取得
   * スプレッドシート構造:
   * A: year（制作年）
   * B: title_jp（日本語タイトル）
   * C: title_en（英語タイトル）
   * D: location（制作場所）
   * E: collection（所蔵美術館）
   * F: image_url（画像URL）- オプション
   * G: description（説明）- オプション
   * H: insider_story（深層背景）- オプション
   */
  async getArtworksFromSheet(spreadsheetId: string): Promise<Painting[]> {
    // 複数のシート名を試す（art, ArtLens3_0102, 最初のシートなど）
    const sheetNames = ['art', 'ArtLens3_0102', 'Sheet1'];
    let artRaw: string[][] = [];

    for (const sheetName of sheetNames) {
      artRaw = await this.fetchSheetData(spreadsheetId, `${sheetName}!A2:H`);
      if (artRaw.length > 0 && artRaw.some(row => row[0] && row[1])) {
        break; // データが見つかったら終了
      }
    }

    // どのシート名でもデータが取得できなかった場合、最初のシートを試す（シート名なし）
    if (artRaw.length === 0 || !artRaw.some(row => row[0] && row[1])) {
      artRaw = await this.fetchSheetData(spreadsheetId, 'A2:H');
    }

    return artRaw
      .filter(row => row[0] && row[1]) // yearとtitle_jpが必須
      .map((row, index) => ({
        id: `artwork-${index + 1}`,
        year: parseInt(row[0]) || 0,
        title: row[1] || 'Untitled',
        titleEn: row[2] || '',
        location: row[3] || '',
        collection: row[4] || '',
        imageUrl: row[5] || 'https://via.placeholder.com/800x600?text=' + encodeURIComponent(row[1] || 'Artwork'),
        description: row[6] || `${row[3] || ''}で制作された作品。現在${row[4] || '所蔵先不明'}に所蔵されています。`,
        insiderStory: row[7] || '',
        overlays: [],
      }));
  }

  async getAllData(spreadsheetId: string): Promise<Artist[]> {
    try {
      // まずartシートから作品データを取得
      const paintings = await this.getArtworksFromSheet(spreadsheetId);

      // Artistsシートが存在するか確認して取得を試みる
      let artists: Artist[] = [];
      let timelineMilestones: (Milestone & { artistId: string })[] = [];
      let overlays: (OverlayNote & { paintingId: string })[] = [];

      try {
        const [artistsRaw, timelineRaw, overlaysRaw] = await Promise.all([
          this.fetchSheetData(spreadsheetId, 'Artists!A2:E'),
          this.fetchSheetData(spreadsheetId, 'Timeline!A2:F'),
          this.fetchSheetData(spreadsheetId, 'Overlays!A2:F'),
        ]);

        // 画家情報のパース
        artists = artistsRaw.filter(r => r[0]).map(row => ({
          id: row[0],
          name: row[1] || 'Unknown Artist',
          period: row[2] || '',
          bio: row[3] || '',
          avatar: row[4] || 'https://via.placeholder.com/150',
          timeline: [],
          paintings: [],
        }));

        // 感情年表のパース
        timelineMilestones = timelineRaw.filter(r => r[0]).map(row => ({
          artistId: row[0],
          year: parseInt(row[1]) || 0,
          event: row[2] || '',
          mood: parseInt(row[3]) || 0,
          description: row[4] || '',
          category: validateCategory(row[5]),
        }));

        // オーバーレイ注釈のパース
        overlays = overlaysRaw.filter(r => r[0]).map(row => ({
          paintingId: row[0],
          id: row[1],
          x: parseFloat(row[2]) || 0,
          y: parseFloat(row[3]) || 0,
          title: row[4] || '',
          content: row[5] || '',
        }));
      } catch (e) {
        console.warn('Optional sheets (Artists/Timeline/Overlays) not found, using defaults');
      }

      // アーティストがいない場合はデフォルトを使用
      if (artists.length === 0) {
        artists = [{ ...DEFAULT_ARTIST }];
      }

      // 作品にオーバーレイを関連付け
      const paintingsWithOverlays = paintings.map(p => ({
        ...p,
        overlays: overlays.filter(o => o.paintingId === p.id)
      }));

      // 最初のアーティストに全作品を関連付け（シンプルな構成の場合）
      // より複雑な構成では、artシートにartist_id列を追加して関連付け可能
      return artists.map((artist, index) => ({
        ...artist,
        timeline: timelineMilestones
          .filter(m => m.artistId === artist.id)
          .sort((a, b) => a.year - b.year),
        paintings: index === 0 ? paintingsWithOverlays : [] // 最初のアーティストに全作品を割り当て
      }));
    } catch (error) {
      console.error("Spreadsheet Sync Error:", error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
