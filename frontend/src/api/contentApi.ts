import { apiClient } from './client';
import { Movie } from '../types';

export async function fetchContent(params?: { search?: string; category?: string }): Promise<Movie[]> {
  const { data } = await apiClient.get<Movie[]>('/content', { params });
  return data;
}

export async function fetchContentByCategory(category: string): Promise<Movie[]> {
  return fetchContent({ category });
}

export async function searchContent(query: string): Promise<Movie[]> {
  if (!query) return [];
  return fetchContent({ search: query });
}

export async function fetchContentById(id: string): Promise<Movie> {
  const { data } = await apiClient.get<Movie>(`/content/${id}`);
  return data;
}
