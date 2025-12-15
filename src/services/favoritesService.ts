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
