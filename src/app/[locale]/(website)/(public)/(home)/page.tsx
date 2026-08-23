import HomeCategoryRanking from "@/components/home/home-category-ranking";
import HomeFaq from "@/components/home/home-faq";
import HomeFeaturedTools from "@/components/home/home-featured-tools";
import HomeHero from "@/components/home/home-hero";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

// Locale-aware home metadata so /zh-CN gets Chinese title/description and a
// canonical that points to https://toolhuntly.com/zh-CN/ instead of the EN home.
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return constructMetadata({
    title: "",
    canonicalUrl: `${siteConfig.url}/`,
    locale: params.locale,
  });
}

/**
 * Marketing-style home page (huntify layout):
 * Hero → Featured tools (tiered cards) → Category ranking → FAQ.
 * Browsing/searching lives on /search and /category.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeFeaturedTools />
      <HomeCategoryRanking />
      <HomeFaq />
    </>
  );
}
