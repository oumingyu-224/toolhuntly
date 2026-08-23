import { siteConfig } from "@/config/site";
import { localeToLangTag, localeToOgLocale, routing } from "@/i18n/routing";
import type { Metadata } from "next";

/**
 * Safely build the `metadataBase` URL for Next.js metadata. Next.js evaluates
 * every `export const metadata` / `generateMetadata` at **build time** during
 * its "collect page data" phase, so we can't let `new URL(undefined)` or
 * `new URL("")` throw and kill the whole build.
 */
function buildMetadataBase(raw: string | undefined): URL {
  const fallback = "https://www.toolhuntly.com/";
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
        `[lib/metadata] siteConfig.url="${raw}" is not a valid URL (ERR_INVALID_URL). Falling back to https://www.toolhuntly.com.`,
      );
    }
    return new URL(fallback);
  }
}

/**
 * Given a canonical URL (full or relative), return the hreflang alternates
 * for the site's locales. Paths are derived from src/i18n/routing.ts so they
 * always match the URLs next-intl actually generates (localePrefix:
 * "as-needed" => default locale without prefix, others with `/{locale}`):
 *   - en    => path as-is (no prefix), also x-default
 *   - zh-CN => same path prefixed with `/zh-CN`
 *
 * Examples:
 *   canonical = https://toolhuntly.com/          => zh-CN => https://toolhuntly.com/zh-CN/
 *   canonical = https://toolhuntly.com/tag/ai    => zh-CN => https://toolhuntly.com/zh-CN/tag/ai
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

  const alternatives: Record<string, string> = {};

  for (const locale of routing.locales) {
    const langTag = localeToLangTag[locale] ?? locale;
    if (locale === routing.defaultLocale) {
      // Default locale: no prefix
      alternatives[langTag] =
        `${origin}${pathname === "/" ? "/" : `${pathname}/`}${search}`;
    } else {
      // Non-default locale: /{locale} prefix, no trailing slash
      // (e.g. zh-CN home is /zh-CN, not /zh-CN/)
      alternatives[langTag] =
        `${origin}/${locale}${pathname === "/" ? "" : pathname}${search}`;
    }
  }

  // x-default points to the default (English) URL
  alternatives["x-default"] =
    alternatives[localeToLangTag[routing.defaultLocale] ?? routing.defaultLocale];

  return alternatives;
}

const DEFAULT_HOME_TITLES: Record<string, string> = {
  en: "Best AI Tools Directory & Alternatives | ToolHuntly",
  "zh-CN": "AI 工具导航与最佳替代方案 | ToolHuntly",
};

const DEFAULT_HOME_DESCRIPTIONS: Record<string, string> = {
  en: siteConfig.description,
  "zh-CN":
    "发现最好用的 AI 工具——每日精选。在 ToolHuntly 浏览写作、图片、视频、编程等 AI 工具。",
};

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
 *   6. alternates hreflang: en has no locale prefix, zh-CN is /zh-CN/*
 */
export function constructMetadata({
  title,
  description,
  canonicalUrl,
  image,
  noIndex = false,
  locale = routing.defaultLocale,
}: {
  /** Page-specific title (the part before `| ToolHuntly`). Leave empty for home. */
  title?: string;
  description?: string;
  /** Explicit canonical. Falls back to siteConfig.url + "/" for home. */
  canonicalUrl?: string;
  /** OG image URL. Defaults to siteConfig.image, which is /og.png?v=1 */
  image?: string;
  noIndex?: boolean;
  /** Active locale, used for og:locale. Pass params.locale in generateMetadata. */
  locale?: string;
} = {}): Metadata {
  const metadataBase = buildMetadataBase(siteConfig.url);
  const origin = metadataBase.origin;

  // Locale-aware fallbacks for the home page, used when no page-specific
  // title / description is provided. Locale comes from generateMetadata.
  const homeTitle =
    DEFAULT_HOME_TITLES[locale] ?? DEFAULT_HOME_TITLES[routing.defaultLocale];
  const homeDescription =
    DEFAULT_HOME_DESCRIPTIONS[locale] ??
    DEFAULT_HOME_DESCRIPTIONS[routing.defaultLocale];

  // --- Title -------------------------------------------------------------
  // Home uses the full localized spec line. Sub pages get "<title> | ToolHuntly".
  const hasPageTitle = Boolean(title && title.trim() !== "");
  const fullTitle = hasPageTitle
    ? `${title!.trim()} | ${siteConfig.name}`
    : homeTitle;

  // --- Description -------------------------------------------------------
  // Default to the localized home description unless the page provides one.
  const finalDescription = description ?? homeDescription;

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

  // Non-default locales get the canonical prefixed with /{locale}, without a
  // trailing slash (e.g. https://toolhuntly.com/zh-CN). Skip when the caller
  // already prefixed it.
  const localizedCanonical = (() => {
    if (locale === routing.defaultLocale) {
      return canonical;
    }
    try {
      const u = new URL(canonical, origin);
      const p = u.pathname.replace(/\/+$/, "");
      // Already prefixed with this locale → keep as-is
      if (p === `/${locale}` || p.startsWith(`/${locale}/`)) {
        return canonical;
      }
      return `${u.origin}/${locale}${p}${u.search}`;
    } catch {
      return canonical;
    }
  })();

  // --- Image -------------------------------------------------------------
  const ogImage = image && image.trim() !== "" ? image.trim() : siteConfig.image;

  // --- Hreflang ----------------------------------------------------------
  const languages = buildHreflangAlternates(canonical, metadataBase);

  // --- OpenGraph locale --------------------------------------------------
  const ogLocale = localeToOgLocale[locale] ?? "en_US";

  return {
    title: fullTitle,
    description: finalDescription,
    keywords: siteConfig.keywords,
    creator: siteConfig.author,
    authors: [{ name: siteConfig.author }],
    alternates: {
      canonical: localizedCanonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: localizedCanonical,
      title: fullTitle,
      description: finalDescription,
      siteName: siteConfig.name,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: finalDescription,
      images: [ogImage],
      site: localizedCanonical,
      creator: siteConfig.author,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
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
