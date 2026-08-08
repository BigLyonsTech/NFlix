import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { OuterSidebar } from '../Sidebar';

describe('OuterSidebar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows "Sign in" and does not call onSignOut when not authenticated', () => {
    const onSignOut = vi.fn();
    render(<OuterSidebar authed={false} onSignOut={onSignOut} />, { wrapper: MemoryRouter });

    expect(screen.getByTitle('Sign in')).toBeInTheDocument();
    expect(screen.queryByTitle('Sign out')).not.toBeInTheDocument();
  });

  // Regression test: the bottom user icon used to always navigate to the
  // login form, even for an already-authenticated user, instead of signing
  // them out.
  it('calls onSignOut instead of navigating to login when already authenticated', async () => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();
    render(<OuterSidebar authed={true} onSignOut={onSignOut} />, { wrapper: MemoryRouter });

    const signOutIcon = screen.getByTitle('Sign out');
    expect(signOutIcon).toBeInTheDocument();

    await user.click(signOutIcon);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
