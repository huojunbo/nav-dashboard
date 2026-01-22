# 导航仪表板 (Navigation Dashboard)

一个功能丰富、现代化的个人导航仪表板应用，集成了时钟、搜索、书签、天气和待办事项等实用功能。

## ✨ 主要功能

- 🕐 **时钟组件** - 实时显示当前时间
- 🔍 **搜索栏** - 快速搜索支持
- 🔗 **链接管理** - 自定义书签网格，支持添加、编辑、删除常用网站
- 🌤️ **天气组件** - 显示当前位置的天气信息
- ✅ **待办事项** - 任务管理功能
- 🌍 **多语言支持** - 支持中文和英文切换
- 💾 **数据持久化** - 使用 SQLite 数据库，localStorage 备份

## 🛠️ 技术栈

### 前端
- **React 19.2.0** - 现代化 React 框架
- **Vite 7.2.4** - 快速的构建工具
- **Tailwind CSS 4.1.18** - 实用优先的 CSS 框架
- **i18next** - 国际化框架
- **lucide-react** - 精美的图标库

### 后端
- **Express 5.2.1** - Node.js Web 框架
- **better-sqlite3** - 同步 SQLite 数据库
- **CORS** - 跨域资源共享支持

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 处理工具
- **Docker** - 容器化部署支持

## 📁 项目结构

```
nav-dashboard/
├── src/                      # 前端源代码
│   ├── components/           # React 组件
│   │   ├── ClockWidget.jsx   # 时钟组件
│   │   ├── SearchBar.jsx     # 搜索栏
│   │   ├── LinkGrid.jsx      # 链接网格
│   │   ├── WeatherWidget.jsx # 天气组件
│   │   ├── TodoWidget.jsx    # 待办事项组件
│   │   ├── Layout.jsx        # 布局组件
│   │   └── LanguageSwitcher.jsx # 语言切换
│   ├── i18n/                 # 国际化配置
│   │   ├── config.js         # i18n 配置
│   │   └── locales/          # 语言文件
│   │       ├── en.json       # 英文翻译
│   │       └── zh.json       # 中文翻译
│   ├── App.jsx               # 主应用组件
│   └── main.jsx              # 应用入口
├── server/                   # 后端服务器
│   ├── index.js              # 服务器入口
│   ├── database.js           # SQLite 数据库配置
│   └── routes/               # API 路由
│       ├── links.js          # 书签 API
│       └── todos.js          # 待办事项 API
├── public/                   # 静态资源
├── dist/                     # 构建输出目录
├── Dockerfile                # Docker 配置
├── docker-compose.yml        # Docker Compose 配置
├── DOCKER.md                 # Docker 部署文档
└── package.json              # 项目依赖配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd nav-dashboard

# 安装依赖
npm install
```

### 开发模式

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:server  # 启动后端服务器 (端口 3001)
npm run dev:client  # 启动前端开发服务器
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览生产版本
npm run preview
```

## 🔧 配置

### 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
# API 服务器地址（可选，默认为 http://localhost:3001/api）
VITE_API_URL=http://localhost:3001/api

# 服务器端口（可选，默认为 3001）
PORT=3001
```

### 端口说明

- **前端开发服务器**: http://localhost:5173
- **后端 API 服务器**: http://localhost:3001
- **生产构建后**: http://localhost:3001（后端同时服务静态文件）

## 📦 Docker 部署

项目支持 Docker 容器化部署，详细的部署文档请参考 [DOCKER.md](./DOCKER.md)。

### 快速启动

```bash
# 使用 Docker Compose
docker-compose up -d

# 应用将在 http://localhost:3001 访问
```

## 🌐 API 接口

### 书签管理

```bash
GET    /api/links       # 获取所有书签
POST   /api/links       # 创建书签
PUT    /api/links/:id   # 更新书签
DELETE /api/links/:id   # 删除书签
```

### 待办事项

```bash
GET    /api/todos       # 获取所有待办事项
POST   /api/todos       # 创建待办事项
PUT    /api/todos/:id   # 更新待办事项
DELETE /api/todos/:id   # 删除待办事项
```

### 健康检查

```bash
GET    /api/health      # 服务健康状态
```

## 🌍 国际化

应用支持中英文切换，语言文件位于 `src/i18n/locales/` 目录。

### 添加新语言

1. 在 `src/i18n/locales/` 创建新的语言 JSON 文件
2. 在 `src/i18n/config.js` 中添加语言配置
3. 在 `LanguageSwitcher.jsx` 中添加语言切换选项

## 💾 数据存储

- **主存储**: SQLite 数据库 (`server/data/dashboard.db`)
- **备用存储**: localStorage（当 API 不可用时自动降级）
- **数据备份**: 支持通过数据库文件备份和恢复

## 🎨 自定义

### 修改默认链接

编辑 `src/components/LinkGrid.jsx` 中的 `DEFAULT_LINKS` 数组：

```javascript
const DEFAULT_LINKS = [
    { id: '1', name: 'GitHub', url: 'https://github.com' },
    { id: '2', name: 'YouTube', url: 'https://youtube.com' },
    // 添加更多链接...
];
```

### 修改主题颜色

编辑 `tailwind.config.js` 配置文件自定义主题。

## 🐛 故障排除

### 数据库连接错误

确保 `server/data/` 目录存在且有写入权限：

```bash
mkdir -p server/data
chmod 755 server/data
```

### 端口冲突

修改 `.env` 文件中的 `PORT` 环境变量。

### API 请求失败

检查后端服务是否正常运行，确认防火墙设置。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 Issue 联系。
