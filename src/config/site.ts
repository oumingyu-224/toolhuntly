import type { SiteConfig } from "@/types";

/**
 * NOTE: NEXT_PUBLIC_APP_URL is honored when provided (e.g. for preview
 * deployments), but the ToolHuntly production site is always anchored to
 * `https://www.toolhuntly.com`, so we fall back to it when the env is missing /
 * empty instead of letting downstream callers crash with `new URL("")`.
 */
/**
 * 站点 URL 统一使用 www 主域（非 www 会被 301，避免每个落点多跟一次跳转）：
 * - 生产固定为 https://www.toolhuntly.com（NEXT_PUBLIC_APP_URL 缺失/为空时回退到它）
 * - 显式传入的 toolhuntly.com（无 www）也规范化为 www
 * - Preview 部署的域名（非 toolhuntly.com）保持原样
 */
function normalizeSiteUrl(raw: string | undefined): string {
  if (!raw || raw.trim() === "") {
    return "https://www.toolhuntly.com";
  }
  try {
    const u = new URL(raw.trim().replace(/\/+$/, ""));
    if (u.hostname === "toolhuntly.com") {
      return "https://www.toolhuntly.com";
    }
    return u.origin;
  } catch {
    return "https://www.toolhuntly.com";
  }
}

const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL);

export const siteConfig: SiteConfig = {
  name: "ToolHuntly",
  tagline: "Best AI Tools Directory & Alternatives",
  description:
    "Discover the best AI tools — curated daily. Browse AI for writing, image, video, coding & more on ToolHuntly.",
  keywords: [
    "AI tools",
    "AI directory",
    "AI alternatives",
    "AI writing",
    "AI image",
    "AI video",
    "AI coding",
    "ToolHuntly",
  ],
  author: "ToolHuntly",
  url: SITE_URL,
  logo: "/logo.png",
  // set the logoDark if you have put the logo-dark.png in the public folder
  // logoDark: "/logo-dark.png",
  // please increase the version number when you update the image
  image: `${SITE_URL}/og.png?v=1`,
  mail: "support@toolhuntly.com",
  utm: {
    source: "toolhuntly.com",
    medium: "referral",
    campaign: "navigation",
  },
  links: {
    // leave it blank if you don't want to show the link (don't delete)
    twitter: "",
    github: "",
    youtube: "",
  },
};
