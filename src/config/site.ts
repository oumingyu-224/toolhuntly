import type { SiteConfig } from "@/types";

/**
 * NOTE: NEXT_PUBLIC_APP_URL is honored when provided (e.g. for preview
 * deployments), but the ToolHuntly production site is always anchored to
 * `https://toolhuntly.com`, so we fall back to it when the env is missing /
 * empty instead of letting downstream callers crash with `new URL("")`.
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_APP_URL;
const SITE_URL =
  RAW_SITE_URL && RAW_SITE_URL.trim() !== ""
    ? RAW_SITE_URL.replace(/\/+$/, "")
    : "https://toolhuntly.com";

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
