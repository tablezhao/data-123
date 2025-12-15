import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { WebsiteCard } from './WebsiteCard';
import type { Category, Website } from '@/types';

interface CategoryWebsitesProps {
  categories: Category[];
  websites: Website[];
  loading: boolean;
  selectedCategory: string;
  favoriteIds: Set<string>;
  onCategoryChange: (categoryId: string) => void;
  onWebsiteClick: (website: Website) => void;
  onToggleFavorite: (websiteId: string, e: React.MouseEvent) => void;
}

export const CategoryWebsites = ({ 
  categories, 
  websites, 
  loading, 
  selectedCategory, 
  favoriteIds, 
  onCategoryChange, 
  onWebsiteClick, 
  onToggleFavorite 
}: CategoryWebsitesProps) => {
  // 按分类分组网站
  const websitesByCategory = categories.reduce((acc, category) => {
    acc[category.id] = websites.filter((w) => w.category_id === category.id);
    return acc;
  }, {} as Record<string, Website[]>);

  // 计算显示的网站
  const displayWebsites = 
    selectedCategory === 'all' 
      ? websites 
      : websites.filter((w) => w.category_id === selectedCategory);

  return (
    <section>
      <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
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
                        <WebsiteCard
                          key={website.id}
                          website={website}
                          isFavorite={favoriteIds.has(website.id)}
                          onWebsiteClick={onWebsiteClick}
                          onToggleFavorite={onToggleFavorite}
                          showCategory={false}
                          showClickCount={false}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayWebsites.map((website) => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  isFavorite={favoriteIds.has(website.id)}
                  onWebsiteClick={onWebsiteClick}
                  onToggleFavorite={onToggleFavorite}
                  showCategory={false}
                  showClickCount={false}
                />
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
  );
};
