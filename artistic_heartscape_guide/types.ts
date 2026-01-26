
export interface Milestone {
  year: number;
  event: string;
  mood: number; // -5 (Despair) to 5 (Ecstasy)
  description: string;
  category: 'personal' | 'historical' | 'artistic';
}

export interface OverlayNote {
  id: string;
  x: number; // Percentage
  y: number; // Percentage
  title: string;
  content: string;
}

export interface Painting {
  id: string;
  title: string;
  titleEn: string;
  year: number;
  location: string; // 制作場所
  collection: string; // 所蔵美術館
  imageUrl: string;
  description: string;
  insiderStory: string;
  overlays: OverlayNote[];
}

export interface Artist {
  id: string;
  name: string;
  period: string;
  bio: string;
  avatar: string;
  timeline: Milestone[];
  paintings: Painting[];
}
