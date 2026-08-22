import { faqConfig } from "@/config/faq";
import { siteConfig } from "@/config/site";

/**
 * Schema.org JSON-LD builders for the ToolHuntly site head.
 *
 *   8. Organization  — name, url, logo, sameAs (Twitter / future socials)
 *   9. WebSite       — name, url, potentialAction:SearchAction with target
 *                      https://toolhuntly.com/search?q={search_term_string}
 *  10. FAQPage       — the 5 Q&A pairs from config/faq.ts
 *
 * Callers (layout.tsx) take each return value and wrap it in:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html }} />
 *
 * We avoid using `dangerouslyHtml` here so the functions are testable in
 * isolation and callers retain control of the React script element.
 */

export type JsonLd = Record<string, unknown>;

/** ------------------------------------------------------------------
 * 8. Organization
 * ----------------------------------------------------------------- */
export function buildOrganizationJsonLd(): JsonLd {
  const logo = siteConfig.logo?.startsWith("/")
    ? `${siteConfig.url}${siteConfig.logo}`
    : siteConfig.logo ?? `${siteConfig.url}/logo.png`;

  const sameAs: string[] = [];
  if (siteConfig.links?.twitter && siteConfig.links.twitter.trim() !== "") {
    sameAs.push(siteConfig.links.twitter.trim());
  }
  if (siteConfig.links?.github && siteConfig.links.github.trim() !== "") {
    sameAs.push(siteConfig.links.github.trim());
  }
  if (siteConfig.links?.youtube && siteConfig.links.youtube.trim() !== "") {
    sameAs.push(siteConfig.links.youtube.trim());
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: logo,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.mail,
      contactType: "customer support",
      availableLanguage: ["English", "Chinese"],
    },
  };
}

/** ------------------------------------------------------------------
 * 9. WebSite + SearchAction potentialAction
 * ----------------------------------------------------------------- */
export function buildWebSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** ------------------------------------------------------------------
 * 10. FAQPage (5 Q&A from faqConfig)
 * ----------------------------------------------------------------- */
export function buildFAQPageJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqConfig.items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

/** Convenience: serialize a schema object to the JSON string used in <script>. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data);
}
