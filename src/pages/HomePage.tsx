import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { getCategories } from '@/services/categoryService';
import { 
  getWebsites, 
  searchWebsites, 
  incrementWebsiteClick 
} from '@/services/websiteService';
import { 
  addFavorite, 
  removeFavorite, 
  getAllFavoriteIds 
} from '@/services/favoritesService';
import { recordVisit } from '@/services/statsService';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Category, Website } from '@/types';

// 导入新创建的组件
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SearchBar } from '@/components/common/SearchBar';
import { CategoryWebsites } from '@/components/common/CategoryWebsites';
import { FavoritesSection } from '@/components/common/FavoritesSection';
import PageMeta from '@/components/common/PageMeta';

export default function HomePage() {
  const { user, signOut } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Website[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const siteName = useSettingsStore((s) => s.siteName);
  const siteDescription = useSettingsStore((s) => s.siteDescription);

  useEffect(() => {
    let active = true;
    void loadData(() => active, user?.id ?? null);
    return () => {
      active = false;
    };
  }, [user?.id]);

  async function loadData(isActive: () => boolean, userId: string | null) {
    setLoading(true);

    try {
      const promises: Promise<any>[] = [
        getCategories(),
        getWebsites(),
      ];

      if (userId) {
        promises.push(getAllFavoriteIds());
      }

      const results = await Promise.all(promises);
      
      const categoriesData = results[0];
      const websitesData = results[1];
      const favoriteIdsData = userId && results[2] ? results[2] : new Set<string>();

      if (!isActive()) return;

      setCategories(categoriesData);
      setWebsites(websitesData);
      setFavoriteIds(favoriteIdsData);
      setLoading(false);
    } catch (error) {
      if (!isActive()) return;
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
      setFavoriteIds(new Set());
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

        {/* 我的收藏 - 仅在登录且有收藏时显示 */}
        {user && favoriteIds.size > 0 && (
          <div className="mb-8">
            <FavoritesSection
              websites={websites}
              favoriteIds={favoriteIds}
              onWebsiteClick={handleWebsiteClick}
              onToggleFavorite={toggleFavorite}
            />
          </div>
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
