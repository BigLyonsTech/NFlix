import { apiClient } from './client';

export interface AuthResponse {
  token: string;
  id: string;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export function saveSession(auth: AuthResponse) {
  localStorage.setItem('netflix_clone_token', auth.token);
  localStorage.setItem(
    'netflix_clone_user',
    JSON.stringify({ id: auth.id, fullName: auth.fullName, email: auth.email, role: auth.role })
  );
}

export function clearSession() {
  localStorage.removeItem('netflix_clone_token');
  localStorage.removeItem('netflix_clone_user');
}

export function getCurrentUser() {
  const raw = localStorage.getItem('netflix_clone_user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('netflix_clone_token');
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
}
