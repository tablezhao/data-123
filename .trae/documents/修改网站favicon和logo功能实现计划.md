# 修改网站favicon和logo功能实现计划

## 1. 问题分析

* **当前状态**：

  * favicon 在 index.html 中硬编码为 `/favicon.png`

  * logo 使用 Lucide 的 `Shield` 图标，不是自定义图片

  * 管理后台只支持修改文本设置，没有图片上传功能

* **需求**：

  * 允许管理员上传和修改 favicon

  * 允许管理员上传和修改 logo

  * 支持动态加载，修改后立即生效

## 2. 实现方案

### 2.1 添加图片上传功能

* **创建上传组件**：新建 `Uploader` 组件用于图片上传

* **集成 Supabase Storage**：使用 Supabase Storage 存储图片

* **添加上传服务**：创建 `uploadService.ts` 处理上传逻辑

### 2.2 更新设置管理

* **扩展 SettingsManagement 组件**：

  * 添加 favicon 上传字段

  * 添加 logo 上传字段

* **扩展数据库 schema**：在 `site_settings` 表中添加 `favicon_url` 和 `logo_url` 字段

### 2.3 更新状态管理

* **修改 settingsStore**：

  * 添加 `faviconUrl` 和 `logoUrl` 字段

  * 更新 `loadSettings` 方法支持新字段

### 2.4 更新前端组件

* **修改 Header 组件**：

  * 使用 `logoUrl` 显示自定义 logo

  * 替换硬编码的 Shield 图标

* **动态设置 favicon**：

  * 创建 `FaviconManager` 组件

  * 监听 `faviconUrl` 变化，动态更新 favicon

### 2.5 更新页面元信息

* **修改 PageMeta 组件**：

  * 添加 favicon 支持

  * 动态设置 og:image 等社交媒体元信息

## 3. 实现步骤

### 步骤 1: 创建上传服务

* 新建 `src/services/uploadService.ts`

* 实现 `uploadImage` 方法，支持上传到 Supabase Storage

* 实现 `deleteImage` 方法，支持删除图片

### 步骤 2: 扩展设置管理

* 修改 `src/components/admin/SettingsManagement.tsx`：

  * 添加 logo 和 favicon 上传字段

  * 集成上传组件

  * 更新保存逻辑

### 步骤 3: 更新状态管理

* 修改 `src/stores/settingsStore.ts`：

  * 添加 `faviconUrl` 和 `logoUrl` 字段

  * 更新 `loadSettings` 方法

### 步骤 4: 更新 Header 组件

* 修改 `src/components/common/Header.tsx`：

  * 使用 `logoUrl` 显示自定义 logo

  * 支持 fallback 到默认 Shield 图标

### 步骤 5: 添加 FaviconManager 组件

* 新建 `src/components/common/FaviconManager.tsx`

* 监听 `faviconUrl` 变化，动态更新 favicon

* 在 `App.tsx` 中集成

### 步骤 6: 测试和验证

* 测试上传功能

* 测试动态更新

* 测试不同尺寸的图片

* 测试无图片时的 fallback

## 4. 技术要点

### 4.1 图片处理

* 支持多种图片格式（png, jpg, svg）

* 限制图片大小

* 自动生成缩略图

### 4.2 性能优化

* 使用懒加载

* 缓存图片 URL

* 避免重复上传

### 4.3 用户体验

* 显示上传进度

* 支持预览

* 支持删除和替换

### 4.4 兼容性

* 支持不同浏览器

* 支持不同设备尺寸

* 支持 dark mode

## 5. 预期效果

* 管理员可以在后台上传和修改 favicon

* 管理员可以在后台上传和修改 logo

* 修改后立即生效，无需重新部署

* 支持 fallback 到默认设置

* 响应式设计，适配不同设备

## 6. 文件修改清单

### 新增文件

* `src/components/ui/uploader.tsx` - 上传组件

* `src/services/uploadService.ts` - 上传服务

* `src/components/common/FaviconManager.tsx` - favicon 管理组件

### 修改文件

* `src/components/admin/SettingsManagement.tsx` - 扩展设置管理

* `src/stores/settingsStore.ts` - 更新状态管理

* `src/components/common/Header.tsx` - 更新 logo 显示

* `src/components/common/PageMeta.tsx` - 更新元信息

* `src/App.tsx` - 集成 FaviconManager

## 7. 注意事项

* 需要配置 Supabase Storage 权限

* 需要确保上传的图片符合尺寸要求

* 需要处理上传失败的情况

* 需要考虑图片的缓存策略

* 需要测试不同浏览器的兼容性

