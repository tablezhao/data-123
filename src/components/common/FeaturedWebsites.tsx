import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { WebsiteCard } from './WebsiteCard';
import type { Website } from '@/types';

interface FeaturedWebsitesProps {
  websites: Website[];
  loading: boolean;
  favoriteIds: Set<string>;
  onWebsiteClick: (website: Website) => void;
  onToggleFavorite: (websiteId: string, e: React.MouseEvent) => void;
}

export const FeaturedWebsites = ({ 
  websites, 
  loading, 
  favoriteIds, 
  onWebsiteClick, 
  onToggleFavorite 
}: FeaturedWebsitesProps) => {
  return (
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
          {websites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              isFavorite={favoriteIds.has(website.id)}
              onWebsiteClick={onWebsiteClick}
              onToggleFavorite={onToggleFavorite}
              showCategory={true}
              showClickCount={true}
              priority={true}
            />
          ))}
        </div>
      )}
    </section>
  );
};
