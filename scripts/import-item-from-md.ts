import { slugify } from "@/lib/utils";
import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
dotenv.config();

// make sure you have set the environment variables in .env file
const client = createClient({
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-08-01",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_TOKEN,
});

const MD_PATH = path.join(process.cwd(), "item.md");
const JSON_OUTPUT = path.join(process.cwd(), "item-import.json");

interface ParsedItem {
  name: string;
  link: string;
  categories: string[];
  description: string;
  planLabel: string;
  platforms: string[];
  whatIs: string;
  coreFeatures: { title: string; description: string }[];
  useCases: { title: string; description: string }[];
  quickFacts: { domainRating: string; platforms: string; languages: string };
  faqs: { question: string; answer: string }[];
}

/** 解析一个工具块内的字段（兼容 ## / ### / #### 层级，逐行扫描） */
function parseFieldBlocks(body: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const raw: Record<string, string[]> = {};
  let currentField: string | null = null;

  for (const line of body.split(/\r?\n/)) {
    // 字段标记行："N. fieldName"（如 "1. description"）
    const fieldMatch = line.match(/^#{2,4} (\d+)\. (\w+)\s*$/);
    if (fieldMatch) {
      currentField = fieldMatch[2];
      raw[currentField] = [];
      continue;
    }
    if (currentField) {
      raw[currentField].push(line);
    }
  }

  for (const [key, lines] of Object.entries(raw)) {
    // 去掉内容中的 --- 分隔线和多余空行
    fields[key] = lines
      .filter((line) => line.trim() !== "---")
      .join("\n")
      .trim();
  }
  return fields;
}

/** 解析 categories 字段：提取 **group** 和 **category** 子块下的 * 列表项名称 */
function parseCategories(content: string): string[] {
  const names: string[] = [];
  // 只取 **category** 子块（item 文档只引用 category，不引用 group）
  const categoryBlock = content.match(/\*\*category\*\*([\s\S]*?)(?=\r?\n\s*\*\*|(?![\s\S]))/);
  if (categoryBlock) {
    for (const line of categoryBlock[1].split(/\r?\n/)) {
      // 格式："* **Machine Translation** — DeepL's primary use..."
      const m = line.match(/^\*\s+\*\*(.+?)\*\*\s*(?:—|-)?\s*(.*)$/);
      if (m && m[1].trim()) names.push(m[1].trim());
    }
  }
  return names;
}

/** 解析 "**value**" 粗体内容（planLabel / platforms 用） */
function parseBoldValue(content: string): string {
  const m = content.match(/\*\*(.+?)\*\*/);
  return m ? m[1].trim() : "";
}

/** 解析 "**a, b, c**" 逗号分隔列表（platforms 用） */
function parseCommaList(content: string): string[] {
  return parseBoldValue(content)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 解析 "**01. Title**\n描述" 编号分组（coreFeatures 用） */
function parseNumberedGroups(content: string): { title: string; description: string }[] {
  const groups: { title: string; description: string }[] = [];
  // 注意：JS 正则中 \z 会被当作字面 "z"，字符串结尾必须用 (?![\s\S])
  const groupRegex = /^\*\*\s*(\d+\.\s*.+?)\s*\*\*[ \t]*\r?\n([\s\S]*?)(?=^\*\*\s*\d+\.\s|\r?\n\s*\*\*\s*\d+\.\s|(?![\s\S]))/gm;
  let m: RegExpExecArray | null;
  while ((m = groupRegex.exec(content)) !== null) {
    groups.push({
      title: m[1].trim(),
      description: m[2].trim(),
    });
  }
  return groups;
}

/** 解析 "**Title**\n描述" 普通分组（useCases 用） */
function parsePlainGroups(content: string): { title: string; description: string }[] {
  const groups: { title: string; description: string }[] = [];
  const groupRegex = /^\*\*\s*([^*]+?)\s*\*\*[ \t]*\r?\n([\s\S]*?)(?=^\*\*\s*[^*]+\s*\*\*|\r?\n\s*\*\*\s*[^*]|(?![\s\S]))/gm;
  let m: RegExpExecArray | null;
  while ((m = groupRegex.exec(content)) !== null) {
    const title = m[1].trim();
    if (title.startsWith("question:") || title.startsWith("answer:")) continue;
    groups.push({
      title,
      description: m[2].trim(),
    });
  }
  return groups;
}

/** 解析 quickFacts：**key:** value 行 */
function parseQuickFacts(content: string): { domainRating: string; platforms: string; languages: string } {
  const get = (key: string): string => {
    // 注意：值后紧跟下一个 "**word:**"，用行内空格 [ \t]* 避免 \s* 贪婪吃掉换行导致值为空
    const regex = new RegExp(`\\*\\*${key}:\\*\\*[ \\t]*([\\s\\S]*?)(?=\\r?\\n\\s*\\*\\*[a-zA-Z]+:|(?![\\s\\S]))`, "m");
    const m = content.match(regex);
    return m ? m[1].trim() : "";
  };
  return {
    domainRating: get("domainRating"),
    platforms: get("platforms"),
    languages: get("languages"),
  };
}

/** 解析 faqs：**question:** Q + **answer:** A 配对 */
function parseFaqs(content: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const faqRegex = /^\*\*question:\*\*\s*([\s\S]*?)^\*\*answer:\*\*\s*([\s\S]*?)(?=^\*\*question:\*\*|(?![\s\S]))/gm;
  let m: RegExpExecArray | null;
  while ((m = faqRegex.exec(content)) !== null) {
    faqs.push({
      question: m[1].trim(),
      answer: m[2].trim(),
    });
  }
  return faqs;
}

/** 解析头部 "**link:** [url](url)" 行，提取 URL */
function parseLink(body: string): string {
  const m = body.match(/\*\*link:\*\*[\s\S]*?(https?:\/\/[^\s)\]"']+)/);
  return m ? m[1].trim() : "";
}

/** 解析单个工具 */
function parseItem(name: string, body: string): ParsedItem {
  const fields = parseFieldBlocks(body);

  return {
    name,
    link: parseLink(body),
    categories: parseCategories(fields.categories ?? ""),
    description: fields.description ?? "",
    planLabel: parseBoldValue(fields.planLabel ?? ""),
    platforms: parseCommaList(fields.platforms ?? ""),
    whatIs: fields.whatIs ?? "",
    coreFeatures: parseNumberedGroups(fields.coreFeatures ?? ""),
    useCases: parsePlainGroups(fields.useCases ?? ""),
    quickFacts: parseQuickFacts(fields.quickFacts ?? ""),
    faqs: parseFaqs(fields.faqs ?? ""),
  };
}

async function main() {
  const md = fs.readFileSync(MD_PATH, "utf-8");

  // 按一级标题 "# xxx" 拆分（"## xxx" 及更深层级不匹配）
  const parts = md.split(/^# (.+?)[ \t]*\r?\n/m).slice(1);
  const items: ParsedItem[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const name = parts[i].trim();
    const body = parts[i + 1];
    if (!name) continue;
    items.push(parseItem(name, body));
  }

  console.log(`Parsed ${items.length} items:`);
  for (const it of items) {
    console.log(
      `  - ${it.name} (categories: ${it.categories.length}, coreFeatures: ${it.coreFeatures.length}, useCases: ${it.useCases.length}, faqs: ${it.faqs.length})`,
    );
  }

  // 输出 JSON 中间文件供检查
  fs.writeFileSync(JSON_OUTPUT, JSON.stringify(items, null, 2), "utf-8");
  console.log(`JSON saved to ${JSON_OUTPUT}`);

  // dry-run：只解析生成 JSON，不写入 Sanity
  if (process.argv.includes("preview")) {
    console.log("[preview] 仅解析完成，未写入 Sanity。确认 JSON 无误后运行正式导入。");
    return;
  }

  // 导入 Sanity：同名更新内容字段（不动 name/slug/status/sponsor 等），不存在则创建
  for (const item of items) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "item" && name == $name][0] { _id }`,
      { name: item.name },
    );

    // categories 引用：按名称查找 category 文档 _id，找不到则跳过并提示（数组项必须带 _key）
    const foundCats: { _id: string }[] = [];
    for (const catName of item.categories) {
      const cat = await client.fetch<{ _id: string } | null>(
        `*[_type == "category" && name == $name][0] { _id }`,
        { name: catName },
      );
      if (cat) {
        foundCats.push(cat);
      } else {
        console.warn(`[warn] category not found, skipped: ${catName} (for ${item.name})`);
      }
    }
    const categoryRefs: { _type: "reference"; _ref: string; _key: string }[] =
      foundCats.map((cat, index) => ({
        _type: "reference",
        _ref: cat._id,
        _key: index.toString(),
      }));

    // planLabel 作为 tag 导入：查找或创建 tag 文档（按 name），再引用到 item.tags
    const tagRefs: { _type: "reference"; _ref: string; _key: string }[] = [];
    if (item.planLabel) {
      const existingTag = await client.fetch<{ _id: string } | null>(
        `*[_type == "tag" && name == $name][0] { _id }`,
        { name: item.planLabel },
      );
      let tagId = existingTag?._id;
      if (!tagId) {
        const createdTag = await client.create({
          _type: "tag",
          name: item.planLabel,
          slug: { _type: "slug", current: slugify(item.planLabel) },
        });
        tagId = createdTag._id;
        console.log(`[tag created] ${item.planLabel}`);
      }
      tagRefs.push({ _type: "reference", _ref: tagId, _key: "0" });
    }

    // 项目标准写法：_key 只需在数组内唯一，用 index 作为 _key（参照 src/actions/edit.ts）
    const contentFields = {
      link: item.link || null,
      description: item.description || null,
      categories: categoryRefs,
      tags: tagRefs,
      planLabel: item.planLabel || null,
      platforms: item.platforms,
      whatIs: item.whatIs || null,
      coreFeatures: item.coreFeatures.map((f, index) => ({
        _key: index.toString(),
        ...f,
      })),
      useCases: item.useCases.map((u, index) => ({
        _key: index.toString(),
        ...u,
      })),
      quickFacts: {
        domainRating: item.quickFacts.domainRating || null,
        platforms: item.quickFacts.platforms || null,
        languages: item.quickFacts.languages || null,
      },
      faqs: item.faqs.map((f, index) => ({
        _key: index.toString(),
        ...f,
      })),
      // 基础字段：缺失会导致 Studio preview 崩溃（pricePlan.toUpperCase() 报错），并让工具发布上线
      pricePlan: "free",
      freePlanStatus: "approved",
      paid: false,
      publishDate: new Date().toISOString(),
    };

    if (existing) {
      await client
        .patch(existing._id)
        .set(contentFields)
        .commit();
      console.log(`[updated] ${item.name}`);
    } else {
      await client.create({
        _type: "item",
        name: item.name,
        slug: { _type: "slug", current: slugify(item.name) },
        ...contentFields,
      });
      console.log(`[created] ${item.name}`);
    }
  }

  console.log("Import finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
