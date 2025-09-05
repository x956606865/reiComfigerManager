# reiConfigManager 架构设计文档

## 项目概述

reiConfigManager 是一个基于 Tauri + Next.js 的跨平台配置文件管理工具，旨在为用户提供统一的配置文件编辑界面，支持多种配置格式和预设切换功能。

## 核心特性

- 🚀 **跨平台支持**: 基于 Tauri，支持 Windows、macOS、Linux
- 📝 **多格式支持**: JSON、YAML、TOML、INI、XML、.env 等
- 🎨 **统一编辑界面**: 智能表单编辑器，自动适配不同配置格式
- 💾 **预设管理**: 快速切换不同配置预设
- 🔄 **版本控制**: 配置变更历史记录和回滚
- 🔍 **智能识别**: 自动扫描和识别系统中的配置文件
- ⚡ **实时应用**: 支持配置热重载和应用重启

## 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14+ | React 框架，使用 App Router |
| TypeScript | 5.0+ | 类型安全 |
| Tailwind CSS | 3.0+ | 样式框架 |
| shadcn/ui | latest | UI 组件库 |
| Zustand | 4.0+ | 状态管理 |
| Monaco Editor | latest | 代码编辑器 |
| React Hook Form | 7.0+ | 表单处理 |
| Zod | 3.0+ | 数据验证 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Tauri | 2.0+ | 桌面应用框架 |
| Rust | latest | 后端开发语言 |
| serde | 1.0+ | 序列化/反序列化 |
| notify-rs | 6.0+ | 文件系统监听 |
| tokio | 1.0+ | 异步运行时 |
| directories | 5.0+ | 跨平台目录路径 |

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 配置列表 │ │ 编辑器   │ │ 预设管理 │ │ 历史记录 │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      前端业务逻辑层                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 状态管理 │ │ 数据验证 │ │ API调用  │ │ 事件处理 │      │
│  │ (Zustand)│ │  (Zod)   │ │ (Tauri)  │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                     Tauri IPC Bridge
                              │
┌─────────────────────────────────────────────────────────────┐
│                      后端服务层 (Rust)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 文件管理 │ │ 配置解析 │ │ 预设服务 │ │ 进程管理 │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        数据存储层                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 文件系统 │ │ JSON存储 │ │ 内存缓存 │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 项目结构

```
reiConfigManager/
├── src-tauri/                 # Tauri 后端
│   ├── src/
│   │   ├── main.rs           # 主程序入口
│   │   ├── commands/         # Tauri 命令
│   │   │   ├── mod.rs
│   │   │   ├── config.rs    # 配置文件操作
│   │   │   ├── preset.rs    # 预设管理
│   │   │   └── history.rs   # 历史记录
│   │   ├── parsers/          # 配置解析器
│   │   │   ├── mod.rs
│   │   │   ├── json.rs
│   │   │   ├── yaml.rs
│   │   │   ├── toml.rs
│   │   │   ├── ini.rs
│   │   │   └── xml.rs
│   │   ├── storage/          # 文件存储
│   │   │   ├── mod.rs
│   │   │   ├── version_storage.rs  # 版本管理
│   │   │   └── preferences.rs      # 偏好设置
│   │   ├── services/         # 业务服务
│   │   │   ├── mod.rs
│   │   │   ├── scanner.rs   # 文件扫描
│   │   │   ├── watcher.rs   # 文件监听
│   │   │   └── process.rs   # 进程管理
│   │   └── utils/            # 工具函数
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                       # Next.js 前端
│   ├── app/                  # App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── configs/          # 配置管理页面
│   │   ├── editor/           # 编辑器页面
│   │   ├── presets/          # 预设管理页面
│   │   └── history/          # 历史记录页面
│   ├── components/           # React 组件
│   │   ├── ui/              # 基础 UI 组件
│   │   ├── editor/          # 编辑器组件
│   │   ├── config/          # 配置相关组件
│   │   └── layout/          # 布局组件
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useTauri.ts
│   │   ├── useConfig.ts
│   │   └── usePreset.ts
│   ├── lib/                 # 工具库
│   │   ├── tauri.ts        # Tauri API 封装
│   │   ├── validators.ts   # 验证函数
│   │   └── utils.ts        # 工具函数
│   ├── stores/              # Zustand 状态管理
│   │   ├── config.ts
│   │   ├── preset.ts
│   │   └── ui.ts
│   └── types/               # TypeScript 类型定义
│       ├── config.ts
│       ├── preset.ts
│       └── api.ts
├── public/                   # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 核心功能模块

### 1. 配置文件管理

**功能描述**:
- 自动扫描系统中的配置文件
- 支持手动添加配置文件路径
- 配置文件分组和标签管理
- 快速搜索和过滤

**关键实现**:
```typescript
interface ConfigFile {
  id: string
  name: string
  path: string
  format: ConfigFormat
  appName: string
  tags: string[]
  groupId?: string
  lastModified: Date
  size: number
  schema?: ConfigSchema
}

type ConfigFormat = 'json' | 'yaml' | 'toml' | 'ini' | 'xml' | 'env'
```

### 2. 统一编辑器

**功能描述**:
- Schema 驱动的表单编辑器
- 源码编辑模式（Monaco Editor）
- 实时语法验证
- 自动补全和智能提示
- 可视化编辑和源码编辑切换

**编辑器模式**:
- **表单模式**: 根据配置 Schema 生成表单
- **源码模式**: 直接编辑配置文件源码
- **混合模式**: 同时显示表单和源码

### 3. 预设系统

**功能描述**:
- 创建和管理配置预设
- 预设模板变量支持
- 快速切换和应用预设
- 预设导入/导出
- 环境相关的预设

**数据模型**:
```typescript
interface Preset {
  id: string
  name: string
  description: string
  configFileId: string
  content: Record<string, any>
  variables: Variable[]
  environment?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface Variable {
  key: string
  value: string | number | boolean
  type: 'string' | 'number' | 'boolean'
  description?: string
  required: boolean
  defaultValue?: any
}
```

### 4. 版本控制

**功能描述**:
- 自动记录配置变更历史
- 配置差异对比视图
- 快速回滚到历史版本
- 配置备份和恢复

**历史记录**:
```typescript
interface ConfigHistory {
  id: string
  configFileId: string
  content: string
  snapshot: Record<string, any>
  diff?: DiffResult
  timestamp: Date
  action: HistoryAction
  userId?: string
  description?: string
}

type HistoryAction = 'create' | 'update' | 'delete' | 'restore' | 'apply_preset'
```

### 5. 应用集成

**功能描述**:
- 检测相关应用进程状态
- 配置应用后自动重载
- 支持应用重启
- 配置验证和兼容性检查

## API 设计

### Tauri Commands

```rust
// Software Management
#[tauri::command]
async fn get_software_list() -> Result<Vec<(SoftwareDefinition, SoftwareStatus)>, String>

#[tauri::command]
async fn get_software_config(software_id: String) -> Result<Option<(String, Value)>, String>

#[tauri::command]
async fn save_software_config(
    software_id: String,
    content: String,
    parsed_content: Value,
    note: Option<String>
) -> Result<(), String>

// Version Management
#[tauri::command]
async fn get_version_history(
    software_id: String,
    limit: Option<usize>
) -> Result<Vec<ConfigVersion>, String>

#[tauri::command]
async fn restore_version(
    software_id: String,
    version_id: String
) -> Result<(), String>

#[tauri::command]
async fn delete_version(
    software_id: String,
    version_id: String
) -> Result<(), String>

#[tauri::command]
async fn set_max_versions(
    software_id: String,
    max_versions: usize
) -> Result<(), String>

// Preferences Management
#[tauri::command]
async fn get_preferences(software_id: String) -> Result<SoftwarePreferences, String>

#[tauri::command]
async fn save_preferences(preferences: SoftwarePreferences) -> Result<(), String>

// Template Management
#[tauri::command]
async fn apply_template(
    software_id: String,
    template_id: String
) -> Result<Value, String>
```

## 数据存储设计

### 文件系统存储结构

```
应用数据目录/
├── versions/                    # 版本历史存储
│   ├── [software_id]/          # 每个软件的版本目录
│   │   ├── index.json          # 版本索引文件
│   │   └── [version_id].json   # 各个版本内容
│   └── ...
├── preferences.json             # 用户偏好设置
└── templates/                   # 自定义模板
    └── [software_id]/
        └── [template_id].json
```

### 版本索引结构

```json
{
  "versions": [
    {
      "id": "uuid",
      "software_id": "zsh",
      "timestamp": "2025-01-01T00:00:00Z",
      "note": "Manual backup",
      "is_auto_save": false,
      "checksum": "hash",
      "file_name": "uuid.json"
    }
  ],
  "max_versions": 20  // 用户可配置的最大版本数
}
```

### 偏好设置结构

```json
[
  {
    "software_id": "zsh",
    "preferred_editor": "form",
    "show_advanced": false,
    "auto_save": true,
    "auto_backup": true,
    "backup_count": 20
  }
]
```

## 安全考虑

### 文件访问控制
- 验证文件路径合法性，防止路径遍历攻击
- 检查文件读写权限
- 限制可访问的文件类型和目录

### 数据保护
- 敏感配置项脱敏显示
- 密码和密钥字段自动识别
- 版本文件完整性校验（checksum）
- 用户可控的版本保留策略

### 操作审计
- 记录所有配置修改操作
- 保存操作时间、内容和来源
- 支持审计日志导出

### 进程安全
- 验证进程操作权限
- 防止恶意进程注入
- 限制进程操作范围

## 性能优化

### 文件操作优化
- 配置文件增量扫描
- 文件内容缓存机制
- 异步文件读写操作
- 批量文件操作优化

### UI 性能优化
- 虚拟滚动列表
- 组件懒加载
- 代码分割
- 图片和资源优化

### 编辑器优化
- Monaco Editor 按需加载
- 大文件分块加载
- 语法高亮异步处理
- Web Worker 处理复杂计算

### 存储优化
- 文件系统缓存
- 增量版本检测（基于 checksum）
- 自动清理过期版本
- 内存缓存常用配置

## 扩展性设计

### 插件系统
- 支持自定义配置解析器
- 自定义编辑器组件
- 扩展验证规则
- 自定义操作命令

### 配置模板
- 内置常用软件配置模板
- 社区模板市场
- 模板版本管理
- 模板兼容性检查

### 团队协作
- 配置共享机制
- 团队预设库
- 权限管理
- 变更通知

## 开发规范

### 代码规范
- TypeScript 严格模式
- ESLint + Prettier 代码格式化
- 组件命名规范（PascalCase）
- 函数命名规范（camelCase）

### Git 工作流
- 主分支：main
- 开发分支：develop
- 功能分支：feature/xxx
- 修复分支：fix/xxx
- 发布分支：release/xxx

### 测试要求
- 单元测试覆盖率 > 80%
- 集成测试核心功能
- E2E 测试关键流程
- 性能测试和压力测试

### 文档要求
- README.md：项目说明和快速开始
- API 文档：自动生成
- 用户手册：使用指南
- 开发文档：架构和开发指南

## 版本规划

### v0.1.0 - MVP 版本
- [x] 项目初始化
- [ ] 基础 UI 框架
- [ ] 配置文件扫描和显示
- [ ] JSON/YAML 编辑器
- [ ] 简单预设功能

### v0.2.0 - 核心功能
- [ ] 完整格式支持
- [ ] 表单编辑器
- [ ] 预设管理系统
- [ ] 历史记录功能

### v0.3.0 - 增强功能
- [ ] 进程管理
- [ ] 配置热重载
- [ ] 差异对比
- [ ] 批量操作

### v1.0.0 - 正式版本
- [ ] 插件系统
- [ ] 模板市场
- [ ] 团队协作
- [ ] 完整文档

## 部署方案

### 开发环境
```bash
# Install dependencies
npm install
cd src-tauri && cargo build

# Run development server
npm run tauri dev
```

### 构建发布
```bash
# Build for production
npm run tauri build

# Platform specific builds
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target x86_64-apple-darwin     # macOS
npm run tauri build -- --target x86_64-unknown-linux-gnu # Linux
```

### CI/CD 配置
- GitHub Actions 自动构建
- 多平台并行构建
- 自动化测试
- 版本发布自动化

## 监控和维护

### 错误监控
- Sentry 集成
- 错误日志收集
- 崩溃报告
- 性能监控

### 更新机制
- 自动更新检查
- 增量更新支持
- 版本回滚机制
- 更新日志展示

### 用户反馈
- 内置反馈功能
- 问题追踪系统
- 用户统计分析
- 功能使用率统计

## 许可证

MIT License

## 贡献指南

欢迎贡献代码、报告问题或提出建议。请查看 CONTRIBUTING.md 了解详细信息。