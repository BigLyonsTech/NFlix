import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ImmersiveView } from '../ImmersiveView';
import { fetchContentByCategory } from '../../api/contentApi';
import type { Movie } from '../../types';

vi.mock('../../api/contentApi', () => ({
  fetchContentByCategory: vi.fn(),
}));

const movie: Movie = {
  id: '1',
  title: 'Untitled Backdrop',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  backgroundUrl: undefined,
};

async function getBackgroundImg(container: HTMLElement) {
  await waitFor(() => expect(container.querySelector('.absolute.inset-0 img')).not.toBeNull());
  return container.querySelector('.absolute.inset-0 img') as HTMLImageElement;
}

describe('ImmersiveView', () => {
  // Regression test: the full-bleed background <img> used movie.backgroundUrl
  // with no fallback, so any content missing that optional field (e.g. the
  // seeded HERO items, or any admin-added content) rendered a blank/black box.
  // Note: the component also renders a second <img> per movie (bottom
  // carousel thumbnail, always thumbnailUrl) with the same alt text, so the
  // background image is targeted specifically via its wrapping container.
  it('falls back to thumbnailUrl when backgroundUrl is missing', async () => {
    vi.mocked(fetchContentByCategory).mockResolvedValue([movie]);

    const { container } = render(<ImmersiveView />, { wrapper: MemoryRouter });
    const backgroundImg = await getBackgroundImg(container);

    expect(backgroundImg).toHaveAttribute('src', 'https://example.com/thumb.jpg');
    expect(container.querySelectorAll('.absolute.inset-0 img')).toHaveLength(1);
  });

  it('uses backgroundUrl when it is present', async () => {
    vi.mocked(fetchContentByCategory).mockResolvedValue([
      { ...movie, backgroundUrl: 'https://example.com/bg.jpg' },
    ]);

    const { container } = render(<ImmersiveView />, { wrapper: MemoryRouter });
    const backgroundImg = await getBackgroundImg(container);

    expect(backgroundImg).toHaveAttribute('src', 'https://example.com/bg.jpg');
  });
});
