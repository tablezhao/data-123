import { supabase } from '@/db/supabase';

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
