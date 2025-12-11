-- 创建增加点击量的RPC函数
CREATE OR REPLACE FUNCTION increment_click_count(website_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE websites
  SET click_count = click_count + 1
  WHERE id = website_id;
END;
$$;

-- 插入示例分类数据
INSERT INTO categories (name, description, icon, sort_order, is_visible) VALUES
  ('数据合规法规', '国内外数据合规相关法律法规', '⚖️', 1, true),
  ('隐私保护工具', '隐私保护和数据安全工具', '🔒', 2, true),
  ('合规咨询机构', '专业的数据合规咨询服务机构', '🏢', 3, true),
  ('行业协会', '数据合规相关行业协会和组织', '🤝', 4, true),
  ('学习资源', '数据合规学习资料和培训课程', '📚', 5, true),
  ('技术方案', '数据合规技术解决方案', '💻', 6, true)
ON CONFLICT DO NOTHING;

-- 获取分类ID用于插入网站数据
DO $$
DECLARE
  cat_law UUID;
  cat_tool UUID;
  cat_consult UUID;
  cat_assoc UUID;
  cat_learn UUID;
  cat_tech UUID;
BEGIN
  SELECT id INTO cat_law FROM categories WHERE name = '数据合规法规' LIMIT 1;
  SELECT id INTO cat_tool FROM categories WHERE name = '隐私保护工具' LIMIT 1;
  SELECT id INTO cat_consult FROM categories WHERE name = '合规咨询机构' LIMIT 1;
  SELECT id INTO cat_assoc FROM categories WHERE name = '行业协会' LIMIT 1;
  SELECT id INTO cat_learn FROM categories WHERE name = '学习资源' LIMIT 1;
  SELECT id INTO cat_tech FROM categories WHERE name = '技术方案' LIMIT 1;

  -- 插入示例网站数据
  INSERT INTO websites (category_id, title, url, description, sort_order, is_featured, is_visible) VALUES
    (cat_law, '国家网信办', 'http://www.cac.gov.cn/', '中华人民共和国国家互联网信息办公室官方网站', 1, true, true),
    (cat_law, '工信部', 'https://www.miit.gov.cn/', '中华人民共和国工业和信息化部官方网站', 2, true, true),
    (cat_law, '全国人大', 'http://www.npc.gov.cn/', '全国人民代表大会官方网站，查询法律法规', 3, false, true),
    (cat_law, 'GDPR官网', 'https://gdpr.eu/', '欧盟通用数据保护条例官方网站', 4, true, true),
    
    (cat_tool, '中国信通院', 'http://www.caict.ac.cn/', '中国信息通信研究院，提供数据安全评估工具', 5, true, true),
    (cat_tool, 'Privacy Badger', 'https://privacybadger.org/', 'EFF开发的隐私保护浏览器插件', 6, false, true),
    (cat_tool, 'DuckDuckGo', 'https://duckduckgo.com/', '注重隐私保护的搜索引擎', 7, true, true),
    
    (cat_consult, '德勤', 'https://www2.deloitte.com/', '全球领先的专业服务机构，提供数据合规咨询', 8, true, true),
    (cat_consult, '普华永道', 'https://www.pwc.com/', '提供数据保护和隐私合规咨询服务', 9, false, true),
    
    (cat_assoc, '中国网络安全产业联盟', 'http://www.china-cia.org.cn/', '推动网络安全和数据保护产业发展', 10, false, true),
    (cat_assoc, 'IAPP', 'https://iapp.org/', '国际隐私专业人员协会', 11, true, true),
    
    (cat_learn, '数据安全法学习平台', 'https://www.12377.cn/', '网络举报和数据安全法律学习', 12, false, true),
    (cat_learn, 'Coursera隐私课程', 'https://www.coursera.org/', '在线学习平台，提供数据隐私相关课程', 13, true, true),
    
    (cat_tech, '阿里云数据安全', 'https://www.aliyun.com/product/security', '阿里云数据安全解决方案', 14, true, true),
    (cat_tech, '腾讯云数据安全', 'https://cloud.tencent.com/product/dsgc', '腾讯云数据安全治理中心', 15, true, true)
  ON CONFLICT DO NOTHING;
END $$;