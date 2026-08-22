import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

/**
 * Safely build the `metadataBase` URL for Next.js metadata. Next.js evaluates
 * every `export const metadata` / `generateMetadata` at **build time** during
 * its "collect page data" phase, so we can't let `new URL(undefined)` or
 * `new URL("")` throw and kill the whole build.
 */
function buildMetadataBase(raw: string | undefined): URL {
  const fallback = "https://toolhuntly.com/";
  if (!raw) {
    if (typeof console !== "undefined") {
      console.warn(
        "[lib/metadata] siteConfig.url (NEXT_PUBLIC_APP_URL) is empty or missing. Falling back to https://toolhuntly.com. Configure the env for preview deployments if needed.",
      );
    }
    return new URL(fallback);
  }
  try {
    return new URL(raw);
  } catch {
    if (typeof console !== "undefined") {
      console.warn(
        `[lib/metadata] siteConfig.url="${raw}" is not a valid URL (ERR_INVALID_URL). Falling back to https://toolhuntly.com.`,
      );
    }
    return new URL(fallback);
  }
}

/**
 * Given a canonical URL (full or relative), return the two hreflang
 * alternates that the ToolHuntly site uses:
 *   - English (x-default / en): path as-is (no locale prefix)
 *   - Chinese (zh-Hans / zh-CN): same path but prefixed with `/cn`
 *
 * Examples:
 *   canonical = https://toolhuntly.com/          => zh => https://toolhuntly.com/cn/
 *   canonical = https://toolhuntly.com/tag/ai    => zh => https://toolhuntly.com/cn/tag/ai
 *   canonical = /tag/ai (relative) is normalized via metadataBase first
 */
function buildHreflangAlternates(
  canonical: string,
  metadataBase: URL,
): Record<string, string> {
  // Normalize to absolute URL using the metadataBase origin
  const canonicalObj = (() => {
    try {
      return new URL(canonical, metadataBase.origin);
    } catch {
      return new URL("/", metadataBase.origin);
    }
  })();

  const origin = canonicalObj.origin;
  // pathname always starts with "/"
  const pathname = canonicalObj.pathname.replace(/\/+$/, "") || "/";
  const search = canonicalObj.search;

  // English: default path, no locale prefix
  const enPath = pathname === "/" ? "/" : `${pathname}/`;
  const enUrl = `${origin}${enPath}${search}`;

  // Chinese: same path but prefixed with `/cn`
  const zhPath =
    pathname === "/" ? "/cn/" : `/cn${pathname}/`;
  const zhUrl = `${origin}${zhPath}${search}`;

  return {
    "x-default": enUrl,
    en: enUrl,
    "zh-Hans": zhUrl,
    "zh-CN": zhUrl,
  };
}

const DEFAULT_HOME_TITLE =
  "Best AI Tools Directory & Alternatives | ToolHuntly";

/**
 * Construct the metadata object for the current page.
 *
 * Design rules (from global Head spec):
 *   1. Home <title>     = Best AI Tools Directory & Alternatives | ToolHuntly
 *      Sub <title>      = <page title> | ToolHuntly
 *   2. meta description = Default: siteConfig.description (ToolHuntly line)
 *   3. <link canonical> = https://toolhuntly.com/ for home, page-specific for subs
 *   4. og:*            = mirror title / description / url / image (/og.png)
 *   5. twitter:card    = summary_large_image, rest mirrors og
 *   6. alternates hreflang: en has no locale prefix, zh is /cn/*
 */
export function constructMetadata({
  title,
  description = siteConfig.description,
  canonicalUrl,
  image,
  noIndex = false,
}: {
  /** Page-specific title (the part before `| ToolHuntly`). Leave empty for home. */
  title?: string;
  description?: string;
  /** Explicit canonical. Falls back to siteConfig.url + "/" for home. */
  canonicalUrl?: string;
  /** OG image URL. Defaults to siteConfig.image, which is /og.png?v=1 */
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const metadataBase = buildMetadataBase(siteConfig.url);
  const origin = metadataBase.origin;

  // --- Title -------------------------------------------------------------
  // Home uses the full exact spec line. Sub pages get "<title> | ToolHuntly".
  const hasPageTitle = Boolean(title && title.trim() !== "");
  const fullTitle = hasPageTitle
    ? `${title!.trim()} | ${siteConfig.name}`
    : DEFAULT_HOME_TITLE;

  // --- Canonical ---------------------------------------------------------
  // If the caller supplied a page-specific canonical, prefer it. Otherwise
  // home canonical = https://toolhuntly.com/ (always with trailing slash).
  const canonical = (() => {
    try {
      if (canonicalUrl && canonicalUrl.trim() !== "") {
        const u = new URL(canonicalUrl, origin);
        const p = u.pathname.replace(/\/+$/, "") || "/";
        return `${u.origin}${p === "/" ? "/" : `${p}/`}${u.search}`;
      }
    } catch {
      // fallthrough to home default
    }
    return `${origin}/`;
  })();

  // --- Image -------------------------------------------------------------
  const ogImage = image && image.trim() !== "" ? image.trim() : siteConfig.image;

  // --- Hreflang ----------------------------------------------------------
  const languages = buildHreflangAlternates(canonical, metadataBase);

  return {
    title: fullTitle,
    description,
    keywords: siteConfig.keywords,
    creator: siteConfig.author,
    authors: [{ name: siteConfig.author }],
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      site: canonical,
      creator: siteConfig.author,
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-32x32.png",
      apple: "/apple-touch-icon.png",
    },
    metadataBase,
    manifest: `${origin}/site.webmanifest`,
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}
