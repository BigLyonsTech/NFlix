import { beforeEach, describe, expect, it } from 'vitest';
import { clearSession, getCurrentUser, isAdmin, isAuthenticated, saveSession } from '../authApi';

const auth = {
  token: 'jwt-token',
  id: '1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'USER' as const,
};

describe('authApi session helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is not authenticated before any session is saved', () => {
    expect(isAuthenticated()).toBe(false);
    expect(getCurrentUser()).toBeNull();
  });

  it('saveSession stores the token and user, isAuthenticated reflects it', () => {
    saveSession(auth);

    expect(isAuthenticated()).toBe(true);
    expect(getCurrentUser()).toMatchObject({ fullName: 'Ada Lovelace', role: 'USER' });
    expect(isAdmin()).toBe(false);
  });

  it('isAdmin is true only for an ADMIN role', () => {
    saveSession({ ...auth, role: 'ADMIN' });
    expect(isAdmin()).toBe(true);
  });

  it('clearSession removes the token and user', () => {
    saveSession(auth);
    clearSession();

    expect(isAuthenticated()).toBe(false);
    expect(getCurrentUser()).toBeNull();
  });
});
