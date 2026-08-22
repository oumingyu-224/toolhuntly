import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

/**
 * Safely build the `metadataBase` URL for Next.js metadata. Next.js evaluates
 * every `export const metadata` / `generateMetadata` at **build time** during
 * its "collect page data" phase, so we can't let `new URL(undefined)` or
 * `new URL("")` throw and kill the whole build.
 *
 * If the site URL is not configured yet (env missing, empty string, or
 * obviously invalid) we fall back to a placeholder that is a syntactically
 * valid URL. Operators can later swap the env and redeploy; the real URL
 * overrides this at runtime and through SEO metadata.
 */
function buildMetadataBase(raw: string | undefined): URL {
  const fallback = "https://placeholder.example.com/";
  if (!raw) {
    if (typeof console !== "undefined") {
      console.warn(
        "[lib/metadata] siteConfig.url (NEXT_PUBLIC_APP_URL) is empty or missing. Using a placeholder as metadataBase. Configure the env variable for production SEO.",
      );
    }
    return new URL(fallback);
  }
  try {
    return new URL(raw);
  } catch {
    if (typeof console !== "undefined") {
      console.warn(
        `[lib/metadata] siteConfig.url="${raw}" is not a valid URL (ERR_INVALID_URL). Falling back to a placeholder until NEXT_PUBLIC_APP_URL is fixed.`,
      );
    }
    return new URL(fallback);
  }
}

/**
 * Construct the metadata object for the current page (in docs/guides)
 */
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  canonicalUrl,
  image = siteConfig.image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.name;
  const metadataBase = buildMetadataBase(siteConfig.url);
  const safeSiteUrl = metadataBase.origin;
  return {
    title: fullTitle,
    description,
    keywords: siteConfig.keywords,
    creator: siteConfig.author,
    authors: [
      {
        name: siteConfig.author,
      },
    ],
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: safeSiteUrl,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      site: safeSiteUrl,
      creator: siteConfig.author,
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-32x32.png",
      apple: "/apple-touch-icon.png",
    },
    metadataBase,
    manifest: `${safeSiteUrl}/site.webmanifest`,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
