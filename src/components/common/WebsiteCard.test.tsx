import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebsiteCard } from './WebsiteCard';
import type { Website } from '@/types';

// Mock数据
const mockWebsite: Website = {
  id: 'test-123',
  title: '测试网站',
  description: '这是一个测试网站的描述',
  url: 'https://example.com',
  category_id: 'cat-1',
  favicon_url: 'https://example.com/favicon.ico',
  is_featured: false,
  is_visible: true,
  click_count: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: {
    id: 'cat-1',
    name: '测试分类',
    parent_id: null,
    sort_order: 0,
    icon: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    children: [],
  },
};

describe('WebsiteCard', () => {
  it('应该正确渲染网站信息', () => {
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={false}
        onWebsiteClick={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    // 检查标题是否渲染
    expect(screen.getByText('测试网站')).toBeInTheDocument();
    // 检查描述是否渲染
    expect(screen.getByText('这是一个测试网站的描述')).toBeInTheDocument();
    // 检查分类是否渲染
    expect(screen.getByText('测试分类')).toBeInTheDocument();
  });

  it('应该在点击卡片时调用onWebsiteClick', () => {
    const onWebsiteClick = vi.fn();
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={false}
        onWebsiteClick={onWebsiteClick}
        onToggleFavorite={vi.fn()}
      />
    );

    // 点击卡片（使用data-testid）
    fireEvent.click(screen.getByTestId('website-card'));
    
    // 检查回调是否被调用
    expect(onWebsiteClick).toHaveBeenCalledWith(mockWebsite);
  });

  it('应该在点击收藏按钮时调用onToggleFavorite', () => {
    const onToggleFavorite = vi.fn();
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={false}
        onWebsiteClick={vi.fn()}
        onToggleFavorite={onToggleFavorite}
      />
    );

    // 点击收藏按钮
    fireEvent.click(screen.getByTestId('favorite-button'));
    
    // 检查回调是否被调用
    expect(onToggleFavorite).toHaveBeenCalled();
  });

  it('应该正确显示未收藏状态', () => {
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={false}
        onWebsiteClick={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );
    
    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).not.toHaveClass('fill-red-500');
    expect(heartIcon).toHaveClass('text-muted-foreground');
  });

  it('应该正确显示已收藏状态', () => {
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={true}
        onWebsiteClick={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );
    
    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveClass('fill-red-500');
    expect(heartIcon).toHaveClass('text-red-500');
  });

  it('应该根据showCategory属性显示分类', () => {
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={false}
        onWebsiteClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        showCategory={true}
      />
    );
    
    expect(screen.getByText('测试分类')).toBeInTheDocument();
  });

  it('应该根据showCategory属性隐藏分类', () => {
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={false}
        onWebsiteClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        showCategory={false}
      />
    );
    
    expect(screen.queryByText('测试分类')).not.toBeInTheDocument();
  });

  it('应该根据showClickCount属性显示点击数', () => {
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={false}
        onWebsiteClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        showClickCount={true}
      />
    );
    
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('应该根据showClickCount属性隐藏点击数', () => {
    render(
      <WebsiteCard
        website={mockWebsite}
        isFavorite={false}
        onWebsiteClick={vi.fn()}
        onToggleFavorite={vi.fn()}
        showClickCount={false}
      />
    );
    
    expect(screen.queryByText(/100/)).not.toBeInTheDocument();
  });
});
