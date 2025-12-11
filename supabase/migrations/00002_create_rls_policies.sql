-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_stats ENABLE ROW LEVEL SECURITY;

-- 创建辅助函数检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- profiles表策略
CREATE POLICY "公开查看所有用户信息" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "用户可以更新自己的信息" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "管理员可以更新所有用户信息" ON profiles
  FOR UPDATE USING (is_admin());

-- categories表策略
CREATE POLICY "所有人可以查看可见分类" ON categories
  FOR SELECT USING (is_visible = true OR is_admin());

CREATE POLICY "管理员可以创建分类" ON categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "管理员可以更新分类" ON categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "管理员可以删除分类" ON categories
  FOR DELETE USING (is_admin());

-- websites表策略
CREATE POLICY "所有人可以查看可见网站" ON websites
  FOR SELECT USING (is_visible = true OR is_admin());

CREATE POLICY "登录用户可以创建网站" ON websites
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "管理员可以更新所有网站" ON websites
  FOR UPDATE USING (is_admin());

CREATE POLICY "用户可以更新自己创建的网站" ON websites
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "管理员可以删除网站" ON websites
  FOR DELETE USING (is_admin());

-- user_favorites表策略
CREATE POLICY "用户可以查看自己的收藏" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加收藏" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的收藏" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- site_settings表策略
CREATE POLICY "所有人可以查看网站配置" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "管理员可以更新网站配置" ON site_settings
  FOR UPDATE USING (is_admin());

CREATE POLICY "管理员可以创建网站配置" ON site_settings
  FOR INSERT WITH CHECK (is_admin());

-- visit_stats表策略
CREATE POLICY "所有人可以创建访问统计" ON visit_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "管理员可以查看所有访问统计" ON visit_stats
  FOR SELECT USING (is_admin());

-- 存储桶策略
CREATE POLICY "所有人可以查看图片" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-85w8y6vjhh4x_website_images');

CREATE POLICY "登录用户可以上传图片" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'app-85w8y6vjhh4x_website_images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "管理员可以删除图片" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'app-85w8y6vjhh4x_website_images' 
    AND is_admin()
  );