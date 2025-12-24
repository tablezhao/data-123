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
import { batchUpdateCategorySortOrder } from '@/services/categoryService';
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
  
  const [groupedWebsites, setGroupedWebsites] = useState<{ category: Category; websites: Website[] }[]>([]);
  const [draggedSortItem, setDraggedSortItem] = useState<{ type: 'category' | 'website'; index: number; subIndex?: number } | null>(null);

  useEffect(() => {
    if (isSortMode) {
      initSortData();
    }
  }, [isSortMode]);

  function initSortData() {
    // Group websites by category
    const groups: { category: Category; websites: Website[] }[] = [];
    const categoryMap = new Map<string, Website[]>();

    websites.forEach(w => {
      const catId = w.category_id;
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, []);
      }
      categoryMap.get(catId)?.push(w);
    });

    // Flatten categories to list (using existing flattenCategories helper if needed, or just map)
    // We want to sort categories by their sort_order first
    const sortedCategories = [...flattenCategories(categories)].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    sortedCategories.forEach(cat => {
      const catWebsites = categoryMap.get(cat.id) || [];
      // Sort websites by their sort_order
      catWebsites.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      groups.push({ category: cat, websites: catWebsites });
    });

    // Handle uncategorized if any (though unlikely with required field)
    setGroupedWebsites(groups);
  }

  // Sort Logic
  async function handleSaveSort() {
    try {
      setLoading(true);
      
      const websiteUpdates: { id: string; sort_order: number }[] = [];
      const categoryUpdates: { id: string; sort_order: number }[] = [];

      groupedWebsites.forEach((group, groupIndex) => {
        // Update Category Order
        categoryUpdates.push({
          id: group.category.id,
          sort_order: (groupIndex + 1) * 10
        });

        // Update Website Order
        group.websites.forEach((w, wIndex) => {
          websiteUpdates.push({
            id: w.id,
            sort_order: (wIndex + 1) * 10
          });
        });
      });

      await Promise.all([
        batchUpdateWebsiteSortOrder(websiteUpdates),
        batchUpdateCategorySortOrder(categoryUpdates)
      ]);

      toast.success('排序已保存');
      setIsSortMode(false);
      loadData();
    } catch (error) {
      console.error('保存排序失败:', error);
      toast.error('保存排序失败');
      setLoading(false);
    }
  }

  // Category Drag Handlers
  function handleCategoryDragStart(e: React.DragEvent, index: number) {
    setDraggedSortItem({ type: 'category', index });
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleCategoryDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (!draggedSortItem || draggedSortItem.type !== 'category' || draggedSortItem.index === index) return;

    const newGroups = [...groupedWebsites];
    const item = newGroups.splice(draggedSortItem.index, 1)[0];
    newGroups.splice(index, 0, item);
    
    setGroupedWebsites(newGroups);
    setDraggedSortItem({ ...draggedSortItem, index });
  }

  // Website Drag Handlers
  function handleWebsiteDragStart(e: React.DragEvent, groupIndex: number, websiteIndex: number) {
    e.stopPropagation();
    setDraggedSortItem({ type: 'website', index: groupIndex, subIndex: websiteIndex });
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleWebsiteDragOver(e: React.DragEvent, groupIndex: number, websiteIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSortItem || draggedSortItem.type !== 'website') return;
    
    // Allow moving between categories? Requirement says "within category", but usually drag and drop implies flexibility.
    // Let's allow moving between categories for better UX, or restrict it. 
    // "In the category group... drag and drop to adjust website order". 
    // I'll support cross-category drag for better UX as it implicitly supports re-categorization if saved.
    
    if (draggedSortItem.index === groupIndex && draggedSortItem.subIndex === websiteIndex) return;

    const newGroups = [...groupedWebsites];
    const sourceGroup = newGroups[draggedSortItem.index];
    const targetGroup = newGroups[groupIndex];
    
    const item = sourceGroup.websites.splice(draggedSortItem.subIndex!, 1)[0];
    // Update category_id if moved to different group
    if (draggedSortItem.index !== groupIndex) {
        item.category_id = targetGroup.category.id; 
        // Note: This won't persist category change until save, but our save logic only updates sort_order.
        // We might need to update category_id in DB too if we allow cross-category.
        // For now, let's RESTRICT to same category to simplify and meet strict "sort" requirement.
    }
    
    // Restricting to same category for now to ensure data integrity with just updateWebsiteSortOrder
    if (draggedSortItem.index !== groupIndex) return; 

    targetGroup.websites.splice(websiteIndex, 0, item);
    
    setGroupedWebsites(newGroups);
    setDraggedSortItem({ type: 'website', index: groupIndex, subIndex: websiteIndex });
  }

  function handleDragEnd() {
    setDraggedSortItem(null);
  }

  function sortGroupWebsites(groupIndex: number, direction: 'asc' | 'desc') {
    const newGroups = [...groupedWebsites];
    newGroups[groupIndex].websites.sort((a, b) => {
      return direction === 'asc' 
        ? a.title.localeCompare(b.title, 'zh-CN') 
        : b.title.localeCompare(a.title, 'zh-CN');
    });
    setGroupedWebsites(newGroups);
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
        ) : isSortMode ? (
            <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                    提示：拖拽分类标题可调整分类顺序，拖拽网站卡片可调整组内顺序。
                </div>
                {groupedWebsites.map((group, groupIndex) => (
                    <div 
                        key={group.category.id} 
                        className="border rounded-lg bg-card"
                        draggable
                        onDragStart={(e) => handleCategoryDragStart(e, groupIndex)}
                        onDragOver={(e) => handleCategoryDragOver(e, groupIndex)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="p-3 bg-muted/50 border-b flex items-center justify-between cursor-move group">
                            <div className="flex items-center gap-2 font-medium">
                                <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                                {group.category.icon} {group.category.name}
                                <Badge variant="secondary" className="text-xs ml-2">
                                    {group.websites.length}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => sortGroupWebsites(groupIndex, 'asc')}
                                    title="按名称A-Z排序"
                                >
                                    A-Z
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => sortGroupWebsites(groupIndex, 'desc')}
                                    title="按名称Z-A排序"
                                >
                                    Z-A
                                </Button>
                            </div>
                        </div>
                        <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {group.websites.map((website, wIndex) => (
                                <div
                                    key={website.id}
                                    draggable
                                    onDragStart={(e) => handleWebsiteDragStart(e, groupIndex, wIndex)}
                                    onDragOver={(e) => handleWebsiteDragOver(e, groupIndex, wIndex)}
                                    onDragEnd={handleDragEnd}
                                    className="flex items-center gap-3 p-2 border rounded bg-background hover:bg-accent cursor-move transition-colors"
                                >
                                    <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                                    {website.favicon_url && (
                                        <img 
                                            src={website.favicon_url} 
                                            className="w-4 h-4 object-contain shrink-0" 
                                            onError={(e) => e.currentTarget.style.display = 'none'}
                                        />
                                    )}
                                    <span className="truncate text-sm flex-1">{website.title}</span>
                                </div>
                            ))}
                            {group.websites.length === 0 && (
                                <div className="col-span-full py-4 text-center text-xs text-muted-foreground border border-dashed rounded">
                                    此分类下暂无网站
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : websites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无网站，点击上方按钮添加
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                    <Checkbox
                        checked={selectedWebsites.size === websites.length}
                        onCheckedChange={toggleSelectAll}
                    />
                </TableHead>
                <TableHead>网站</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>访问量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => (
                <TableRow 
                    key={website.id}
                >
                  <TableCell>
                    <Checkbox
                        checked={selectedWebsites.has(website.id)}
                        onCheckedChange={() => toggleSelectWebsite(website.id)}
                    />
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
                      {website.click_count}
                  </TableCell>
                  <TableCell>
                    {website.is_visible ? (
                      <Badge variant="default">可见</Badge>
                    ) : (
                      <Badge variant="secondary">隐藏</Badge>
                    )}
                  </TableCell>
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
