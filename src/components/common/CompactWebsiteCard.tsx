import React from 'react';
import { Star, ChevronDown } from 'lucide-react';
import type { Website } from '@/types';

interface CompactWebsiteCardProps {
  website: Website;
  onWebsiteClick: (website: Website) => void;
  isExpanded?: boolean;
  onExpand?: (e: React.MouseEvent) => void;
  "data-index"?: number;
}

export const CompactWebsiteCard = ({ 
  website, 
  onWebsiteClick,
  isExpanded = false,
  onExpand,
  "data-index": dataIndex,
}: CompactWebsiteCardProps) => {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-sm transition-all duration-200 cursor-pointer group relative"
      onClick={() => onWebsiteClick(website)}
      data-index={dataIndex}
    >
      {/* Icon Area - Visual Accent */}
      <div className="w-10 h-10 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50 group-hover:border-primary/20 transition-colors">
        {website.favicon_url ? (
            <img 
                src={website.favicon_url} 
                alt={website.title} 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
            />
        ) : null}
        <Star className={`w-5 h-5 text-muted-foreground/40 ${website.favicon_url ? 'hidden' : ''}`} />
      </div>
      
      {/* Text Area - Horizontal Flow */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <h3 className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors leading-tight">
            {website.title}
        </h3>
        {website.description && (
            <p className="text-xs text-muted-foreground truncate leading-tight opacity-80">
                {website.description}
            </p>
        )}
      </div>

      {/* Mobile Expand Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand?.(e);
          }}
          className="p-3 -mr-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-muted/50 active:bg-muted transition-colors"
          aria-label={isExpanded ? "收起详情" : "展开详情"}
        >
          <ChevronDown 
            className={`w-4 h-4 text-muted-foreground/70 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </div>
    </div>
  );
};
