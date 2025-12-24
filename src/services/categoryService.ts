import { supabase } from '@/db/supabase';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';

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

// 批量更新分类排序
export async function batchUpdateCategorySortOrder(updates: { id: string; sort_order: number }[]): Promise<void> {
  const { error } = await supabase.rpc('batch_update_category_sort_order', {
    payload: updates
  });

  if (error) {
    // Fallback to Promise.all if RPC fails or doesn't exist
    console.warn('RPC batch_update_category_sort_order failed, falling back to individual updates', error);
    await Promise.all(
      updates.map(update => 
        supabase.from('categories').update({ sort_order: update.sort_order }).eq('id', update.id)
      )
    );
  }
}

// 删除分类
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
