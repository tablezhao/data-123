import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, ExternalLink, ArrowLeft, Trash2 } from 'lucide-react';
import { getUserFavorites, removeFavorite, incrementWebsiteClick, recordVisit } from '@/db/api';
import type { UserFavorite } from '@/types';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  async function loadFavorites() {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('加载收藏失败:', error);
      toast.error('加载收藏失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFavorite(websiteId: string) {
    try {
      await removeFavorite(websiteId);
      setFavorites((prev) => prev.filter((f) => f.website_id !== websiteId));
      toast.success('已取消收藏');
    } catch (error) {
      console.error('取消收藏失败:', error);
      toast.error('操作失败');
    }
  }

  async function handleWebsiteClick(websiteId: string, url: string) {
    try {
      await Promise.all([
        incrementWebsiteClick(websiteId),
        recordVisit(websiteId),
      ]);
      window.open(url, '_blank');
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                我的收藏
              </h1>
              <p className="text-muted-foreground mt-2">
                共收藏 {favorites.length} 个网站
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-muted" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-4">还没有收藏任何网站</p>
            <Button asChild>
              <Link to="/">去首页浏览</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => {
              const website = favorite.website;
              if (!website) return null;

              return (
                <Card
                  key={favorite.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleWebsiteClick(website.id, website.url)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(website.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2 mb-3">
                      {website.description || '暂无描述'}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{website.category?.name}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {website.click_count} 次访问
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
