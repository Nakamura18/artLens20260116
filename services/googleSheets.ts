
import { Artist, Painting, Milestone, OverlayNote } from '../types';

// Vite環境変数を使用（VITE_プレフィックスが必要）
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// ゴッホのデフォルト情報（スプレッドシートにArtistsシートがない場合のフォールバック）
const DEFAULT_ARTIST: Artist = {
  id: 'van-gogh',
  name: 'Vincent van Gogh',
  period: 'Post-Impressionism (1853-1890)',
  bio: 'オランダの画家。情熱的で鮮やかな色彩と大胆な筆致で知られ、現代美術に多大な影響を与えた。',
  avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg',
  timeline: [
    { year: 1880, event: '画家の道を志す', mood: 2, description: '伝道師としての挫折の後、絵画の世界へ。', category: 'personal' },
    { year: 1885, event: '「ジャガイモを食べる人々」制作', mood: -1, description: '農民の貧しさと力強さを描く暗い時代。', category: 'artistic' },
    { year: 1886, event: 'パリ移住', mood: 3, description: '印象派との出会い。色彩が劇的に明るくなる。', category: 'personal' },
    { year: 1888, event: 'アルルへ移動', mood: 5, description: '「黄色い家」での共同生活。創作意欲の頂点。', category: 'personal' },
    { year: 1888, event: '耳切り事件', mood: -5, description: 'ゴーギャンとの衝突、精神の崩壊が始まる。', category: 'personal' },
    { year: 1889, event: 'サン＝レミの療養院', mood: -2, description: '「星月夜」を制作。苦悩の中の安らぎ。', category: 'artistic' },
    { year: 1890, event: 'オーヴェール＝シュル＝オワーズ', mood: -4, description: '最後の傑作群を残し、37歳でこの世を去る。', category: 'personal' }
  ],
  paintings: [],
};

export class GoogleSheetsService {
  private hasApiKey(): boolean {
    return !!API_KEY && API_KEY.length > 0;
  }

  private async fetchSheetData(spreadsheetId: string, range: string): Promise<any[]> {
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

  private async fetchSheetDataCSV(spreadsheetId: string, range: string): Promise<any[]> {
    // 範囲からシート名を抽出（例: 'art!A2:H' -> 'art'）
    const sheetName = range.split('!')[0];
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch CSV for ${range}: ${response.status} ${response.statusText}`);
        return [];
      }
      const csvText = await response.text();
      // CSVをパース（簡易版）
      const lines = csvText.split('\n').filter(line => line.trim());
      return lines.map(line => {
        // CSVの各行をカンマで分割（簡易パース、引用符内のカンマは考慮しない）
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
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
    const artRaw = await this.fetchSheetData(spreadsheetId, 'art!A2:H');
    
    return artRaw
      .filter((row: any[]) => row[0] && row[1]) // yearとtitle_jpが必須
      .map((row: any[], index: number) => ({
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
        artists = artistsRaw.filter((r: any[]) => r[0]).map((row: any[]) => ({
          id: row[0],
          name: row[1] || 'Unknown Artist',
          period: row[2] || '',
          bio: row[3] || '',
          avatar: row[4] || 'https://via.placeholder.com/150',
          timeline: [],
          paintings: [],
        }));

        // 感情年表のパース
        timelineMilestones = timelineRaw.filter((r: any[]) => r[0]).map((row: any[]) => ({
          artistId: row[0],
          year: parseInt(row[1]) || 0,
          event: row[2] || '',
          mood: parseInt(row[3]) || 0,
          description: row[4] || '',
          category: (row[5] as any) || 'personal',
        }));

        // オーバーレイ注釈のパース
        overlays = overlaysRaw.filter((r: any[]) => r[0]).map((row: any[]) => ({
          paintingId: row[0],
          id: row[1],
          x: parseFloat(row[2]) || 0,
          y: parseFloat(row[3]) || 0,
          title: row[4] || '',
          content: row[5] || '',
        }));
      } catch (e) {
        console.log('Optional sheets (Artists/Timeline/Overlays) not found, using defaults');
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
