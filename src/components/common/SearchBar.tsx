import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ 
  query, 
  onSearch,
  placeholder = '搜索网站名称或描述...' 
}: SearchBarProps) => {
  return (
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-10 h-12 text-lg"
      />
    </div>
  );
};
