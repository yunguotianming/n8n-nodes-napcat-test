# NapCat 节点修改说明

## 修改日期
2024年

## 修改背景

### 问题
之前 n8n-nodes-napcat 项目中存在两个独立的节点：
- `NapCat` - 操作节点（用于普通工作流）
- `NapCatTools` - 工具节点（用于 AI Agent）

这导致代码重复，维护困难。

### 目标
让 NapCat 节点同时作为操作节点和 AI Agent 工具节点，移除冗余的 `NapCatTools` 文件夹。

### 参考项目
参考了 `n8n/nodes/n8n-nodes-feishu-lark/nodes/Lark/Lark.node.ts`，通过在主节点文件的 `description` 中添加 `usableAsTool: true` 实现。

## 修改内容

### 1. 修改 `nodes/NapCat/NapCat.node.ts`

**位置：第 90-91 行**

在 `outputs: ['main'],` 之后添加 `usableAsTool: true,`

**修改前：**
```typescript
	outputs: ['main'],
	credentials: [
		{
			name: 'napCatApi',
			required: true,
		},
	],
```

**修改后：**
```typescript
	outputs: ['main'],
	usableAsTool: true,
	credentials: [
		{
			name: 'napCatApi',
			required: true,
		},
	],
```

**说明：**
- `usableAsTool: true` 让节点同时出现在节点面板和工具节点列表
- 位置与 feishu-lark 节点一致（第 44 行）

### 2. 修改 `package.json`

**位置：第 44-46 行的 `nodes` 数组**

**修改前：**
```json
"nodes": [
	"dist/nodes/NapCat/NapCat.node.js",
	"dist/nodes/NapCatTools/NapCatTool.node.js"
]
```

**修改后：**
```json
"nodes": [
	"dist/nodes/NapCat/NapCat.node.js"
]
```

**说明：**
- 移除了 `NapCatTool.node.js` 的注册
- 只保留主节点文件

### 3. 删除冗余文件

**删除的文件：**
- `nodes/NapCatTools/NapCatTool.node.ts`
- `nodes/NapCatTools/shared/messageBuilder.ts`
- `nodes/NapCatTools/shared/types.ts`
- `dist/nodes/NapCatTools/` 整个文件夹及其所有构建产物

**说明：**
- `NapCat.node.ts` 中已包含消息构建逻辑
- 不再需要 `NapCatTools` 文件夹

## 验证步骤

### 1. 检查文件结构

```bash
# 确认 nodes 目录结构
ls nodes/
# 应该只看到：NapCat/

# 确认没有 NapCatTools 文件夹
ls nodes/NapCatTools  # 应该报错：文件不存在
```

### 2. 检查代码修改

```bash
# 确认 NapCat.node.ts 包含 usableAsTool: true
grep -n "usableAsTool" nodes/NapCat/NapCat.node.ts
# 应该输出：91: usableAsTool: true,

# 确认 package.json 只注册一个节点
cat package.json | grep -A 3 '"nodes"'
# 应该只看到：dist/nodes/NapCat/NapCat.node.js
```

### 3. 构建项目

```bash
# 清理旧的构建产物
rm -rf dist/

# 重新构建
npm run build
```

### 4. 验证构建结果

```bash
# 确认 dist 目录结构
ls dist/nodes/
# 应该只看到：NapCat/

# 确认没有 NapCatTools 文件夹
ls dist/nodes/NapCatTools  # 应该报错：文件不存在
```

### 5. 检查代码质量

```bash
# 运行 lint 检查
npm run lint

# 应该没有错误
```

## 使用说明

### 安装到 n8n

1. **构建项目**
   ```bash
   npm run build
   ```

2. **安装到 n8n**
   ```bash
   # 方式1：复制到 n8n 的自定义节点目录
   cp -r dist/* /path/to/n8n/custom/
   
   # 方式2：使用 npm link（开发环境）
   npm link
   cd /path/to/n8n
   npm link n8n-nodes-napcat-test
   ```

3. **重启 n8n**
   ```bash
   # 重启 n8n 服务以加载新节点
   ```

### 使用节点

#### 作为普通操作节点
1. 在 n8n 工作流中添加节点
2. 搜索 "NapCat"
3. 选择节点并配置参数

#### 作为 AI Agent 工具
1. 在 AI Agent 节点中
2. 添加工具时选择 "NapCat"
3. AI Agent 可以使用 NapCat 节点与 QQ 进行交互

### 功能特性

**当前支持的操作：**
- ✅ 发送私聊消息
- ✅ 发送群聊消息
- ✅ 撤回消息
- ✅ 获取群历史消息
- ✅ 获取好友历史消息
- ✅ 获取消息详情
- ✅ 发送戳一戳
- ✅ 贴表情

**消息类型支持：**
- 文本（Text）
- 图片（Image）
- 语音（Voice）
- 视频（Video）
- 系统表情（Face）
- JSON 卡片（JSON）
- 回复消息（Reply）
- 音乐卡片（Music）
- 自定义音乐卡片（Custom Music）
- 超级表情-骰子（Dice）
- 超级表情-猜拳（RPS）
- 合并转发（Forward）
- 文件（File）
- 自动检测（Auto Detect）

## 技术细节

### `usableAsTool` 属性

这是 n8n 节点描述中的一个特殊属性，用于标识节点是否可以作为 AI Agent 的工具使用。

**工作原理：**
1. 当 `usableAsTool: true` 时，节点会同时出现在：
   - 普通节点面板（用于常规工作流）
   - AI Agent 工具列表（用于 AI 交互）

2. AI Agent 可以根据节点描述自动调用节点功能

3. 节点的 `description` 和 `subtitle` 会被 AI Agent 读取，用于理解节点功能

### 与其他节点的对比

**Lark 节点（参考实现）：**
```typescript
export class Lark implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lark',
		name: 'lark',
		// ...
		usableAsTool: true,  // ← 第 44 行
		// ...
	};
}
```

**NapCat 节点（修改后）：**
```typescript
export class NapCat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NapCat',
		name: 'napCat',
		// ...
		usableAsTool: true,  // ← 第 91 行
		// ...
	};
}
```

## 注意事项

### 1. 向后兼容性
- ✅ 现有工作流完全兼容
- ✅ 节点功能保持不变
- ✅ 只是增加了工具节点能力

### 2. 更新步骤
如需更新节点：
```bash
# 拉取最新代码
git pull

# 重新构建
npm run build

# 重新安装到 n8n
```

### 3. 开发环境
开发时建议使用监听模式：
```bash
# 监听 TypeScript 文件变化
npm run dev

# 完整监听模式（包括图标）
npm run dev:full
```

### 4. 常见问题

**Q: 修改后节点不显示？**
A: 确保执行了 `npm run build` 并重启了 n8n

**Q: AI Agent 无法使用节点？**
A: 检查 `usableAsTool: true` 是否正确添加，位置应该在 `outputs` 之后

**Q: 构建失败？**
A: 确认删除所有旧文件，清理 `dist/` 目录后重新构建

## 相关文件

- 主节点文件：`nodes/NapCat/NapCat.node.ts`
- 配置文件：`package.json`
- 参考文件：`n8n/nodes/n8n-nodes-feishu-lark/nodes/Lark/Lark.node.ts`
- 构建脚本：`build.js`
- TypeScript 配置：`tsconfig.json`

## 后续改进建议

1. **扩展功能**
   - 添加更多账号相关操作
   - 添加更多群组管理功能
   - 添加文件上传功能

2. **优化代码**
   - 提取消息构建逻辑到独立模块
   - 添加更完善的错误处理
   - 添加单元测试

3. **文档完善**
   - 添加更多使用示例
   - 添加 API 文档链接
   - 添加常见问题解答

## 联系方式

如有问题或建议，请参考：
- GitHub Issues: [项目地址]
- 文档：`README.md`
- 中文文档：`README_CN.md`

---

**修改者：** AI Assistant  
**最后更新：** 2024年

