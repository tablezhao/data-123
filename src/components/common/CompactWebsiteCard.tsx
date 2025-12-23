import React from 'react';
import { Star } from 'lucide-react';
import type { Website } from '@/types';

interface CompactWebsiteCardProps {
  website: Website;
  onWebsiteClick: (website: Website) => void;
}

export const CompactWebsiteCard = ({ 
  website, 
  onWebsiteClick, 
}: CompactWebsiteCardProps) => {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
      onClick={() => onWebsiteClick(website)}
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
        <p className="text-xs text-muted-foreground truncate leading-tight opacity-80">
            {website.description || '暂无描述'}
        </p>
      </div>
    </div>
  );
};
