import { apiClient } from './client';
import { Movie } from '../types';

export async function fetchWatchlist(): Promise<Movie[]> {
  const { data } = await apiClient.get<Movie[]>('/watchlist');
  return data;
}

export async function addToWatchlist(contentId: string): Promise<void> {
  await apiClient.post(`/watchlist/${contentId}`);
}

export async function removeFromWatchlist(contentId: string): Promise<void> {
  await apiClient.delete(`/watchlist/${contentId}`);
}

export async function fetchContinueWatching(): Promise<Movie[]> {
  const { data } = await apiClient.get<Movie[]>('/continue-watching');
  return data;
}

export async function updateProgress(contentId: string, progress: number): Promise<void> {
  await apiClient.put(`/continue-watching/${contentId}`, { progress });
}
