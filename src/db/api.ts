// API 入口文件 - 从各个服务模块导出所有函数
// 此文件保持原有 API 结构，实现平滑迁移

// 分类相关 API
export * from '../services/categoryService';

// 网站链接相关 API
export * from '../services/websiteService';

// 用户收藏相关 API
export * from '../services/favoritesService';

// 网站配置相关 API
export * from '../services/settingsService';

// 访问统计相关 API
export * from '../services/statsService';

// 用户相关 API
export * from '../services/userService';

// Force update
