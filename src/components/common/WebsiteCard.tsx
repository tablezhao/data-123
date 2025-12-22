import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ExternalLink, Star } from 'lucide-react';
import type { Website } from '@/types';

interface WebsiteCardProps {
  website: Website;
  isFavorite: boolean;
  onWebsiteClick: (website: Website) => void;
  onToggleFavorite: (websiteId: string, e: React.MouseEvent) => void;
  showCategory?: boolean;
  showClickCount?: boolean;
}

export const WebsiteCard = ({ 
  website, 
  isFavorite, 
  onWebsiteClick, 
  onToggleFavorite,
  showCategory = true,
  showClickCount = false
}: WebsiteCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onWebsiteClick(website)}
      data-testid="website-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            {website.favicon_url ? (
              <img
                src={website.favicon_url}
                alt=""
                className="w-5 h-5"
                loading={priority ? "eager" : "lazy"}
                width="20"
                height="20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Star className="w-5 h-5 text-primary" />
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
            onClick={(e) => onToggleFavorite(website.id, e)}
            data-testid="favorite-button"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
              data-testid="heart-icon"
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2">
          {website.description || '暂无描述'}
        </CardDescription>
        {(showCategory || showClickCount) && (
          <div className="flex items-center justify-between mt-3">
            {showCategory && website.category && (
              <Badge variant="secondary">{website.category.name}</Badge>
            )}
            {showClickCount && (
              <span className="text-xs text-muted-foreground">
                {website.click_count} 次访问
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
