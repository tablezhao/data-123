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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/db/api';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';
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

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: '',
    description: '',
    icon: '',
    sort_order: 0,
    is_visible: true,
  });
  // 热门推荐分类管理相关状态
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  // 从settingsStore获取热门推荐模块的显示状态
  const { showFeaturedSection, toggleFeaturedSection } = useSettingsStore();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('加载分类失败:', error);
      toast.error('加载分类失败');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(category?: Category) {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        sort_order: category.sort_order,
        is_visible: category.is_visible,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
        sort_order: 0,
        is_visible: true,
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData as UpdateCategoryInput);
        toast.success('分类更新成功');
      } else {
        await createCategory(formData);
        toast.success('分类创建成功');
      }
      setDialogOpen(false);
      loadCategories();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('操作失败');
    }
  }

  async function handleDelete() {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      toast.success('分类删除成功');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，可能存在关联的网站');
    }
  }

  async function toggleVisibility(category: Category) {
    try {
      await updateCategory(category.id, { is_visible: !category.is_visible });
      toast.success('可见性已更新');
      loadCategories();
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  }

  // 处理分类选择
  const handleCategorySelect = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedCategories.size === flatCategories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(flatCategories.map(cat => cat.id)));
    }
  };

  // 批量更新可见性
  const handleBatchToggleVisibility = async (isVisible: boolean) => {
    if (selectedCategories.size === 0) {
      toast.warning('请选择至少一个分类');
      return;
    }

    try {
      setLoading(true);
      // 批量更新分类可见性
      const updatePromises = Array.from(selectedCategories).map(id => 
        updateCategory(id, { is_visible })
      );
      await Promise.all(updatePromises);
      toast.success(`已${isVisible ? '显示' : '隐藏'}选中的${selectedCategories.size}个分类`);
      setSelectedCategories(new Set());
      loadCategories();
    } catch (error) {
      console.error('批量更新失败:', error);
      toast.error('批量更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 展平分类树
  function flattenCategories(cats: Category[], level = 0): Array<Category & { level: number }> {
    const result: Array<Category & { level: number }> = [];
    for (const cat of cats) {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, level + 1));
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
            <CardTitle>分类管理</CardTitle>
            <CardDescription>管理网站分类和子分类</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                添加分类
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? '编辑分类' : '添加分类'}</DialogTitle>
                  <DialogDescription>
                    填写分类信息，所有字段都是可选的
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">分类名称 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
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
                    <Label htmlFor="icon">图标（Emoji）</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="📁"
                    />
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
                  <Button type="submit">
                    {editingCategory ? '更新' : '创建'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* 热门推荐模块控制 */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">首页热门推荐模块管理</CardTitle>
            <CardDescription>控制首页热门推荐模块的显示状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  开启后，首页将显示热门推荐模块，展示热门网站
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showFeaturedSection}
                  onCheckedChange={toggleFeaturedSection}
                />
                <span className="text-sm font-medium">
                  {showFeaturedSection ? '已开启' : '已关闭'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 批量操作区域 */}
        {flatCategories.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedCategories.size === flatCategories.length ? '取消全选' : '全选'}
                ({selectedCategories.size}/{flatCategories.length})
              </Button>
              {selectedCategories.size > 0 && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleBatchToggleVisibility(true)}
                  >
                    批量显示
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBatchToggleVisibility(false)}
                  >
                    批量隐藏
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 分类列表 */}
        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : flatCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无分类，点击上方按钮添加
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedCategories.size === flatCategories.length && flatCategories.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border border-input bg-background text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </TableHead>
                <TableHead>名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category.id)}
                      onChange={() => handleCategorySelect(category.id)}
                      className="rounded border border-input bg-background text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${category.level * 20}px` }}>
                      {category.icon && <span>{category.icon}</span>}
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>
                    {category.is_visible ? (
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
                        onClick={() => toggleVisibility(category)}
                      >
                        {category.is_visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCategoryToDelete(category);
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
              确定要删除分类 "{categoryToDelete?.name}" 吗？此操作无法撤销。
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
