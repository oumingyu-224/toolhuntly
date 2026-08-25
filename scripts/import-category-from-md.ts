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

const MD_PATH = path.join(process.cwd(), "category.md");
const JSON_OUTPUT = path.join(process.cwd(), "category-import.json");

interface ParsedCategory {
  name: string;
  description: string;
  whatIs: string;
  whatDoes: string[];
  whoUses: { title: string; description: string }[];
  howItWorks: string;
  faqs: { question: string; answer: string }[];
}

/** 解析一个分类块内的字段（兼容 ## / ### / #### 层级，逐行扫描） */
function parseFieldBlocks(body: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const raw: Record<string, string[]> = {};
  let currentField: string | null = null;

  for (const line of body.split(/\r?\n/)) {
    // 字段标记行："N. fieldName"（如 "1. description"），兼容 ##/###/#### 层级
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

/** 解析 "* item" 列表 */
function parseList(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.replace(/^\*\s+/, "").trim())
    .filter(Boolean);
}

/** 解析 "### Title\n\nBody" 分组（whoUses / faqs 用，兼容 #### 层级） */
function parseGroups(
  content: string,
  keyMap: { title: string; body: string },
): Array<Record<string, string>> {
  const groups: Array<Record<string, string>> = [];
  // 注意：JS 正则中 \z 会被当作字面 "z"，字符串结尾必须用 (?![\s\S])
  const groupRegex = /^#{3,4} (.+?)[ \t]*\r?\n([\s\S]*?)(?=^#{3,4} |(?![\s\S]))/gm;
  let m: RegExpExecArray | null;
  while ((m = groupRegex.exec(content)) !== null) {
    groups.push({
      [keyMap.title]: m[1].trim(),
      [keyMap.body]: m[2].trim(),
    });
  }
  return groups;
}

/** 解析单个分类 */
function parseCategory(name: string, body: string): ParsedCategory {
  const fields = parseFieldBlocks(body);

  const whatDoes = fields.whatDoes ? parseList(fields.whatDoes) : [];
  const whoUses = fields.whoUses
    ? (parseGroups(fields.whoUses, { title: "title", body: "description" }) as ParsedCategory["whoUses"])
    : [];
  const faqs = fields.faqs
    ? (parseGroups(fields.faqs, { title: "question", body: "answer" }) as ParsedCategory["faqs"])
    : [];

  return {
    name,
    description: fields.description ?? "",
    whatIs: fields.whatIs ?? "",
    whatDoes,
    whoUses,
    howItWorks: fields.howItWorks ?? "",
    faqs,
  };
}

async function main() {
  const md = fs.readFileSync(MD_PATH, "utf-8");

  // 按一级标题 "# xxx" 拆分（"## xxx" 及更深层级不匹配）
  const parts = md.split(/^# (.+?)[ \t]*\r?\n/m).slice(1);
  const categories: ParsedCategory[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const name = parts[i].trim();
    const body = parts[i + 1];
    if (!name) continue;
    categories.push(parseCategory(name, body));
  }

  console.log(`Parsed ${categories.length} categories:`);
  for (const c of categories) {
    console.log(
      `  - ${c.name} (whatDoes: ${c.whatDoes.length}, whoUses: ${c.whoUses.length}, faqs: ${c.faqs.length})`,
    );
  }

  // 输出 JSON 中间文件供检查
  fs.writeFileSync(JSON_OUTPUT, JSON.stringify(categories, null, 2), "utf-8");
  console.log(`JSON saved to ${JSON_OUTPUT}`);

  // dry-run：只解析生成 JSON，不写入 Sanity
  if (process.argv.includes("preview")) {
    console.log("[preview] 仅解析完成，未写入 Sanity。确认 JSON 无误后运行：pnpm tsx scripts/import-category-from-md.ts");
    return;
  }

  // dry-run：只解析生成 JSON，不写入 Sanity
  if (process.argv.includes("preview")) {
    console.log("[preview] 仅解析完成，未写入 Sanity。确认 JSON 无误后运行：pnpm tsx scripts/import-category-from-md.ts");
    return;
  }

  // 导入 Sanity：同名更新内容字段（不动 group/name/slug），不存在则创建
  for (const cat of categories) {
    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "category" && name == $name][0] { _id }`,
      { name: cat.name },
    );

    // 项目标准写法：_key 只需在数组内唯一，用 index 作为 _key（参照 src/actions/edit.ts）
    const contentFields = {
      description: cat.description || null,
      whatIs: cat.whatIs || null,
      whatDoes: cat.whatDoes,
      whoUses: cat.whoUses.map((item, index) => ({
        _key: index.toString(),
        ...item,
      })),
      howItWorks: cat.howItWorks || null,
      faqs: cat.faqs.map((item, index) => ({
        _key: index.toString(),
        ...item,
      })),
    };

    if (existing) {
      await client
        .patch(existing._id)
        .set(contentFields)
        .commit();
      console.log(`[updated] ${cat.name}`);
    } else {
      await client.create({
        _type: "category",
        name: cat.name,
        slug: { _type: "slug", current: slugify(cat.name) },
        ...contentFields,
      });
      console.log(`[created] ${cat.name}`);
    }
  }

  console.log("Import finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
