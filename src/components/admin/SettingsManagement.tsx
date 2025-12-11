import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { getSiteSettings, updateSiteSetting } from '@/db/api';

export default function SettingsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    site_keywords: [] as string[],
    footer_text: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await getSiteSettings();
      setSettings({
        site_name: (data.site_name as string) || '',
        site_description: (data.site_description as string) || '',
        site_keywords: (data.site_keywords as string[]) || [],
        footer_text: (data.footer_text as string) || '',
      });
    } catch (error) {
      console.error('加载配置失败:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await Promise.all([
        updateSiteSetting('site_name', settings.site_name),
        updateSiteSetting('site_description', settings.site_description),
        updateSiteSetting('site_keywords', settings.site_keywords),
        updateSiteSetting('footer_text', settings.footer_text),
      ]);
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

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
