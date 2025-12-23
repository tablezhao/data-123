import { supabase } from '@/db/supabase';
import type { Website, CreateWebsiteInput, UpdateWebsiteInput } from '@/types';

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
    .order('sort_order', { ascending: true })
    .limit(20);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 批量删除网站
export async function batchDeleteWebsites(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('websites')
    .delete()
    .in('id', ids);

  if (error) throw error;
}

// 批量更新网站排序
export async function batchUpdateWebsiteSortOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
  // 暂时使用Promise.all并行更新，后续可优化为RPC调用
  await Promise.all(
    updates.map(update => 
      supabase.from('websites').update({ sort_order: update.sort_order }).eq('id', update.id)
    )
  );
}

// 批量更新网站分类
export async function batchUpdateWebsiteCategory(ids: string[], categoryId: string): Promise<void> {
  const { error } = await supabase
    .from('websites')
    .update({ category_id: categoryId })
    .in('id', ids);

  if (error) throw error;
}
