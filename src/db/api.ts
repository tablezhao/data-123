import { supabase } from './supabase';
import type {
  Category,
  Website,
  UserFavorite,
  SiteSetting,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateWebsiteInput,
  UpdateWebsiteInput,
  Profile,
} from '@/types';

// ==================== 分类相关 API ====================

// 获取所有分类（包含子分类）
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  // 构建树形结构
  const categories = Array.isArray(data) ? data : [];
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    const category = categoryMap.get(cat.id);
    if (!category) return;

    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

// 获取单个分类
export async function getCategory(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 创建分类
export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 更新分类
export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 删除分类
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== 网站链接相关 API ====================

// 获取所有网站
export async function getWebsites(categoryId?: string): Promise<Website[]> {
  let query = supabase
    .from('websites')
    .select('*, category:categories(*)');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('sort_order', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取热门网站
export async function getFeaturedWebsites(limit = 10): Promise<Website[]> {
  const { data, error } = await supabase
    .from('websites')
    .select('*, category:categories(*)')
    .eq('is_featured', true)
    .eq('is_visible', true)
    .order('click_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取单个网站
export async function getWebsite(id: string): Promise<Website | null> {
  const { data, error } = await supabase
    .from('websites')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 创建网站
export async function createWebsite(input: CreateWebsiteInput): Promise<Website> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('websites')
    .insert({ ...input, created_by: user?.id })
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

// 更新网站
export async function updateWebsite(id: string, input: UpdateWebsiteInput): Promise<Website> {
  const { data, error } = await supabase
    .from('websites')
    .update(input)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

// 删除网站
export async function deleteWebsite(id: string): Promise<void> {
  const { error } = await supabase
    .from('websites')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 增加网站点击量
export async function incrementWebsiteClick(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_click_count', { website_id: id });
  
  if (error) {
    // 如果RPC不存在，使用普通更新
    const website = await getWebsite(id);
    if (website) {
      await supabase
        .from('websites')
        .update({ click_count: website.click_count + 1 })
        .eq('id', id);
    }
  }
}

// 搜索网站
export async function searchWebsites(query: string): Promise<Website[]> {
  const { data, error } = await supabase
    .from('websites')
    .select('*, category:categories(*)')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_visible', true)
    .order('click_count', { ascending: false })
    .limit(20);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ==================== 用户收藏相关 API ====================

// 获取用户收藏
export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*, website:websites(*, category:categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 添加收藏
export async function addFavorite(websiteId: string): Promise<UserFavorite> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { data, error } = await supabase
    .from('user_favorites')
    .insert({ user_id: user.id, website_id: websiteId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 删除收藏
export async function removeFavorite(websiteId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('website_id', websiteId);

  if (error) throw error;
}

// 检查是否已收藏
export async function isFavorited(websiteId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('website_id', websiteId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

// ==================== 网站配置相关 API ====================

// 获取所有配置
export async function getSiteSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*');

  if (error) throw error;

  const settings: Record<string, unknown> = {};
  if (Array.isArray(data)) {
    data.forEach((setting: SiteSetting) => {
      settings[setting.key] = setting.value;
    });
  }

  return settings;
}

// 获取单个配置
export async function getSiteSetting(key: string): Promise<unknown> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return data?.value;
}

// 更新配置
export async function updateSiteSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw error;
}

// ==================== 访问统计相关 API ====================

// 记录访问
export async function recordVisit(websiteId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('visit_stats')
    .insert({
      website_id: websiteId,
      user_id: user?.id || null,
    });

  if (error) throw error;
}

// 获取网站访问统计
export async function getWebsiteStats(websiteId: string, days = 30): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { count, error } = await supabase
    .from('visit_stats')
    .select('*', { count: 'exact', head: true })
    .eq('website_id', websiteId)
    .gte('visited_at', startDate.toISOString());

  if (error) throw error;
  return count || 0;
}

// ==================== 用户相关 API ====================

// 获取当前用户信息
export async function getCurrentUser(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 获取所有用户（管理员）
export async function getAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 更新用户角色（管理员）
export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

// 批量删除网站
export async function batchDeleteWebsites(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('websites')
    .delete()
    .in('id', ids);

  if (error) throw error;
}

// 批量更新网站分类
export async function batchUpdateWebsiteCategory(ids: string[], categoryId: string): Promise<void> {
  const { error } = await supabase
    .from('websites')
    .update({ category_id: categoryId })
    .in('id', ids);

  if (error) throw error;
}
