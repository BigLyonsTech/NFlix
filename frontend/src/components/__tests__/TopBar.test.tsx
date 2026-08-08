import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TopBar } from '../TopBar';

describe('TopBar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows Login/Sign Up when not authenticated', () => {
    render(<TopBar authed={false} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  // Regression test: TopBar used to ignore the `authed` prop entirely and
  // always render Login/Sign Up, even for a signed-in user.
  it('shows the account avatar and Sign Out instead of Login/Sign Up when authenticated', () => {
    localStorage.setItem(
      'netflix_clone_user',
      JSON.stringify({ id: '1', fullName: 'Ada Lovelace', email: 'ada@example.com', role: 'USER' })
    );

    render(<TopBar authed={true} onSignOut={vi.fn()} />, { wrapper: MemoryRouter });

    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByTitle('Sign out')).toBeInTheDocument();
  });
});
