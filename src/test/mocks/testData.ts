import { Painting, Artist, Milestone, OverlayNote } from '../../../types';

export const createMockPainting = (overrides?: Partial<Painting>): Painting => ({
  id: 'test-painting-1',
  title: 'テスト作品',
  titleEn: 'Test Painting',
  year: 1890,
  location: 'Paris',
  collection: 'Test Museum',
  imageUrl: 'https://example.com/image.jpg',
  description: 'Test description',
  insiderStory: '',
  overlays: [],
  ...overrides,
});

export const createMockArtist = (overrides?: Partial<Artist>): Artist => ({
  id: 'test-artist-1',
  name: 'Test Artist',
  period: 'Test Period (1850-1900)',
  bio: 'Test biography',
  avatar: 'https://example.com/avatar.jpg',
  timeline: [],
  paintings: [],
  ...overrides,
});

export const createMockMilestone = (overrides?: Partial<Milestone>): Milestone => ({
  year: 1880,
  event: 'Test Event',
  mood: 0,
  description: 'Test description',
  category: 'artistic',
  ...overrides,
});

export const createMockOverlayNote = (overrides?: Partial<OverlayNote>): OverlayNote => ({
  id: 'test-overlay-1',
  x: 50,
  y: 50,
  title: 'Test Overlay',
  content: 'Test overlay content',
  ...overrides,
});

// 完全なサンプルデータ
export const mockVanGogh: Artist = createMockArtist({
  id: 'van-gogh',
  name: 'Vincent van Gogh',
  period: 'Post-Impressionism (1853-1890)',
  bio: 'Dutch Post-Impressionist painter who is among the most famous and influential figures in the history of Western art.',
  avatar: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg',
  timeline: [
    createMockMilestone({ year: 1880, event: 'Started painting', mood: 2, description: 'Began his art career' }),
    createMockMilestone({ year: 1888, event: 'Arles period', mood: 4, description: 'Most productive period', category: 'artistic' }),
  ],
  paintings: [
    createMockPainting({
      id: 'starry-night',
      title: '星月夜',
      titleEn: 'The Starry Night',
      year: 1889,
      location: 'Saint-Rémy-de-Provence',
      collection: 'Museum of Modern Art',
      overlays: [
        createMockOverlayNote({ x: 50, y: 30, title: 'Swirling Sky', content: 'The night sky painted during his stay in the asylum' }),
      ],
    }),
  ],
});
