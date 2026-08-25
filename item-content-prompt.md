# 工具详情页内容生成提示词

> 用途：发给其他 AI（ChatGPT / Claude / Gemini 等），为单个 AI 工具详情页生成后台内容。
> 使用前把 `{工具名}` 和 `{工具网址}` 替换成实际内容（如 `WaveSpeed`、`https://wavespeed.ai`）。

## 提示词模板

```
你是 AI 工具目录网站的资深内容编辑。请为 AI 工具「{工具名}」撰写详情页内容。网站面向寻找 AI 工具的普通用户和开发者，内容要求专业、可信、通俗易懂，全部用英文撰写，不要使用第一人称，不要虚构不存在的功能。

工具官网地址：{工具网址}

**请先打开上面的官网地址，基于网站上的真实信息撰写内容**（功能、定价、平台、语言、适用人群等均以官网为准）。如果官网信息不足以回答某个字段，基于对该类 AI 工具的行业认知合理补充，不要编造具体数字或不存在的事实。

请严格按照以下结构输出，每个字段之间用分隔线隔开：

**0. categories（分类推荐，最重要）**
基于这个工具的功能和定位，推荐它应归属的分类。输出两级：
- **group**（一级分类，1-3 个）：概括性的大类
- **category**（二级分类，1-4 个）：具体小类

一个工具可以属于 1 个或多个一级分类、1 个或多个二级分类，按实际情况判断，不要为了凑数硬加。请自行决定简洁的英文分类名称，并在每个分类后加一句推荐理由。

**1. description（一句话简介，60-100 字符）**
概括这个工具的核心功能和适用人群。

**2. planLabel（单选一个）**
从以下选项中选择最匹配的一个：Free / Freemium / Premium / Paid / Open Source

**3. platforms（多选，3-6 个）**
从以下选项中选择该工具支持的平台：Web / API / iOS / Android / Windows / macOS / Linux / Chrome Extension / Firefox Extension / Discord / Slack

**4. whatIs（2-3 句话段落）**
回答 "What is {工具名}?"，介绍这个工具是什么、核心用途、目标用户。

**5. coreFeatures（4-6 个核心功能，编号 01 开始）**
回答 "What can {工具名} do?"。每个功能包含：
- **title**（功能名称，如 Real-time Detection）
- **description**（1-2 句话，说明该功能的价值）

**6. useCases（3-4 个使用场景）**
每个包含：
- **title**（场景名称，如 Marketing Teams）
- **description**（1-2 句话，说明该场景下如何使用）

**7. quickFacts（快速事实表）**
输出三项：
- **domainRating**（该工具官网的域名权重估计值，格式如 DR 72）
- **platforms**（平台列表，逗号分隔，如 Web, API, iOS）
- **languages**（支持的语言，逗号分隔，如 English, German, Spanish）

**8. faqs（5 个问答）**
每个包含 question（简短问题）和 answer（3-4 句话的详细回答）。问题要覆盖：定价、免费额度、API 集成、准确率、隐私等常见疑问。

**9. alternatives（3-5 个替代工具）**
列出功能相近的真实存在的 AI 工具名称，每个用一行输出，不要虚构。

最后，把第 1-7 项汇总成一段表格形式的总结，方便我快速录入后台。
```

## 使用说明

- 把提示词里的 `{工具名}` 和 `{工具网址}` 替换成实际内容再发送
- 其他 AI 输出后，按字段分别粘贴到 Sanity 后台对应位置：

| 输出字段 | Sanity 后台字段 | 填写方式 |
|----------|----------------|----------|
| categories（group） | 在后台创建/关联一级分类 | 参考推荐去 Group 文档添加 |
| categories（category） | Categories | 参考推荐去 Category 文档添加关联 |
| description | Description | 直接粘贴 |
| planLabel | Plan Label | 单选 |
| platforms | Platforms | 多选 |
| whatIs | What is this tool? | 直接粘贴 |
| coreFeatures | Core Features | title → Title，description → Description |
| useCases | Use Cases | title → Title，description → Description |
| quickFacts | Quick Facts | domainRating → Domain Rating，platforms → Platforms，languages → Languages |
| faqs | FAQs | question → Question，answer → Answer |
| alternatives | Alternatives | 在后台搜索对应工具并关联（Add reference） |

## 页面渲染对应关系

| 页面区块 | 对应字段 |
|----------|----------|
| 名称旁徽章 | planLabel |
| 名称下平台徽章 | platforms |
| 头部简介 | description |
| What is {工具名}? 段落 | whatIs |
| What can {工具名} do? 编号卡片 | coreFeatures（每个 title + description） |
| Use Cases 引用块 | useCases（每个 title + description） |
| Quick Facts 表格行 | quickFacts（domainRating / platforms / languages） |
| FAQ 手风琴 | faqs |
| Alternatives 三列卡片 | alternatives（引用关联，需在后台手动搜索添加） |
