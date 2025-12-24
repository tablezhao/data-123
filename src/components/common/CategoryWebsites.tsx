import React, { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CompactWebsiteCard } from './CompactWebsiteCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LayoutGrid, ChevronDown } from 'lucide-react';
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

import { useRef, useLayoutEffect } from 'react';

interface ExpandableWebsiteGridProps {
  websites: Website[];
  isExpanded: boolean;
  forceExpand: boolean;
  isMobile: boolean;
  mobileExpandedId: string | null;
  setMobileExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
  onWebsiteClick: (website: Website) => void;
}

const ExpandableWebsiteGrid = ({
  websites,
  isExpanded,
  forceExpand,
  isMobile,
  mobileExpandedId,
  setMobileExpandedId,
  onWebsiteClick
}: ExpandableWebsiteGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);

  // No longer need measurement for strict 10-item display via CSS hiding
  const renderItem = (website: Website, index: number) => {
    const isItemExpanded = isMobile && mobileExpandedId === website.id;
    // Strictly hide items beyond index 9 when collapsed
    if (!isExpanded && index >= 10) return null;

    return (
      <React.Fragment key={website.id}>
        <CompactWebsiteCard
          website={website}
          onWebsiteClick={onWebsiteClick}
          isExpanded={isItemExpanded}
          onExpand={() => setMobileExpandedId(prev => prev === website.id ? null : website.id)}
          data-index={index}
          className={isExpanded && index >= 10 ? "animate-in fade-in zoom-in-95 duration-300" : ""}
        />
        {isItemExpanded && (
          <div className="col-span-full w-full bg-muted/30 border border-border/50 rounded-xl p-4 animate-in slide-in-from-top-2 fade-in duration-200 space-y-3">
            {website.description && (
              <p className="text-sm text-muted-foreground leading-relaxed break-words">
                {website.description}
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground/50">
                {website.click_count || 0} 次访问
              </span>
              <Button 
                size="sm" 
                onClick={() => onWebsiteClick(website)}
                className="h-8 text-xs px-4"
              >
                访问网站
              </Button>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  };

  if (forceExpand || websites.length <= 10) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {websites.map((w, i) => renderItem(w, i))}
      </div>
    );
  }

  return (
    <div 
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 relative"
    >
      {websites.map((w, i) => renderItem(w, i))}
    </div>
  );
};

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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

  // Load expanded states from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('website_expanded_states');
      if (saved) {
        setExpandedCategories(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load expanded states', e);
    }
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = { ...prev, [categoryId]: !prev[categoryId] };
      localStorage.setItem('website_expanded_states', JSON.stringify(next));
      return next;
    });
  };

  // Responsive: Check mobile state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { visibleCategories, visibleCategoryById } = useMemo(() => {
    const visibleCategories = categories.filter((category) => category.is_visible);
    const visibleCategoryById: Record<string, Category> = {};
    for (const category of visibleCategories) {
      visibleCategoryById[category.id] = category;
    }
    return { visibleCategories, visibleCategoryById };
  }, [categories]);

  const websitesByCategory = useMemo(() => {
    const acc: Record<string, Website[]> = {};
    for (const category of visibleCategories) {
      acc[category.id] = [];
    }
    for (const website of websites) {
      if (!visibleCategoryById[website.category_id]) continue;
      (acc[website.category_id] ??= []).push(website);
    }
    return acc;
  }, [visibleCategories, visibleCategoryById, websites]);

  const displayWebsites = useMemo(() => {
    if (selectedCategory === 'all') return null;
    if (!visibleCategoryById[selectedCategory]) return [];
    return websitesByCategory[selectedCategory] || [];
  }, [selectedCategory, visibleCategoryById, websitesByCategory]);

  const hasAnyWebsites = useMemo(() => {
    if (loading) return true;
    if (selectedCategory === 'all') {
      return visibleCategories.some((category) => (websitesByCategory[category.id] || []).length > 0);
    }
    return (displayWebsites || []).length > 0;
  }, [displayWebsites, loading, selectedCategory, visibleCategories, websitesByCategory]);

  const renderWebsiteGrid = (websites: Website[], isExpanded: boolean, forceExpand: boolean = false) => {
    return <ExpandableWebsiteGrid 
      websites={websites} 
      isExpanded={isExpanded} 
      forceExpand={forceExpand}
      isMobile={isMobile}
      mobileExpandedId={mobileExpandedId}
      setMobileExpandedId={setMobileExpandedId}
      onWebsiteClick={onWebsiteClick}
    />;
  };

  return (
    <section className="flex flex-col md:flex-row gap-0 md:gap-6 relative min-h-[600px]">
      <Tabs value={selectedCategory} onValueChange={onCategoryChange} orientation="vertical" className="flex flex-col md:flex-row w-full gap-0 md:gap-8">
        
        {/* Sidebar Container */}
        <div 
            className={`
                shrink-0 transition-all duration-300 ease-in-out
                
                sticky top-16 z-40 w-full overflow-x-auto border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                flex flex-row items-center px-4 py-3 gap-2 scrollbar-hide
                
                md:bg-card/50 md:rounded-2xl md:border md:border-border/50 md:py-4 md:gap-4
                md:sticky md:top-24 md:self-start md:max-h-[calc(100vh-8rem)] md:overflow-y-auto md:scrollbar-none
                md:flex-col md:w-auto md:border-b-0
                
                ${!isMobile && (isCollapsed ? 'md:w-[68px] md:px-2' : 'md:w-60 md:px-4')}
            `}
        >
            {/* Toggle Header (Desktop Only) */}
            {!isMobile && (
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-2 h-8`}>
                    {!isCollapsed && <span className="text-sm font-semibold text-muted-foreground pl-2">分类导航</span>}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                </div>
            )}

            {/* Tabs List */}
            <TabsList className={`
                bg-transparent p-0
                flex flex-row w-max h-auto space-x-2
                md:flex-col md:w-full md:space-x-0 md:space-y-1 md:items-stretch
            `}>
                <TabsTrigger 
                    value="all"
                    className={`
                        relative flex items-center transition-all duration-200
                        
                        justify-center px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap
                        border-border bg-card
                        data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary
                        
                        md:justify-start md:py-3 md:rounded-xl md:border-transparent md:bg-transparent
                        md:data-[state=active]:bg-primary md:data-[state=active]:text-primary-foreground md:data-[state=active]:shadow-md
                        md:hover:bg-muted md:text-muted-foreground
                        
                        ${!isMobile && isCollapsed ? 'md:justify-center md:px-0' : 'md:px-4 md:gap-3'}
                    `}
                    title={(!isMobile && isCollapsed) ? "全部" : undefined}
                >
                    <LayoutGrid className={`shrink-0 ${isMobile ? 'w-4 h-4 mr-1.5' : 'w-5 h-5'}`} />
                    {(isMobile || !isCollapsed) && <span className="truncate">全部</span>}
                </TabsTrigger>
                
                {visibleCategories.map((category) => (
                    <TabsTrigger 
                        key={category.id}
                        value={category.id}
                        className={`
                            relative flex items-center transition-all duration-200
                            
                            justify-center px-3 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap
                            border-border bg-card
                            data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary
                            
                            md:justify-start md:py-3 md:rounded-xl md:border-transparent md:bg-transparent
                            md:data-[state=active]:bg-primary md:data-[state=active]:text-primary-foreground md:data-[state=active]:shadow-md
                            md:hover:bg-muted md:text-muted-foreground
                            
                            ${!isMobile && isCollapsed ? 'md:justify-center md:px-0' : 'md:px-4 md:gap-3'}
                        `}
                        title={(!isMobile && isCollapsed) ? category.name : undefined}
                    >
                        {category.icon ? (
                            <span className={`shrink-0 flex items-center justify-center leading-none ${isMobile ? 'w-4 h-4 mr-1.5 text-base' : 'w-5 h-5 text-lg'}`}>{category.icon}</span>
                        ) : (
                            <div className={`shrink-0 rounded-full bg-muted-foreground/20 ${isMobile ? 'w-4 h-4 mr-1.5' : 'w-5 h-5'}`} />
                        )}
                        {(isMobile || !isCollapsed) && <span className="truncate">{category.name}</span>}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 md:pt-0 pt-4 px-4 md:px-0">
            <TabsContent value={selectedCategory} className="mt-0 space-y-8 animate-in fade-in-50 duration-300">
                {loading ? (
                    <div className="space-y-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                        <Skeleton className="h-7 w-32 bg-muted rounded-lg" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {Array.from({ length: 5 }).map((_, j) => (
                            <Skeleton key={j} className="h-[68px] bg-card border border-border rounded-xl" />
                            ))}
                        </div>
                        </div>
                    ))}
                    </div>
                ) : selectedCategory === 'all' ? (
                    <div className="space-y-12">
                    {visibleCategories.map((category) => {
                        const categoryWebsites = websitesByCategory[category.id] || [];
                        if (categoryWebsites.length === 0) return null;
                        const hasMore = categoryWebsites.length > 10;
                        const isExpanded = expandedCategories[category.id] || false;

                        return (
                        <div 
                            key={category.id}
                            className="scroll-mt-24 md:scroll-mt-20"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {category.icon && <span className="text-xl">{category.icon}</span>}
                                    <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                        {categoryWebsites.length}
                                    </span>
                                </div>
                                {hasMore && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => toggleCategory(category.id)}
                                        className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all group"
                                    >
                                        <span className="font-medium">
                                            {isExpanded ? '收起' : `更多 (${categoryWebsites.length - 10})`}
                                        </span>
                                        <ChevronDown className={`ml-1.5 w-3.5 h-3.5 transition-transform duration-300 group-hover:text-primary ${isExpanded ? 'rotate-180' : ''}`} />
                                    </Button>
                                )}
                            </div>
                            
                            {renderWebsiteGrid(categoryWebsites, isExpanded)}
                        </div>
                        );
                    })}
                    </div>
                ) : (
                    <div>
                        {renderWebsiteGrid(displayWebsites || [], true, true)}
                    </div>
                )}

                {!hasAnyWebsites && (
                    <div className="text-center py-20 bg-muted/50 rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground font-medium">暂无网站</p>
                    </div>
                )}
            </TabsContent>
        </div>
      </Tabs>
    </section>
  );
};
