# 二级分类内容批量导入指南

> 把 AI 生成的分类内容批量导入 Sanity 的操作手册。
> 数据流：AI 生成内容 → `category.md` → 解析脚本 → 写入 Sanity。

## 〇、本指南性质（强制）

> 本文档是 **AI 助手执行分类导入任务时必须遵守的强制规范**，不是给普通用户看的说明。任何分类导入操作都不得违反本指南中的规则，尤其禁止重复发生以下历史错误：
>
> - 不先预览验证就把数据写入线上
> - 解析逻辑不对照官方数据结构（`sanity.types.ts` / category schema）就自行实现
> - 在 JS 正则中使用 `\z`（会被当作字面 `z`，导致内容截断）
> - 改动用户选定的一级分类（group）或分类名（name/slug）
>
> 每次导入必须按「三、导入步骤」执行，先 `preview` 再正式导入。

## 一、工作流总览

```
其他 AI 生成内容
      │  （用 category-content-prompt.md 提示词模板）
      ▼
category.md（数据源，手动维护）
      │  运行导入脚本
      ▼
category-import.json（解析结果，供检查）
      │  确认无误后
      ▼
Sanity 后台（category 文档）
```

## 二、category.md 格式约定

每个分类以一级标题开头，字段用 `## N. 字段名`（兼容 `###`/`####` 层级），多个分类之间用 `---` 分隔：

```markdown
# AI Code Generator
> group: AI Code        ← 可选，标注一级分类（当前脚本不处理 group）

## 1. description
一句话副标题

## 2. whatIs
2-3 句话段落

## 3. whatDoes
* 功能 1（每条一行，* 开头）
* 功能 2

## 4. whoUses
### Software Developers      ← 标题用 ###/####
描述文字

### Web Developers
描述文字

## 5. howItWorks
2-3 句话段落

## 6. faqs
### How accurate are AI Code Generators?    ← 问题用 ###/####
回答文字

---

# 下一个分类
……
```

**字段映射（对应 Sanity category 文档）：**

| md 字段 | Sanity 字段 | 类型 |
|---------|------------|------|
| 1. description | description | string |
| 2. whatIs | whatIs | string |
| 3. whatDoes | whatDoes | string[]（每行一条） |
| 4. whoUses | whoUses | { title, description }[] |
| 5. howItWorks | howItWorks | string |
| 6. faqs | faqs | { question, answer }[] |

## 三、导入步骤

### 1. 编辑 category.md
把 AI 生成的内容按上述格式填入（可用 [category-content-prompt.md](./category-content-prompt.md) 让 AI 生成）。

### 2. 预览解析结果（不写库）
```bash
./node_modules/.bin/tsx scripts/import-category-from-md.ts preview
```
- 只解析 category.md 并生成 `category-import.json`，**不会写入 Sanity**
- 检查终端输出的每个分类的 `whatDoes / whoUses / faqs` 数量是否与 md 一致
- 打开 `category-import.json` 抽查内容是否完整（无截断、无丢失）

### 3. 正式导入
```bash
./node_modules/.bin/tsx scripts/import-category-from-md.ts
```
- 按分类名（name）查找已有文档：
  - **已存在** → 只更新内容字段（description/whatIs/whatDoes/whoUses/howItWorks/faqs），**不动 name、slug、group**
  - **不存在** → 创建新文档，name 用一级标题，slug 自动生成
- 同名覆盖逻辑：**一级分类（group）永远不被脚本修改**，由你手动选择

## 四、强制规范（AI 必须遵守）

1. **先 preview 再导入**：每次导入前必跑 `preview` 验证 JSON，确认无误后才允许正式写入，严禁跳过预览直接写库。
2. **解析必须对照官方数据结构**：动手前先看 `sanity.types.ts` 的 `CategoryQueryResult` 与 `src/sanity/schemas/documents/directory/category.ts`，字段结构以官方定义为准。
3. **禁止用 `\z` 当字符串结尾**：JS 正则中 `\z` 会被当作字面字符 `z`，导致含 z 的单词被截断（历史教训）。字符串结尾一律用 `(?![\s\S])`。
4. **永不修改 group / name / slug**：同名分类只更新内容字段（description/whatIs/whatDoes/whoUses/howItWorks/faqs），一级分类（group）和分类名由用户掌控。
5. **md 格式必须规范**：
   - 分类标题必须是一级标题 `# 名称`（`##` 及更深层级不会被识别为分类）
   - 字段标记必须是 `N. 字段名`（如 `1. description`），前面的 `#` 数量不限
   - whoUses 和 faqs 内部小标题用 `###`/`####`，且不能是 `N. xxx` 形式
6. **运行环境**：若终端报 `sed: command not found` / `node: not found`，先执行：
   ```bash
   export PATH="/Users/admin/.nvm/versions/node/v24.13.1/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
   ```
   若 pnpm 触发依赖检查失败（`ERR_PNPM_IGNORED_BUILDS`），用 `./node_modules/.bin/tsx` 直接运行绕过。
7. `category-import.json` 是每次运行自动生成的中间产物，可随时删除或忽略。

## 五、文件清单

| 文件 | 作用 | 是否需要提交 |
|------|------|-------------|
| `category.md` | 数据源，手动维护 | 是 |
| `scripts/import-category-from-md.ts` | 解析 + 导入脚本 | 是 |
| `category-import.json` | 解析中间产物 | 否（可忽略） |
| `category-content-prompt.md` | 分类内容生成提示词模板 | 是 |
