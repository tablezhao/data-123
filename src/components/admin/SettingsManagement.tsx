import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { getSiteSettings, updateSiteSetting } from '@/db/api';
import { useSettingsStore } from '@/stores/settingsStore';
import { uploadImage } from '@/services/uploadService';

export default function SettingsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    site_keywords: [] as string[],
    footer_text: '',
    logo_url: '',
    favicon_url: '',
  });
  
  // 用于预览的本地状态
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      
      // 确保 site_keywords 始终是数组类型
      let siteKeywords: string[] = [];
      if (Array.isArray(data.site_keywords)) {
        siteKeywords = data.site_keywords;
      } else if (typeof data.site_keywords === 'string') {
        // 如果是字符串，尝试用逗号分隔转换为数组
        siteKeywords = data.site_keywords.split(',').map(k => k.trim());
      }
      
      const logoUrl = (data.logo_url as string) || '';
      const faviconUrl = (data.favicon_url as string) || '';
      
      setSettings({
        site_name: (data.site_name as string) || '',
        site_description: (data.site_description as string) || '',
        site_keywords: siteKeywords,
        footer_text: (data.footer_text as string) || '',
        logo_url: logoUrl,
        favicon_url: faviconUrl,
      });
      
      // 设置预览
      setLogoPreview(logoUrl || null);
      setFaviconPreview(faviconUrl || null);
    } catch (error) {
      console.error('加载配置失败:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  }

  // 图片上传处理函数
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadImage(file, {
        path: 'logos',
        cacheControl: 3600,
        upsert: true,
      });

      if (result.success && result.url) {
        setSettings(prev => ({ ...prev, logo_url: result.url }));
        setLogoPreview(result.url);
        toast.success('Logo 上传成功');
      } else {
        toast.error(result.error || 'Logo 上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadImage(file, {
        path: 'favicons',
        cacheControl: 3600,
        upsert: true,
      });

      if (result.success && result.url) {
        setSettings(prev => ({ ...prev, favicon_url: result.url }));
        setFaviconPreview(result.url);
        toast.success('Favicon 上传成功');
      } else {
        toast.error(result.error || 'Favicon 上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 移除图片处理函数
  const removeLogo = () => {
    setSettings(prev => ({ ...prev, logo_url: '' }));
    setLogoPreview(null);
  };

  const removeFavicon = () => {
    setSettings(prev => ({ ...prev, favicon_url: '' }));
    setFaviconPreview(null);
  };

  async function handleSave() {
    try {
      setSaving(true);
      await Promise.all([
        updateSiteSetting('site_name', settings.site_name),
        updateSiteSetting('site_description', settings.site_description),
        updateSiteSetting('site_keywords', settings.site_keywords),
        updateSiteSetting('footer_text', settings.footer_text),
        updateSiteSetting('logo_url', settings.logo_url),
        updateSiteSetting('favicon_url', settings.favicon_url),
      ]);
      
      // 保存成功后刷新设置，确保所有组件能获取到最新数据
      await useSettingsStore.getState().loadSettings();
      
      toast.success('配置保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>系统配置</CardTitle>
        <CardDescription>管理网站基本信息和配置</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="site_name">网站名称</Label>
          <Input
            id="site_name"
            value={settings.site_name}
            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_description">网站描述</Label>
          <Textarea
            id="site_description"
            value={settings.site_description}
            onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_keywords">网站关键词（用逗号分隔）</Label>
          <Input
            id="site_keywords"
            value={settings.site_keywords.join(', ')}
            onChange={(e) =>
              setSettings({
                ...settings,
                site_keywords: e.target.value.split(',').map((k) => k.trim()),
              })
            }
            placeholder="数据合规, 隐私保护, 网站导航"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footer_text">页脚文本</Label>
          <Input
            id="footer_text"
            value={settings.footer_text}
            onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
          />
        </div>

        {/* Logo 上传 */}
        <div className="space-y-2">
          <Label htmlFor="logo_upload">网站 Logo</Label>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo 预览"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 border-2 border-dashed border-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground">无 Logo</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <Input
                id="logo_upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG、SVG 格式，建议尺寸 200x200px</p>
            </div>
          </div>
        </div>

        {/* Favicon 上传 */}
        <div className="space-y-2">
          <Label htmlFor="favicon_upload">网站 Favicon</Label>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {faviconPreview ? (
                <div className="relative">
                  <img
                    src={faviconPreview}
                    alt="Favicon 预览"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={removeFavicon}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 border-2 border-dashed border-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground">无 Favicon</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <Input
                id="favicon_upload"
                type="file"
                accept="image/*"
                onChange={handleFaviconUpload}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG、ICO 格式，建议尺寸 32x32px 或 64x64px</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || uploading}>
            <Save className="w-4 h-4 mr-2" />
            {(saving || uploading) ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
