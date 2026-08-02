import { apiClient } from './client';
import { Movie } from '../types';

export interface ContentPayload {
  title: string;
  description?: string;
  thumbnailUrl: string;
  backgroundUrl?: string;
  videoUrl?: string;
  year?: string;
  ageRating?: string;
  duration?: string;
  seasons?: string;
  genres?: string[];
  rating?: number;
  category: 'NEW_TRAILER' | 'POPCORN_MANIA' | 'HERO';
}

export async function createContent(payload: ContentPayload): Promise<Movie> {
  const { data } = await apiClient.post<Movie>('/content', payload);
  return data;
}

export async function updateContent(id: string, payload: ContentPayload): Promise<Movie> {
  const { data } = await apiClient.put<Movie>(`/content/${id}`, payload);
  return data;
}

export async function deleteContent(id: string): Promise<void> {
  await apiClient.delete(`/content/${id}`);
}
