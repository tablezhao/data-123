export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

// 用户角色类型
export type UserRole = 'user' | 'admin';

// 用户配置类型
export interface Profile {
  id: string;
  username: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

// 网站链接类型
export interface Website {
  id: string;
  category_id: string;
  title: string;
  url: string;
  description: string | null;
  favicon_url: string | null;
  logo_url: string | null;
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
  click_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  is_favorited?: boolean;
}

// 用户收藏类型
export interface UserFavorite {
  id: string;
  user_id: string;
  website_id: string;
  created_at: string;
  website?: Website;
}

// 网站配置类型
export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

// 访问统计类型
export interface VisitStat {
  id: string;
  website_id: string;
  user_id: string | null;
  visited_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

// 创建分类输入类型
export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order?: number;
  is_visible?: boolean;
}

// 更新分类输入类型
export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order?: number;
  is_visible?: boolean;
}

// 创建网站输入类型
export interface CreateWebsiteInput {
  category_id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  logo_url?: string;
  sort_order?: number;
  is_featured?: boolean;
  is_visible?: boolean;
}

// 更新网站输入类型
export interface UpdateWebsiteInput {
  category_id?: string;
  title?: string;
  url?: string;
  description?: string;
  favicon_url?: string;
  logo_url?: string;
  sort_order?: number;
  is_featured?: boolean;
  is_visible?: boolean;
}

// 搜索结果类型
export interface SearchResult {
  websites: Website[];
  categories: Category[];
}
