import { supabase } from '@/db/supabase';
import type { UserFavorite } from '@/types';

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

// 获取所有收藏的网站ID
export async function getAllFavoriteIds(): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from('user_favorites')
    .select('website_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('获取收藏列表失败:', error);
    return new Set();
  }

  return new Set((data || []).map((item) => item.website_id));
}

// 批量检查收藏状态
export async function areFavorited(websiteIds: string[]): Promise<Record<string, boolean>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // 如果用户未登录，所有网站都未收藏
    return websiteIds.reduce((acc, id) => {
      acc[id] = false;
      return acc;
    }, {} as Record<string, boolean>);
  }

  if (websiteIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('website_id')
    .eq('user_id', user.id);

  if (error) {
    console.error('批量检查收藏状态失败:', error);
    return websiteIds.reduce((acc, id) => {
      acc[id] = false;
      return acc;
    }, {} as Record<string, boolean>);
  }

  const favoritedIds = new Set((data || []).map((item) => item.website_id));
  
  return websiteIds.reduce((acc, id) => {
    acc[id] = favoritedIds.has(id);
    return acc;
  }, {} as Record<string, boolean>);
}
