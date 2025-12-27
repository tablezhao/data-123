import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    dify_chatbot_enabled: true,
    chatbot_provider: 'dify' as 'dify' | 'coze',
    coze_bot_id: '7588114144168181801',
    coze_title: 'Coze',
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
      const difyChatbotEnabled = (data.dify_chatbot_enabled as boolean) ?? true;
      const chatbotProvider =
        data.chatbot_provider === 'coze' || data.chatbot_provider === 'dify'
          ? (data.chatbot_provider as 'dify' | 'coze')
          : 'dify';
      
      setSettings({
        site_name: (data.site_name as string) || '',
        site_description: (data.site_description as string) || '',
        site_keywords: siteKeywords,
        footer_text: (data.footer_text as string) || '',
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        dify_chatbot_enabled: difyChatbotEnabled,
        chatbot_provider: chatbotProvider,
        coze_bot_id: (data.coze_bot_id as string) || '7588114144168181801',
        coze_title: (data.coze_title as string) || 'Coze',
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
        const url = result.url;
        setSettings(prev => ({ ...prev, logo_url: url }));
        setLogoPreview(url);
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
        const url = result.url;
        setSettings(prev => ({ ...prev, favicon_url: url }));
        setFaviconPreview(url);
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
        updateSiteSetting('dify_chatbot_enabled', settings.dify_chatbot_enabled),
        updateSiteSetting('chatbot_provider', settings.chatbot_provider),
        updateSiteSetting('coze_bot_id', settings.coze_bot_id),
        updateSiteSetting('coze_title', settings.coze_title),
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

        <div className="flex items-center space-x-2">
          <Switch
            id="dify_chatbot_enabled"
            checked={settings.dify_chatbot_enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, dify_chatbot_enabled: checked })
            }
          />
          <Label htmlFor="dify_chatbot_enabled">启用 Chatbot</Label>
        </div>

        {settings.dify_chatbot_enabled && (
          <div className="space-y-4 rounded-2xl border border-border/50 bg-background/60 p-4 backdrop-blur-xl">
            <div className="space-y-2">
              <Label>Chatbot 类型</Label>
              <Select
                value={settings.chatbot_provider}
                onValueChange={(value) =>
                  setSettings({ ...settings, chatbot_provider: value as 'dify' | 'coze' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dify">Dify</SelectItem>
                  <SelectItem value="coze">Coze</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.chatbot_provider === 'coze' && (
              <div className="space-y-4 rounded-xl border border-border/50 bg-background/70 p-4">
                <div className="space-y-2">
                  <Label htmlFor="coze_bot_id">Coze Bot ID</Label>
                  <Input
                    id="coze_bot_id"
                    value={settings.coze_bot_id}
                    onChange={(e) => setSettings({ ...settings, coze_bot_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coze_title">Coze 标题</Label>
                  <Input
                    id="coze_title"
                    value={settings.coze_title}
                    onChange={(e) => setSettings({ ...settings, coze_title: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logo 上传 */}
        <div className="space-y-2">
          <Label htmlFor="logo_upload">网站 Logo</Label>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo 预览"
                    className="w-24 h-24 object-contain aspect-square rounded bg-muted p-2"
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
                <div className="w-24 h-24 border-2 border-dashed border-muted rounded flex items-center justify-center bg-muted">
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
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>支持 JPG、PNG、SVG 格式</p>
                <p>建议尺寸：200x200px（正方形）</p>
                <p>最大文件大小：2MB</p>
                <p className="text-primary-foreground">✅ 预览效果：保持原始比例显示，不会被压缩</p>
              </div>
            </div>
          </div>
        </div>

        {/* Favicon 上传 */}
        <div className="space-y-2">
          <Label htmlFor="favicon_upload">网站 Favicon</Label>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {faviconPreview ? (
                <div className="relative">
                  <img
                    src={faviconPreview}
                    alt="Favicon 预览"
                    className="w-16 h-16 object-contain aspect-square rounded bg-muted p-2"
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
                <div className="w-16 h-16 border-2 border-dashed border-muted rounded flex items-center justify-center bg-muted">
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
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>支持 JPG、PNG、ICO 格式</p>
                <p>建议尺寸：32x32px 或 64x64px（正方形）</p>
                <p>最大文件大小：1MB</p>
                <p className="text-primary-foreground">✅ 浏览器会自动缩放，保持最佳显示效果</p>
              </div>
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
