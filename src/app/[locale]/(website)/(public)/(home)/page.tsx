import HomeCategoryRanking from "@/components/home/home-category-ranking";
import HomeFaq from "@/components/home/home-faq";
import HomeFeaturedTools from "@/components/home/home-featured-tools";
import HomeHero from "@/components/home/home-hero";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "",
  canonicalUrl: `${siteConfig.url}/`,
});

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
