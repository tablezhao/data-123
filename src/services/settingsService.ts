import { supabase } from '@/db/supabase';
import type { SiteSetting } from '@/types';

// 获取所有配置
export async function getSiteSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*');

  if (error) throw error;

  const settings: Record<string, unknown> = {};
  if (Array.isArray(data)) {
    data.forEach((setting: SiteSetting) => {
      let value = setting.value;
      
      // 特殊处理 site_keywords，确保它是数组类型
      if (setting.key === 'site_keywords') {
        if (Array.isArray(value)) {
          // 已经是数组，直接使用
        } else if (typeof value === 'string') {
          // 字符串类型，转换为数组
          value = value.split(',').map((k: string) => k.trim());
        } else {
          // 其他类型，转换为空数组
          value = [];
        }
      }
      
      settings[setting.key] = value;
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
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (error) throw error;
}
