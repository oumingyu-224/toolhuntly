import type {
  BlogPostListQueryResult,
  ItemListQueryResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  blogPostListOfLatestQuery,
  itemListOfFeaturedQuery,
  itemListOfLatestQuery,
} from "@/sanity/lib/queries";
import { Link } from "@/i18n/navigation";
import {
  ArrowRightIcon,
  FileTextIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import BlogGrid from "../blog/blog-grid";
import ItemGrid from "../item/item-grid";
import { Button } from "../ui/button";

export async function HomeContent() {
  const t = await getTranslations();
  const [featuredItems, latestItems, latestBlogPosts] = await Promise.all([
    sanityFetch<ItemListQueryResult>({
      query: itemListOfFeaturedQuery,
      params: { count: 6 },
    }),
    sanityFetch<ItemListQueryResult>({
      query: itemListOfLatestQuery,
      params: { count: 6 },
    }),
    sanityFetch<BlogPostListQueryResult>({
      query: blogPostListOfLatestQuery,
      params: { count: 6 },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* latest products */}
      {latestItems && latestItems.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-lg tracking-wider font-semibold text-gradient_indigo-purple">
                {t("Home.latestProducts")}
              </h2>
            </div>

            {/* <Link href="/search" className="text-lg group flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link> */}
          </div>

          <ItemGrid items={latestItems} sponsorItems={[]} showSponsor={false} />

          <Button asChild variant="default" size="lg" className="mx-auto">
            <Link
              href="/search"
              className="text-lg font-semibold px-16 group flex items-center gap-2"
            >
              <span className="tracking-wider">{t("Home.moreLatestProducts")}</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </Button>
        </div>
      )}

      {/* featured products */}
      {featuredItems && featuredItems.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-lg tracking-wider font-semibold text-gradient_indigo-purple">
                {t("Home.featuredProducts")}
              </h2>
            </div>

            {/* <Link href="/search" className="text-lg group flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link> */}
          </div>

          <ItemGrid items={featuredItems} sponsorItems={[]} showSponsor={false} />

          <Button asChild variant="default" size="lg" className="mx-auto">
            <Link
              href="/search"
              className="text-lg font-semibold px-16 group flex items-center gap-2"
            >
              <span className="tracking-wider">{t("Home.moreFeaturedProducts")}</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </Button>
        </div>
      )}

      {/* latest posts */}
      {latestBlogPosts && latestBlogPosts.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <FileTextIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-lg tracking-wider font-semibold text-gradient_indigo-purple">
                {t("Home.latestPosts")}
              </h2>
            </div>

            {/* <Link href="/blog" className="text-lg group flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link> */}
          </div>

          <BlogGrid posts={latestBlogPosts} />

          <Button asChild variant="default" size="lg" className="mx-auto">
            <Link
              href="/blog"
              className="text-lg font-semibold px-16 group flex items-center gap-2"
            >
              <span className="tracking-wider">{t("Home.moreBlogPosts")}</span>
              <ArrowRightIcon className="size-4 icon-scale" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
