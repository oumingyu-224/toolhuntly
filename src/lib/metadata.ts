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
 * Given a canonical URL (full or relative), return the hreflang alternates
 * for the site's locales. Paths are derived from src/i18n/routing.ts so they
 * always match the URLs next-intl actually generates (localePrefix:
 * "as-needed" => default locale without prefix, others with `/{locale}`):
 *   - en    => path as-is (no prefix), also x-default
 *   - zh-CN => same path prefixed with `/zh` (hreflang uses BCP 47 tags)
 *
 * Examples:
 *   canonical = https://toolhuntly.com/          => zh => https://toolhuntly.com/zh/
 *   canonical = https://toolhuntly.com/tag/ai    => zh => https://toolhuntly.com/zh/tag/ai
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
      // Non-default locale: /{locale} prefix
      alternatives[langTag] =
        `${origin}/${locale}${pathname === "/" ? "/" : `${pathname}/`}${search}`;
    }
  }

  // x-default points to the default (English) URL
  alternatives["x-default"] =
    alternatives[localeToLangTag[routing.defaultLocale] ?? routing.defaultLocale];

  return alternatives;
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
 *   6. alternates hreflang: en has no locale prefix, zh is /zh/*
 */
export function constructMetadata({
  title,
  description = siteConfig.description,
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

  // --- OpenGraph locale --------------------------------------------------
  const ogLocale = localeToOgLocale[locale] ?? "en_US";

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
      locale: ogLocale,
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
