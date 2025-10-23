# n8n-node-napcat-test

Community node for integrating NapCat QQ Bot API with n8n. For full Chinese documentation, see `README_CN.md`.

社区节点，用于将 NapCat QQ 机器人 API 集成到 n8n 中。完整的中文文档请参阅 `README_CN.md`。

## Install & Build | 安装与构建

```bash
npm ci
npm run build
```

## Usage | 使用方法

**English:**
- Add credentials: NapCat API (Base URL, Access Token)
- Use the `NapCat` node in your n8n workflows

**中文:**
- 添加凭证：NapCat API（基础 URL、访问令牌）
- 在您的 n8n 工作流中使用 `NapCat` 节点

## Links | 链接

- Detailed Chinese guide: `README_CN.md`
- 详细中文指南：`README_CN.md`
- Modification details: `CHANGELOG_NODES_MODIFICATION.md`
- 修改详情：`CHANGELOG_NODES_MODIFICATION.md`

## Project Structure | 项目结构

```
n8n-nodes-napcat/
├── credentials/           # Credential types | 凭证类型
│   └── NapCatApi.credentials.ts
├── nodes/                # Node types | 节点类型
│   └── NapCat/          # NapCat node (both operation & tool) | NapCat 节点（操作节点和工具节点）
│       ├── NapCat.node.ts
│       └── napcat.svg
├── dist/                # Compiled output (generated) | 编译输出（自动生成）
├── package.json
├── tsconfig.json
├── gulpfile.js
├── build.js
└── CHANGELOG_NODES_MODIFICATION.md  # Modification details | 修改详情
```

**Note | 注意：** NapCat 节点现在同时支持作为普通操作节点和 AI Agent 工具节点使用。详见 `CHANGELOG_NODES_MODIFICATION.md`。

## Development | 开发

```bash
# Install dependencies | 安装依赖
npm ci

# Build TypeScript | 编译 TypeScript
npm run build:tsc

# Build icons | 构建图标
npm run build:icons

# Watch mode | 监听模式
npm run dev

# Full watch mode | 完整监听模式
npm run dev:full

# Format code | 格式化代码
npm run format

# Lint | 代码检查
npm run lint
```
