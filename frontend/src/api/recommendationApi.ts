import { apiClient } from './client';
import { Movie } from '../types';

export interface RecommendationResponse {
  recommendations: Movie[];
  reason: string;
}

export async function fetchRecommendations(): Promise<RecommendationResponse> {
  const { data } = await apiClient.get<RecommendationResponse>('/recommendations');
  return data;
}
