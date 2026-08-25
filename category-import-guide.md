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
> - **不检查 node 代理配置就直接运行导入，导致 Sanity API 请求挂起半小时**（历史教训：preview 正常、正式导入一请求就卡死，根因是 node 默认不走系统代理）
>
> 每次导入必须按「三、导入步骤」执行，先 `preview` 再正式导入；涉及 Sanity API 的命令一律用 `node --use-env-proxy` 运行（见「三·五、环境与网络检查」）。

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

> **数组 _key 说明**：脚本写入 `whoUses` / `faqs` 时会给每个数组项自动加 `_key`（用 index 字符串，参照项目标准 `src/actions/edit.ts`），无需在 md 里写。没有 `_key` 会导致 Sanity Studio 报「Missing keys」无法编辑（历史教训）。

## 三、导入步骤

### 1. 编辑 category.md
把 AI 生成的内容按上述格式填入（可用 [category-content-prompt.md](./category-content-prompt.md) 让 AI 生成）。

### 2. 预览解析结果（不写库）
```bash
node --use-env-proxy ./node_modules/.bin/../tsx/dist/cli.mjs scripts/import-category-from-md.ts preview
```
- 只解析 category.md 并生成 `category-import.json`，**不会写入 Sanity**
- 检查终端输出的每个分类的 `whatDoes / whoUses / faqs` 数量是否与 md 一致
- 打开 `category-import.json` 抽查内容是否完整（无截断、无丢失）

### 3. 正式导入
```bash
node --use-env-proxy ./node_modules/.bin/../tsx/dist/cli.mjs scripts/import-category-from-md.ts
```
- 按分类名（name）查找已有文档：
  - **已存在** → 只更新内容字段（description/whatIs/whatDoes/whoUses/howItWorks/faqs），**不动 name、slug、group**
  - **不存在** → 创建新文档，name 用一级标题，slug 自动生成
- 同名覆盖逻辑：**一级分类（group）永远不被脚本修改**，由你手动选择

### 3·五、环境与网络检查（必做，防止请求挂起）

> 本节是历史踩坑的核心教训。**凡涉及 Sanity API 的请求，都必须用 `node --use-env-proxy` 运行**，否则会挂起卡死。

**现象（历史发生过的）**：正式导入命令运行后，解析部分正常输出，但一到 Sanity API 请求（创建/更新）就卡住不动，半小时无结果；重复运行会产生多个僵尸进程。

**根因**：本机设置了系统代理（环境变量 `HTTPS_PROXY` / `HTTP_PROXY`，如 `http://127.0.0.1:7897`）。curl 等工具会自动走代理，能连通 Sanity API；但 **node 默认不走环境变量代理**，会直连 Sanity API，直连被卡导致请求无限挂起。

**验证步骤（按顺序执行）：**

1. 确认存在代理环境变量：
   ```bash
   env | grep -iE "proxy|no_proxy"
   ```

2. 确认网络能通（curl 走代理，应返回 `HTTP_CODE:200`）：
   ```bash
   curl -m 10 -sS -o /dev/null -w "HTTP_CODE:%{http_code}\n" https://api.sanity.io/
   ```

3. 确认 node 走代理能通（最小请求，应立即输出 `SUCCESS`，不要等 15 秒超时）：
   ```bash
   node --use-env-proxy -e "require('dotenv').config(); const { createClient } = require('@sanity/client'); const client = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, apiVersion: '2024-08-01', useCdn: false, token: process.env.SANITY_API_TOKEN }); const t = setTimeout(() => { console.error('TIMEOUT'); process.exit(2); }, 15000); client.fetch('count(*[_type == \"category\"])').then((c) => { clearTimeout(t); console.log('SUCCESS, category count:', c); process.exit(0); }).catch((e) => { clearTimeout(t); console.error('ERROR:', e.message); process.exit(1); });"
   ```
   - `SUCCESS` → 代理配置正常，可继续导入
   - `TIMEOUT` → 代理仍不可用，**停止**，检查代理软件是否运行
   - `ERROR` → token/权限问题，检查 `.env` 的 `SANITY_API_TOKEN`

4. 全部通过后，按「三、导入步骤」执行 preview → 正式导入。

## 四、强制规范（AI 必须遵守）

1. **先 preview 再导入**：每次导入前必跑 `preview` 验证 JSON，确认无误后才允许正式写入，严禁跳过预览直接写库。
2. **所有 Sanity API 命令必须带 `--use-env-proxy`**：一律用 `node --use-env-proxy ./node_modules/.bin/../tsx/dist/cli.mjs ...` 运行，严禁用裸 `./node_modules/.bin/tsx`（node 默认不走代理会挂起）。见「三·五」。
3. **解析必须对照官方数据结构**：动手前先看 `sanity.types.ts` 的 `CategoryQueryResult` 与 `src/sanity/schemas/documents/directory/category.ts`，字段结构以官方定义为准。
4. **禁止用 `\z` 当字符串结尾**：JS 正则中 `\z` 会被当作字面字符 `z`，导致含 z 的单词被截断（历史教训）。字符串结尾一律用 `(?![\s\S])`。
5. **永不修改 group / name / slug**：同名分类只更新内容字段（description/whatIs/whatDoes/whoUses/howItWorks/faqs），一级分类（group）和分类名由用户掌控。
6. **md 格式必须规范**：
   - 分类标题必须是一级标题 `# 名称`（`##` 及更深层级不会被识别为分类）
   - 字段标记必须是 `N. 字段名`（如 `1. description`），前面的 `#` 数量不限
   - whoUses 和 faqs 内部小标题用 `###`/`####`，且不能是 `N. xxx` 形式
7. **运行环境**：若终端报 `sed: command not found` / `node: not found`，先执行：
   ```bash
   export PATH="/Users/admin/.nvm/versions/node/v24.13.1/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
   ```
   若 pnpm 触发依赖检查失败（`ERR_PNPM_IGNORED_BUILDS`），用 `node --use-env-proxy ./node_modules/.bin/../tsx/dist/cli.mjs` 直接运行绕过。
8. `category-import.json` 是每次运行自动生成的中间产物，可随时删除或忽略。
9. **僵尸进程处理**：若发现导入进程卡住（长时间无输出），立即用 `pkill -f "import-category-from-md.ts"` 清掉所有相关进程，再按「三·五」检查代理后重试。

## 五、文件清单

| 文件 | 作用 | 是否需要提交 |
|------|------|-------------|
| `category.md` | 数据源，手动维护 | 是 |
| `scripts/import-category-from-md.ts` | 解析 + 导入脚本 | 是 |
| `category-import.json` | 解析中间产物 | 否（可忽略） |
| `category-content-prompt.md` | 分类内容生成提示词模板 | 是 |
