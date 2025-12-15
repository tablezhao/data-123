import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getCategories,
  getWebsites,
  getFeaturedWebsites,
  searchWebsites,
  addFavorite,
  removeFavorite,
  isFavorited,
  incrementWebsiteClick,
  recordVisit,
} from '@/db/api';
import { useAuthStore } from '@/stores/authStore';
import type { Category, Website } from '@/types';

// 导入新创建的组件
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SearchBar } from '@/components/common/SearchBar';
import { FeaturedWebsites } from '@/components/common/FeaturedWebsites';
import { CategoryWebsites } from '@/components/common/CategoryWebsites';

export default function HomePage() {
  const { user, signOut } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Website[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [categoriesData, websitesData, featuredData] = await Promise.all([
        getCategories(),
        getWebsites(),
        getFeaturedWebsites(8),
      ]);

      setCategories(categoriesData);
      setWebsites(websitesData);
      setFeaturedWebsites(featuredData);

      // 加载收藏状态
      if (user) {
        const favoriteChecks = await Promise.all(
          websitesData.map((w) => isFavorited(w.id))
        );
        const favIds = new Set(
          websitesData.filter((_, i) => favoriteChecks[i]).map((w) => w.id)
        );
        setFavoriteIds(favIds);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchWebsites(query);
        setSearchResults(results);
      } catch (error) {
        console.error('搜索失败:', error);
        toast.error('搜索失败');
      }
    } else {
      setSearchResults([]);
    }
  }

  async function handleWebsiteClick(website: Website) {
    try {
      await Promise.all([
        incrementWebsiteClick(website.id),
        recordVisit(website.id),
      ]);
      window.open(website.url, '_blank');
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  }

  async function toggleFavorite(websiteId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('请先登录');
      return;
    }

    try {
      if (favoriteIds.has(websiteId)) {
        await removeFavorite(websiteId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(websiteId);
          return next;
        });
        toast.success('已取消收藏');
      } else {
        await addFavorite(websiteId);
        setFavoriteIds((prev) => new Set(prev).add(websiteId));
        toast.success('已添加收藏');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      toast.error('操作失败');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      toast.success('已退出登录');
    } catch (error) {
      console.error('退出失败:', error);
      toast.error('退出失败');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <Header onSignOut={handleSignOut} />

      <main className="container py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <SearchBar query={searchQuery} onSearch={handleSearch} />
        </div>

        {/* 热门推荐 */}
        {!searchQuery && (
          <FeaturedWebsites
            websites={featuredWebsites}
            loading={loading}
            favoriteIds={favoriteIds}
            onWebsiteClick={handleWebsiteClick}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* 分类导航 */}
        <CategoryWebsites
          categories={categories}
          websites={searchQuery ? searchResults : websites}
          loading={loading}
          selectedCategory={selectedCategory}
          favoriteIds={favoriteIds}
          onCategoryChange={setSelectedCategory}
          onWebsiteClick={handleWebsiteClick}
          onToggleFavorite={toggleFavorite}
        />
      </main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
