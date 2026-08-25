# 工具详情页内容批量导入指南

> 把 AI 生成的工具内容批量导入 Sanity 的操作手册。
> 数据流：AI 生成内容 → `item.md` → 解析脚本 → 写入 Sanity。
> 生成内容用 [item-content-prompt.md](./item-content-prompt.md) 提示词模板。

## 〇、本指南性质（强制）

> 本文档是 **AI 助手执行工具导入任务时必须遵守的强制规范**，不是给普通用户看的说明。任何工具导入操作都不得违反本指南中的规则，尤其禁止重复发生以下历史错误：
>
> - 不先预览验证就把数据写入线上
> - 解析逻辑不对照官方数据结构（`sanity.types.ts` / item schema）就自行实现
> - 在 JS 正则中使用 `\z`（会被当作字面 `z`，导致内容截断）
> - **在 `new RegExp` 模板字符串中写单反斜杠 `[\s\S]`**（JS 字符串会丢弃非法转义的反斜杠，`[\s\S]` 变成 `[sS]`，导致正则失效、解析为空，必须写 `[\\s\\S]`）
> - **不检查 node 代理配置就直接运行导入，导致 Sanity API 请求挂起半小时**（根因：node 默认不走系统代理）
> - 改动工具名（name/slug）或状态/赞助相关字段
>
> 每次导入必须按「三、导入步骤」执行，先 `preview` 再正式导入；涉及 Sanity API 的命令一律用 `node --use-env-proxy` 运行（见「三·五、环境与网络检查」）。

## 一、工作流总览

```
其他 AI 生成内容
      │  （用 item-content-prompt.md 提示词模板）
      ▼
item.md（数据源，手动维护）
      │  运行导入脚本
      ▼
item-import.json（解析结果，供检查）
      │  确认无误后
      ▼
Sanity 后台（item 文档）
```

## 二、item.md 格式约定

每个工具以一级标题开头，字段用 `## N. 字段名`，多个工具之间用 `---` 分隔：

```markdown
# DeepL

## 0. categories
**group**
* **AI Translation** — 理由          ← 一级分类（仅参考，脚本不写入 item）

**category**
* **Machine Translation** — 理由     ← 二级分类（脚本按名称查 category 引用）

## 1. description
一句话简介

## 2. planLabel
**Freemium**                        ← 必须是：Free / Freemium / Premium / Paid / Open Source

## 3. platforms
**Web, API, iOS, Android, Windows, macOS**   ← 逗号分隔

## 4. whatIs
2-3 句话段落

## 5. coreFeatures
**01. 功能名**                      ← 编号 + 标题
功能描述

**02. 功能名**
功能描述

## 6. useCases
**场景名**                          ← 无编号
场景描述

## 7. quickFacts
**domainRating:** DR 92 (estimated)
**platforms:** Web, API, iOS
**languages:** English, German

## 8. faqs
**question:** 问题
**answer:** 回答

---

# 下一个工具
……
```

**字段映射（对应 Sanity item 文档，见 `src/sanity/schemas/documents/directory/item.ts`）：**

| md 字段 | Sanity 字段 | 类型 |
|---------|------------|------|
| 0. categories（category 子块） | categories | reference[]（按名称查 category 文档 _id） |
| 1. description | description | string |
| 2. planLabel | planLabel | string（单选枚举） |
| 3. platforms | platforms | string[]（逗号拆分） |
| 4. whatIs | whatIs | string |
| 5. coreFeatures | coreFeatures | { title, description }[]（标题保留 "01. " 编号） |
| 6. useCases | useCases | { title, description }[] |
| 7. quickFacts | quickFacts | { domainRating, platforms, languages } |
| 8. faqs | faqs | { question, answer }[] |

> **数组 _key 说明**：脚本写入 `coreFeatures` / `useCases` / `faqs` 时会给每个数组项自动加 `_key`（用 index 字符串，参照项目标准 `src/actions/edit.ts`），无需在 md 里写。
>
> **categories 引用说明**：脚本按名称查找后台 category 文档 `_id`，**找不到的分类会被跳过并输出 `[warn]`，不影响工具创建**。若要关联，需先在后台创建对应二级分类（可用 category-import-guide.md 流程）。

## 三、导入步骤

### 1. 编辑 item.md
把 AI 生成的内容按上述格式填入（用 [item-content-prompt.md](./item-content-prompt.md) 让 AI 生成）。

### 2. 预览解析结果（不写库）
```bash
node --use-env-proxy ./node_modules/.bin/../tsx/dist/cli.mjs scripts/import-item-from-md.ts preview
```
- 只解析 item.md 并生成 `item-import.json`，**不会写入 Sanity**
- 检查终端输出的每个工具的 `categories / coreFeatures / useCases / faqs` 数量是否与 md 一致
- 打开 `item-import.json` 抽查内容是否完整（尤其 `quickFacts` 三个值不能为空、`whatIs` 多段是否保留、`coreFeatures` 标题是否保留编号）

### 3. 正式导入
```bash
node --use-env-proxy ./node_modules/.bin/../tsx/dist/cli.mjs scripts/import-item-from-md.ts
```
- 按工具名（name）查找已有文档：
  - **已存在** → 只更新内容字段（description/categories/planLabel/platforms/whatIs/coreFeatures/useCases/quickFacts/faqs），**不动 name、slug、link、status、sponsor 等字段**
  - **不存在** → 创建新文档，name 用一级标题，slug 自动生成
- `[warn] category not found` 只表示该分类引用未关联，工具本身照常创建

### 三·五、环境与网络检查（必做，防止请求挂起）

> 本节是历史踩坑的核心教训。**凡涉及 Sanity API 的请求，都必须用 `node --use-env-proxy` 运行**，否则会挂起卡死。

**现象（历史发生过的）**：正式导入命令运行后，解析部分正常输出，但一到 Sanity API 请求就卡住不动，半小时无结果；重复运行会产生多个僵尸进程。

**根因**：本机设置了系统代理（环境变量 `HTTPS_PROXY` / `HTTP_PROXY`）。curl 会自动走代理，能连通 Sanity API；但 **node 默认不走环境变量代理**，直连 Sanity API 被卡导致请求无限挂起。

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
   node --use-env-proxy -e "require('dotenv').config(); const { createClient } = require('@sanity/client'); const client = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, apiVersion: '2024-08-01', useCdn: false, token: process.env.SANITY_API_TOKEN }); const t = setTimeout(() => { console.error('TIMEOUT'); process.exit(2); }, 15000); client.fetch('count(*[_type == \"item\"])').then((c) => { clearTimeout(t); console.log('SUCCESS, item count:', c); process.exit(0); }).catch((e) => { clearTimeout(t); console.error('ERROR:', e.message); process.exit(1); });"
   ```
   - `SUCCESS` → 代理配置正常，可继续导入
   - `TIMEOUT` → 代理仍不可用，**停止**，检查代理软件是否运行
   - `ERROR` → token/权限问题，检查 `.env` 的 `SANITY_API_TOKEN`

4. 全部通过后，按「三、导入步骤」执行 preview → 正式导入。

## 四、强制规范（AI 必须遵守）

1. **先 preview 再导入**：每次导入前必跑 `preview` 验证 JSON，确认无误后才允许正式写入，严禁跳过预览直接写库。
2. **所有 Sanity API 命令必须带 `--use-env-proxy`**：一律用 `node --use-env-proxy ./node_modules/.bin/../tsx/dist/cli.mjs ...` 运行，严禁用裸 `./node_modules/.bin/tsx`（node 默认不走代理会挂起）。见「三·五」。
3. **解析必须对照官方数据结构**：动手前先看 `sanity.types.ts` 的 `Item` / `ItemQueryResult` 与 `src/sanity/schemas/documents/directory/item.ts`，字段结构以官方定义为准。
4. **禁止用 `\z` 当字符串结尾**：字符串结尾一律用 `(?![\s\S])`。
5. **`new RegExp` 模板字符串必须用双反斜杠**：字符串里 `[\s\S]` 必须写成 `[\\s\\S]`，否则 JS 会丢弃反斜杠变成 `[sS]`，正则失效（历史教训：quickFacts 全部解析为空）。
6. **永不修改 name / slug / status / sponsor 字段**：同名工具只更新内容字段，工具名、链接、状态（pricePlan/freePlanStatus 等）、赞助字段由用户掌控。
7. **md 格式必须规范**：
   - 工具标题必须是一级标题 `# 名称`（`##` 及更深层级不会被识别为工具）
   - 字段标记必须是 `N. 字段名`（如 `1. description`），前面的 `#` 数量不限
   - `planLabel` 必须是枚举值之一：Free / Freemium / Premium / Paid / Open Source
   - `platforms` 用逗号分隔
   - coreFeatures 标题必须带编号（`**01. 标题**`），useCases 不带编号，faqs 用 `**question:**` / `**answer:**` 配对
8. **运行环境**：若终端报 `sed: command not found` / `node: not found`，先执行：
   ```bash
   export PATH="/Users/admin/.nvm/versions/node/v24.13.1/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
   ```
   若 pnpm 触发依赖检查失败（`ERR_PNPM_IGNORED_BUILDS`），用 `node --use-env-proxy ./node_modules/.bin/../tsx/dist/cli.mjs` 直接运行绕过。
9. `item-import.json` 是每次运行自动生成的中间产物，可随时删除或忽略。
10. **僵尸进程处理**：若发现导入进程卡住（长时间无输出），立即用 `pkill -f "import-item-from-md.ts"` 清掉所有相关进程，再按「三·五」检查代理后重试。

## 五、文件清单

| 文件 | 作用 | 是否需要提交 |
|------|------|-------------|
| `item.md` | 数据源，手动维护 | 是 |
| `scripts/import-item-from-md.ts` | 解析 + 导入脚本 | 是 |
| `item-import.json` | 解析中间产物 | 否（可忽略） |
| `item-content-prompt.md` | 工具内容生成提示词模板 | 是 |
