import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getCategories,
  getWebsites,
  getFeaturedWebsites,
  searchWebsites,
  addFavorite,
  removeFavorite,
  isFavorited,
  areFavorited,
  incrementWebsiteClick,
  recordVisit,
} from '@/db/api';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Category, Website } from '@/types';

// 导入新创建的组件
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SearchBar } from '@/components/common/SearchBar';
import { FeaturedWebsites } from '@/components/common/FeaturedWebsites';
import { CategoryWebsites } from '@/components/common/CategoryWebsites';
import PageMeta from '@/components/common/PageMeta';

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

  const { siteName, siteDescription, showFeaturedSection } = useSettingsStore();

  useEffect(() => {
    loadData();
  }, [user]);

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
        // 使用批量获取收藏状态的 API
        const websiteIds = websitesData.map(w => w.id);
        const favoriteStatuses = await areFavorited(websiteIds);
        const favIds = new Set(
          websitesData.filter(w => favoriteStatuses[w.id]).map(w => w.id)
        );
        setFavoriteIds(favIds);
      } else {
        // 未登录时清空收藏状态
        setFavoriteIds(new Set());
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async (query: string) => {
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
  };

  const handleWebsiteClick = async (website: Website) => {
    try {
      await Promise.all([
        incrementWebsiteClick(website.id),
        recordVisit(website.id),
      ]);
      window.open(website.url, '_blank');
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  };

  const toggleFavorite = async (websiteId: string, e: React.MouseEvent) => {
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
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
    } catch (error) {
      console.error('退出失败:', error);
      toast.error('退出失败');
    }
  };

  // 缓存计算结果，避免不必要的重新计算
  const displayWebsites = useMemo(() => {
    return searchQuery ? searchResults : websites;
  }, [searchQuery, searchResults, websites]);

  return (
    <div className="min-h-screen bg-background">
      {/* 页面元信息 */}
      <PageMeta title={siteName} description={siteDescription} />
      
      {/* 顶部导航栏 */}
      <Header onSignOut={handleSignOut} />

      <main className="container py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <SearchBar query={searchQuery} onSearch={handleSearch} />
        </div>

        {/* 热门推荐 */}
        {!searchQuery && showFeaturedSection && (
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
          websites={displayWebsites}
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
