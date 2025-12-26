import React, { useMemo } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { CompactWebsiteCard } from './CompactWebsiteCard';
import { Button } from '@/components/ui/button';
import type { Website } from '@/types';

interface FavoritesSectionProps {
  websites: Website[];
  favoriteIds: Set<string>;
  onWebsiteClick: (website: Website) => void;
  onToggleFavorite: (websiteId: string, e: React.MouseEvent) => void;
  className?: string;
}

export const FavoritesSection = ({
  websites,
  favoriteIds,
  onWebsiteClick,
  onToggleFavorite,
  className = '',
}: FavoritesSectionProps) => {
  const favoriteWebsites = useMemo(() => {
    return websites.filter((website) => website.is_visible && favoriteIds.has(website.id));
  }, [websites, favoriteIds]);

  if (favoriteWebsites.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-4 animate-in slide-in-from-top-4 fade-in duration-500 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              我的收藏
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {favoriteWebsites.length}
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">
              快速访问您收藏的网站
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all group"
          onClick={() => {
            // 可以在这里添加跳转到收藏页面的逻辑
            window.location.hash = '/favorites';
          }}
        >
          查看全部
          <ArrowRight className="ml-1.5 w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {favoriteWebsites.map((website, index) => (
          <CompactWebsiteCard
            key={website.id}
            website={website}
            onWebsiteClick={onWebsiteClick}
            data-index={index}
            className="animate-in fade-in zoom-in-95 duration-300"
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
};
