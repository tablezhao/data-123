import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Search,
  Star,
  ExternalLink,
  Heart,
  TrendingUp,
  Shield,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useTheme } from 'next-themes';
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
import type { Category, Website } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function HomePage() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
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

  const filteredWebsites =
    selectedCategory === 'all'
      ? websites
      : websites.filter((w) => w.category_id === selectedCategory);

  const displayWebsites = searchQuery ? searchResults : filteredWebsites;

  // 按分类分组网站
  const websitesByCategory = categories.reduce((acc, category) => {
    acc[category.id] = displayWebsites.filter((w) => w.category_id === category.id);
    return acc;
  }, {} as Record<string, Website[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">数据合规123导航</h1>
              <p className="text-xs text-muted-foreground">专业的数据合规网站导航</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {profile?.username || '用户'}
                    {isAdmin && <Badge className="ml-2">管理员</Badge>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/favorites">
                      <Heart className="w-4 h-4 mr-2" />
                      我的收藏
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Settings className="w-4 h-4 mr-2" />
                        管理后台
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/login">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索网站名称或描述..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* 热门推荐 */}
        {!searchQuery && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">热门推荐</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredWebsites.map((website) => (
                  <Card
                    key={website.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleWebsiteClick(website)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {website.favicon_url ? (
                            <img
                              src={website.favicon_url}
                              alt=""
                              className="w-6 h-6"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Star className="w-6 h-6 text-primary" />
                          )}
                          <CardTitle className="text-base">{website.title}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => toggleFavorite(website.id, e)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favoriteIds.has(website.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {website.description || '暂无描述'}
                      </CardDescription>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="secondary">{website.category?.name}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {website.click_count} 次访问
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 分类导航 */}
        <section>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">全部</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory}>
              {loading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-8 w-48 bg-muted" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <Skeleton key={j} className="h-24 bg-muted" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedCategory === 'all' ? (
                <div className="space-y-8">
                  {categories.map((category) => {
                    const categoryWebsites = websitesByCategory[category.id] || [];
                    if (categoryWebsites.length === 0) return null;

                    return (
                      <div key={category.id}>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          {category.icon && <span>{category.icon}</span>}
                          {category.name}
                          <span className="text-sm text-muted-foreground">
                            ({categoryWebsites.length})
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryWebsites.map((website) => (
                            <Card
                              key={website.id}
                              className="cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => handleWebsiteClick(website)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2 flex-1">
                                    {website.favicon_url && (
                                      <img
                                        src={website.favicon_url}
                                        alt=""
                                        className="w-5 h-5"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <CardTitle className="text-base truncate">
                                      {website.title}
                                    </CardTitle>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 flex-shrink-0"
                                    onClick={(e) => toggleFavorite(website.id, e)}
                                  >
                                    <Heart
                                      className={`w-4 h-4 ${
                                        favoriteIds.has(website.id)
                                          ? 'fill-red-500 text-red-500'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <CardDescription className="line-clamp-2">
                                  {website.description || '暂无描述'}
                                </CardDescription>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayWebsites.map((website) => (
                    <Card
                      key={website.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleWebsiteClick(website)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {website.favicon_url && (
                              <img
                                src={website.favicon_url}
                                alt=""
                                className="w-5 h-5"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <CardTitle className="text-base truncate">
                              {website.title}
                            </CardTitle>
                            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={(e) => toggleFavorite(website.id, e)}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                favoriteIds.has(website.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {website.description || '暂无描述'}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && displayWebsites.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">暂无网站</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 数据合规123导航. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
