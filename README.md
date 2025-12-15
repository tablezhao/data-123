# 数据合规123导航

专业的数据合规网站导航平台，提供数据合规相关网站的分类导航、搜索和收藏功能。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v7
- **样式**: Tailwind CSS + Radix UI
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **测试**: Vitest + React Testing Library
- **后端服务**: Supabase
- **主题**: Next Themes
- **通知**: Sonner

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── admin/         # 管理后台组件
│   ├── auth/          # 认证相关组件
│   ├── common/        # 通用组件
│   └── ui/            # 基础 UI 组件
├── features/           # 功能模块
│   ├── auth/          # 认证功能
│   ├── admin/         # 管理后台
│   ├── favorites/     # 收藏功能
│   └── home/          # 首页功能
├── contexts/          # React Context
├── hooks/             # 自定义钩子
├── lib/               # 工具函数
├── services/          # 业务逻辑和 API 调用
├── stores/            # 状态管理
├── types/             # TypeScript 类型
├── utils/             # 通用工具
├── pages/             # 页面组件
├── App.tsx
├── main.tsx
└── routes.tsx
```

## 核心功能

### 1. 网站导航
- 按分类浏览网站
- 热门网站推荐
- 网站搜索功能
- 网站收藏

### 2. 用户系统
- 用户登录/注册
- 个人收藏管理
- 角色权限控制

### 3. 管理后台
- 分类管理
- 网站管理
- 用户管理
- 网站设置

### 4. 其他功能
- 主题切换（亮色/暗色）
- 响应式设计
- 错误处理
- 性能优化（路由懒加载、图片懒加载）

## 安装和运行

### 前置条件
- Node.js 18+
- pnpm 包管理器

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

### 运行测试

```bash
pnpm test
```

### 运行代码检查

```bash
pnpm lint
```

## 环境变量

需要配置以下环境变量：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ID=your_app_id
```

## 开发规范

- 使用 TypeScript 编写所有代码
- 使用 ESLint 和 Biome 进行代码检查
- 遵循约定的命名规范
- 编写单元测试覆盖核心功能
- 保持组件的单一职责
- 使用 Tailwind CSS 进行样式开发

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过 GitHub Issues 提交。
