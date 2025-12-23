import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, ExternalLink, RefreshCw, ArrowUpDown, Save, GripVertical, X } from 'lucide-react';
import {
  getCategories,
  getWebsites,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  batchDeleteWebsites,
  batchUpdateWebsiteSortOrder,
} from '@/db/api';
import { uploadImage } from '@/lib/upload';
import type { Category, Website, CreateWebsiteInput, UpdateWebsiteInput } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function WebsiteManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<Website | null>(null);
  const [selectedWebsites, setSelectedWebsites] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);
  const [isSortMode, setIsSortMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Website | null>(null);
  const [formData, setFormData] = useState<CreateWebsiteInput>({
    category_id: '',
    title: '',
    url: '',
    description: '',
    favicon_url: '',
    logo_url: '',
    sort_order: 0,
    is_featured: false,
    is_visible: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [categoriesData, websitesData] = await Promise.all([
        getCategories(),
        getWebsites(),
      ]);
      setCategories(categoriesData);
      setWebsites(websitesData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(website?: Website) {
    if (website) {
      setEditingWebsite(website);
      setFormData({
        category_id: website.category_id,
        title: website.title,
        url: website.url,
        description: website.description || '',
        favicon_url: website.favicon_url || '',
        logo_url: website.logo_url || '',
        sort_order: website.sort_order,
        is_featured: website.is_featured,
        is_visible: website.is_visible,
      });
    } else {
      setEditingWebsite(null);
      setFormData({
        category_id: '',
        title: '',
        url: '',
        description: '',
        favicon_url: '',
        logo_url: '',
        sort_order: 0,
        is_featured: false,
        is_visible: true,
      });
    }
    setDialogOpen(true);
  }

  async function handleImageUpload(file: File, field: 'favicon_url' | 'logo_url') {
    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });

      setFormData(prev => ({ ...prev, [field]: result.url }));

      if (result.compressed) {
        toast.success(`图片已上传并压缩至 ${(file.size / 1024).toFixed(2)}KB`);
      } else {
        toast.success('图片上传成功');
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function autoFetchLogo(url: string) {
    if (!url) return;
    let domain = '';
    try {
      const urlToParse = url.startsWith('http') ? url : `https://${url}`;
      const u = new URL(urlToParse);
      domain = u.hostname;
    } catch {
      return;
    }

    if (isFetchingLogo) return;
    setIsFetchingLogo(true);
    toast.info('正在自动抓取网站Logo...');

    try {
      const targetUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      let blob: Blob | null = null;

      // Strategy 1: AllOrigins
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) blob = await res.blob();
      } catch (e) {
        console.warn('AllOrigins fetch failed', e);
      }

      // Strategy 2: CORSProxy.io
      if (!blob) {
        try {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
          const res = await fetch(proxyUrl);
          if (res.ok) blob = await res.blob();
        } catch (e) {
          console.warn('CORSProxy fetch failed', e);
        }
      }

      // Strategy 3: Icon Horse (Fallback)
      if (!blob) {
         try {
             const iconUrl = `https://icon.horse/icon/${domain}`;
             const res = await fetch(iconUrl);
             if (res.ok) blob = await res.blob();
         } catch(e) {
             console.warn('Icon Horse fetch failed', e);
         }
      }

      if (!blob || blob.size < 100) throw new Error('Fetch failed or image invalid');
      
      const file = new File([blob], `${domain}_favicon.png`, { type: blob.type });
      
      setUploading(true);
      const result = await uploadImage(file);
      
      setFormData(prev => ({
        ...prev,
        favicon_url: result.url,
        // Also set logo_url if empty as fallback
        logo_url: prev.logo_url || result.url
      }));
      
      toast.success('Logo抓取并保存成功');
    } catch (error) {
      console.error('Auto fetch failed:', error);
      toast.error('自动抓取失败，请手动上传');
    } finally {
      setIsFetchingLogo(false);
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.category_id) {
      toast.error('请选择分类');
      return;
    }

    try {
      if (editingWebsite) {
        await updateWebsite(editingWebsite.id, formData as UpdateWebsiteInput);
        toast.success('网站更新成功');
      } else {
        await createWebsite(formData);
        toast.success('网站创建成功');
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('操作失败');
    }
  }

  async function handleDelete() {
    if (!websiteToDelete) return;

    try {
      await deleteWebsite(websiteToDelete.id);
      toast.success('网站删除成功');
      setDeleteDialogOpen(false);
      setWebsiteToDelete(null);
      loadData();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  }

  async function handleBatchDelete() {
    if (selectedWebsites.size === 0) {
      toast.error('请选择要删除的网站');
      return;
    }

    try {
      await batchDeleteWebsites(Array.from(selectedWebsites));
      toast.success(`已删除 ${selectedWebsites.size} 个网站`);
      setSelectedWebsites(new Set());
      loadData();
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error('批量删除失败');
    }
  }

  async function toggleVisibility(website: Website) {
    try {
      await updateWebsite(website.id, { is_visible: !website.is_visible });
      toast.success('可见性已更新');
      loadData();
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  }

  function toggleSelectWebsite(websiteId: string) {
    setSelectedWebsites((prev) => {
      const next = new Set(prev);
      if (next.has(websiteId)) {
        next.delete(websiteId);
      } else {
        next.add(websiteId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedWebsites.size === websites.length) {
      setSelectedWebsites(new Set());
    } else {
      setSelectedWebsites(new Set(websites.map((w) => w.id)));
    }
  }
  
  // Sort Logic
  async function handleSaveSort() {
    try {
      setLoading(true);
      const updates = websites.map((w, index) => ({
        id: w.id,
        sort_order: (index + 1) * 10 
      }));
      await batchUpdateWebsiteSortOrder(updates);
      toast.success('排序已保存');
      setIsSortMode(false);
      loadData();
    } catch (error) {
      console.error('保存排序失败:', error);
      toast.error('保存排序失败');
      setLoading(false);
    }
  }
  
  function handleDragStart(e: React.DragEvent, website: Website) {
      if (!isSortMode) return;
      setDraggedItem(website);
      e.dataTransfer.effectAllowed = 'move';
  }
  
  function handleDragOver(e: React.DragEvent, targetWebsite: Website) {
      e.preventDefault();
      if (!isSortMode || !draggedItem || draggedItem.id === targetWebsite.id) return;
      
      const newWebsites = [...websites];
      const draggedIndex = newWebsites.findIndex(w => w.id === draggedItem.id);
      const targetIndex = newWebsites.findIndex(w => w.id === targetWebsite.id);
      
      if (draggedIndex === -1 || targetIndex === -1) return;
      
      newWebsites.splice(draggedIndex, 1);
      newWebsites.splice(targetIndex, 0, draggedItem);
      
      setWebsites(newWebsites);
  }

  function handleDragEnd() {
    setDraggedItem(null);
  }

  // 展平分类树
  function flattenCategories(cats: Category[]): Category[] {
    const result: Category[] = [];
    for (const cat of cats) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children));
      }
    }
    return result;
  }

  const flatCategories = flattenCategories(categories);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>网站管理</CardTitle>
            <CardDescription>管理导航网站链接</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isSortMode ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsSortMode(false);
                  loadData(); // Revert changes
                }}>
                  <X className="w-4 h-4 mr-2" />
                  取消
                </Button>
                <Button onClick={handleSaveSort}>
                  <Save className="w-4 h-4 mr-2" />
                  保存排序
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsSortMode(true)}>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                调整排序
              </Button>
            )}
            
            {!isSortMode && selectedWebsites.size > 0 && (
              <Button variant="destructive" onClick={handleBatchDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                删除选中 ({selectedWebsites.size})
              </Button>
            )}
            
            {!isSortMode && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加网站
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Form content (same as before) */}
                    <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingWebsite ? '编辑网站' : '添加网站'}</DialogTitle>
                    <DialogDescription>
                      填写网站信息，标题、URL和分类为必填项
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">分类 *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {flatCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon && `${category.icon} `}
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">网站标题 *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">网站URL *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="url"
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          onBlur={(e) => autoFetchLogo(e.target.value)}
                          placeholder="https://example.com"
                          required
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => autoFetchLogo(formData.url)}
                          disabled={isFetchingLogo || !formData.url}
                          title="重新抓取Logo"
                        >
                          <RefreshCw className={`w-4 h-4 ${isFetchingLogo ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        输入网址后将自动抓取Logo，也可以点击右侧按钮重新抓取
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">描述</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="favicon">Favicon图标</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="favicon"
                          value={formData.favicon_url}
                          onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                          placeholder="https://example.com/favicon.ico"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, 'favicon_url');
                            };
                            input.click();
                          }}
                          disabled={uploading}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                      {formData.favicon_url && (
                        <img src={formData.favicon_url} alt="Favicon" className="w-8 h-8" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo">Logo图片</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo"
                          value={formData.logo_url}
                          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                          placeholder="https://example.com/logo.png"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, 'logo_url');
                            };
                            input.click();
                          }}
                          disabled={uploading}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                      {formData.logo_url && (
                        <img src={formData.logo_url} alt="Logo" className="w-24 h-24 object-contain" />
                      )}
                      {uploading && (
                        <div className="space-y-2">
                          <Progress value={uploadProgress} />
                          <p className="text-sm text-muted-foreground">上传中... {uploadProgress}%</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sort_order">排序</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) =>
                          setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_visible"
                        checked={formData.is_visible}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_visible: checked })
                        }
                      />
                      <Label htmlFor="is_visible">可见</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      取消
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {editingWebsite ? '更新' : '创建'}
                    </Button>
                  </DialogFooter>
                </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : websites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无网站，点击上方按钮添加
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                    {isSortMode ? (
                        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <Checkbox
                            checked={selectedWebsites.size === websites.length}
                            onCheckedChange={toggleSelectAll}
                        />
                    )}
                </TableHead>
                <TableHead>网站</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>{isSortMode ? '排序值' : '访问量'}</TableHead>
                <TableHead>状态</TableHead>
                {!isSortMode && <TableHead className="text-right">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => (
                <TableRow 
                    key={website.id}
                    draggable={isSortMode}
                    onDragStart={(e) => handleDragStart(e, website)}
                    onDragOver={(e) => handleDragOver(e, website)}
                    onDragEnd={handleDragEnd}
                    className={isSortMode ? 'cursor-move hover:bg-muted/50 transition-colors' : ''}
                >
                  <TableCell>
                    {isSortMode ? (
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    ) : (
                        <Checkbox
                            checked={selectedWebsites.has(website.id)}
                            onCheckedChange={() => toggleSelectWebsite(website.id)}
                        />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {website.favicon_url && (
                        <img
                          src={website.favicon_url}
                          alt=""
                          className="w-5 h-5"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="font-medium">{website.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{website.category?.name}</TableCell>
                  <TableCell>
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="max-w-xs truncate">{website.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                      {isSortMode ? (
                          <span className="font-mono">{website.sort_order}</span>
                      ) : (
                          website.click_count
                      )}
                  </TableCell>
                  <TableCell>
                    {website.is_visible ? (
                      <Badge variant="default">可见</Badge>
                    ) : (
                      <Badge variant="secondary">隐藏</Badge>
                    )}
                  </TableCell>
                  {!isSortMode && (
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleVisibility(website)}
                        >
                            {website.is_visible ? (
                            <Eye className="w-4 h-4" />
                            ) : (
                            <EyeOff className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(website)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                            setWebsiteToDelete(website);
                            setDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除网站 "{websiteToDelete?.title}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
