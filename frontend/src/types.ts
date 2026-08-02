export interface Movie {
  id: string;
  title: string;
  thumbnailUrl: string;
  year?: string;
  ageRating?: string;
  duration?: string;
  seasons?: string;
  match?: string;
  genres?: string[];
  progress?: number;
  description?: string;
  backgroundUrl?: string;
  videoUrl?: string;
  rating?: number;
  category?: 'NEW_TRAILER' | 'POPCORN_MANIA' | 'HERO';
}
