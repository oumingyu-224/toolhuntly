# 二级分类详情页内容生成提示词

> 用途：发给其他 AI（ChatGPT / Claude / Gemini 等），为二级分类页面生成后台内容。
> 使用前把 `{分类名}` 替换成实际分类名（如 AI Detector、AI Video Editor）。

## 提示词模板

```
你是 AI 工具目录网站的资深内容编辑。请为「{分类名}」这一类 AI 工具撰写分类详情页内容。网站面向寻找 AI 工具的普通用户和开发者，内容要求专业、可信、通俗易懂，全部用英文撰写，不要使用第一人称，不要推销任何具体产品。

请严格按照以下结构输出，每个字段之间用分隔线隔开：

**1. description（一句话副标题，60-100 字符）**
概括这一类工具能帮用户解决什么问题。例如：`Compare {分类名} for accuracy, features, pricing and API access.`

**2. whatIs（2-3 句话段落）**
回答 "What is {分类名}?"，解释这一类工具是什么、核心用途是什么。

**3. whatDoes（6-8 条核心功能清单，每条不超过 15 个词）**
回答 "Core features to look for"，即挑选该类工具时应关注的核心功能点。用无序列表输出，每条以动词开头。例如：`- Detect AI-generated text with high accuracy`。

**4. whoUses（4 组使用人群卡片）**
回答 "Who uses {分类名}, and how"。输出 4 组，每组包含：
- **title**（人群名称，如 Content Marketers、Educators、Recruiters、SEO Specialists）
- **description**（2-3 句话，说明这群人如何使用该类工具）

**5. howItWorks（2-3 句话段落）**
回答 "How does {分类名} work?"，用通俗的语言解释这类工具的工作原理。

**6. faqs（5 个问答）**
每个包含 question（简短问题）和 answer（3-4 句话的详细回答）。问题要覆盖：准确性、免费/付费、隐私、使用场景、与替代工具的区别等常见疑问。

最后，把第 1-5 项汇总成一段表格形式的总结，方便我快速录入后台。
```

## 使用说明

- 把提示词里的 `{分类名}` 替换成实际分类名再发送
- 其他 AI 输出后，按字段分别粘贴到 Sanity 后台对应位置：

| 输出字段 | Sanity 后台字段 | 填写方式 |
|----------|----------------|----------|
| description | Description | 直接粘贴 |
| whatIs | What is | 直接粘贴 |
| whatDoes | Core features | 每条加一行 |
| whoUses | Who uses it | title → Title，description → Description |
| howItWorks | How it works | 直接粘贴 |
| faqs | FAQs | question → Question，answer → Answer |

## 页面渲染对应关系

| 页面区块 | 对应字段 |
|----------|----------|
| H1 下方副标题描述 | description |
| What is {分类名}? 段落 | whatIs |
| Core features 绿色对勾清单 | whatDoes（每条一项） |
| Who uses 编号卡片（01-04） | whoUses（每个 title + description） |
| How does it work? 段落 | howItWorks |
| FAQ 手风琴 | faqs |
