import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'user-1' }, signOut: vi.fn() }),
}));

vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    siteName: 'site',
    siteDescription: 'desc',
    showFeaturedSection: true,
  }),
}));

const favoritesDeferred = deferred<Record<string, boolean>>();

vi.mock('@/db/api', () => ({
  getCategories: vi.fn().mockResolvedValue([{ id: 'c1', name: 'cat', parent_id: null, sort_order: 0, icon: null, description: null, is_visible: true, created_at: '', updated_at: '', children: [] }]),
  getWebsites: vi.fn().mockResolvedValue([{ id: 'w1', title: 't', description: 'd', url: 'https://example.com', category_id: 'c1', favicon_url: null, logo_url: null, is_featured: false, is_visible: true, click_count: 0, sort_order: 0, created_at: '', updated_at: '', category: null }]),
  getFeaturedWebsites: vi.fn().mockResolvedValue([]),
  searchWebsites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  isFavorited: vi.fn(),
  areFavorited: vi.fn().mockImplementation(() => favoritesDeferred.promise),
  incrementWebsiteClick: vi.fn(),
  recordVisit: vi.fn(),
}));

vi.mock('@/components/common/Header', () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock('@/components/common/Footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock('@/components/common/SearchBar', () => ({
  SearchBar: () => <div data-testid="searchbar" />,
}));

vi.mock('@/components/common/FeaturedWebsites', () => ({
  FeaturedWebsites: ({ loading }: { loading: boolean }) => (
    <div data-testid="featured" data-loading={String(loading)} />
  ),
}));

vi.mock('@/components/common/CategoryWebsites', () => ({
  CategoryWebsites: ({ loading, favoriteIds }: { loading: boolean; favoriteIds: Set<string> }) => (
    <div
      data-testid="category"
      data-loading={String(loading)}
      data-favorites={String(favoriteIds.size)}
    />
  ),
}));

vi.mock('@/components/common/PageMeta', () => ({
  default: () => null,
}));

describe('HomePage performance', () => {
  it('should not block first render on favorites request', async () => {
    const HomePage = (await import('./HomePage')).default;
    render(<HomePage />);

    expect(screen.getByTestId('category')).toHaveAttribute('data-loading', 'true');

    await waitFor(() => {
      expect(screen.getByTestId('category')).toHaveAttribute('data-loading', 'false');
    });

    expect(screen.getByTestId('category')).toHaveAttribute('data-favorites', '0');

    favoritesDeferred.resolve({ w1: true });

    await waitFor(() => {
      expect(screen.getByTestId('category')).toHaveAttribute('data-favorites', '1');
    });
  });
});
