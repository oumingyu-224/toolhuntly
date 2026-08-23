import { COLLECTIONS_PER_PAGE, ITEMS_PER_PAGE } from "@/lib/constants";
import type {
  BlogCategoryListQueryForSitemapResult,
  BlogListQueryForSitemapResult,
  CategoryListQueryForSitemapResult,
  CollectionListQueryForSitemapResult,
  ItemListQueryForSitemapResult,
  PageListQueryForSitemapResult,
  TagListQueryForSitemapResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  blogCategoryListQueryForSitemap,
  blogListQueryForSitemap,
  categoryListQueryForSitemap,
  collectionListQueryForSitemap,
  itemListQueryForSitemap,
  pageListQueryForSitemap,
  tagListQueryForSitemap,
} from "@/sanity/lib/queries";
import collection from "@/sanity/schemas/documents/directory/collection";
import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

// 统一使用 www 主域，输出绝对 URL（协议要求）
const site_url = siteConfig.url;

/**
 * Google's limit is 50,000 URLs per sitemap
 *
 * https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log("sitemap start");

  const sitemapList: MetadataRoute.Sitemap = []; // final result

  // 静态路由：en + zh-CN 各一份（登录/注册页不收录）
  const staticRoutes: { en: string; zh: string; lastModified: Date }[] = [
    { en: "", zh: "zh-CN", lastModified: new Date() },
    { en: "search", zh: "zh-CN/search", lastModified: new Date() },
    { en: "category", zh: "zh-CN/category", lastModified: new Date() },
    { en: "tag", zh: "zh-CN/tag", lastModified: new Date() },
    { en: "collection", zh: "zh-CN/collection", lastModified: new Date() },
    { en: "blog", zh: "zh-CN/blog", lastModified: new Date() },
    { en: "pricing", zh: "zh-CN/pricing", lastModified: new Date() },
    { en: "about", zh: "zh-CN/about", lastModified: new Date() },
    { en: "privacy", zh: "zh-CN/privacy", lastModified: new Date() },
    { en: "terms", zh: "zh-CN/terms", lastModified: new Date() },
  ];

  for (const route of staticRoutes) {
    const lastModified = new Date(route.lastModified).toISOString();
    sitemapList.push(
      {
        url: route.en === "" ? `${site_url}/` : `${site_url}/${route.en}`,
        lastModified,
      },
      {
        url: `${site_url}/${route.zh}`,
        lastModified,
      },
    );
  }

  const [
    itemListQueryResult,
    categoryListQueryResult,
    tagListQueryResult,
    collectionListQueryResult,
    blogListQueryResult,
    blogCategoryListQueryResult,
    pageListQueryResult,
  ] = await Promise.all([
    sanityFetch<ItemListQueryForSitemapResult>({
      query: itemListQueryForSitemap,
    }),
    sanityFetch<CategoryListQueryForSitemapResult>({
      query: categoryListQueryForSitemap,
    }),
    sanityFetch<TagListQueryForSitemapResult>({
      query: tagListQueryForSitemap,
    }),
    sanityFetch<CollectionListQueryForSitemapResult>({
      query: collectionListQueryForSitemap,
    }),
    sanityFetch<BlogListQueryForSitemapResult>({
      query: blogListQueryForSitemap,
    }),
    sanityFetch<BlogCategoryListQueryForSitemapResult>({
      query: blogCategoryListQueryForSitemap,
    }),
    sanityFetch<PageListQueryForSitemapResult>({
      query: pageListQueryForSitemap,
    }),
  ]);

  console.log("sitemap, itemListQueryResult size:", itemListQueryResult.length);
  console.log(
    "sitemap, categoryListQueryResult size:",
    categoryListQueryResult.length,
  );
  console.log("sitemap, tagListQueryResult size:", tagListQueryResult.length);
  console.log("sitemap, blogListQueryResult size:", blogListQueryResult.length);
  console.log(
    "sitemap, blogCategoryListQueryResult size:",
    blogCategoryListQueryResult.length,
  );
  console.log("sitemap, pageListQueryResult size:", pageListQueryResult.length);

  for (const item of itemListQueryResult) {
    if (item.slug) {
      const lastModified = new Date(item._updatedAt).toISOString();
      sitemapList.push(
        { url: `${site_url}/item/${item.slug}`, lastModified },
        { url: `${site_url}/zh-CN/item/${item.slug}`, lastModified },
      );
    } else {
      console.warn(`sitemap, item slug invalid, id:${item._id}`);
    }
  }

  const pageCount = Math.ceil(itemListQueryResult.length / ITEMS_PER_PAGE);
  console.log(`sitemap, item count:${itemListQueryResult.length}, pageCount:${pageCount}`);
  for (let i = 2; i <= pageCount; i++) {
    const lastModified = new Date().toISOString();
    sitemapList.push(
      { url: `${site_url}/?page=${i}`, lastModified },
      { url: `${site_url}/zh-CN/?page=${i}`, lastModified },
    );
  }

  for (const category of categoryListQueryResult) {
    if (category.slug) {
      const lastModified = new Date(category._updatedAt).toISOString();
      const routeUrl = `/category/${category.slug}`;
      sitemapList.push(
        { url: `${site_url}${routeUrl}`, lastModified },
        { url: `${site_url}/zh-CN${routeUrl}`, lastModified },
      );

      const pageCount = Math.ceil(category.count / ITEMS_PER_PAGE);
      console.log(`sitemap, category:${category.slug}, count:${category.count}, pageCount:${pageCount}`);
      for (let i = 2; i <= pageCount; i++) {
        const paginatedUrl = `/category/${category.slug}?page=${i}`;
        sitemapList.push(
          { url: `${site_url}${paginatedUrl}`, lastModified },
          { url: `${site_url}/zh-CN${paginatedUrl}`, lastModified },
        );
      }
    } else {
      console.warn(`sitemap, category slug invalid, id:${category._id}`);
    }
  }

  for (const tag of tagListQueryResult) {
    if (tag.slug) {
      const lastModified = new Date(tag._updatedAt).toISOString();
      const routeUrl = `/tag/${tag.slug}`;
      sitemapList.push(
        { url: `${site_url}${routeUrl}`, lastModified },
        { url: `${site_url}/zh-CN${routeUrl}`, lastModified },
      );

      const pageCount = Math.ceil(tag.count / ITEMS_PER_PAGE);
      console.log(`sitemap, tag:${tag.slug}, count:${tag.count}, pageCount:${pageCount}`);
      for (let i = 2; i <= pageCount; i++) {
        const paginatedUrl = `/tag/${tag.slug}?page=${i}`;
        sitemapList.push(
          { url: `${site_url}${paginatedUrl}`, lastModified },
          { url: `${site_url}/zh-CN${paginatedUrl}`, lastModified },
        );
      }
    } else {
      console.warn(`sitemap, tag slug invalid, id:${tag._id}`);
    }
  }

  for (const collection of collectionListQueryResult) {
    if (collection.slug) {
      const lastModified = new Date(collection._updatedAt).toISOString();
      const routeUrl = `/collection/${collection.slug}`;
      sitemapList.push(
        { url: `${site_url}${routeUrl}`, lastModified },
        { url: `${site_url}/zh-CN${routeUrl}`, lastModified },
      );

      const pageCount = Math.ceil(collection.count / COLLECTIONS_PER_PAGE);
      console.log(`sitemap, collection:${collection.slug}, count:${collection.count}, pageCount:${pageCount}`);
      for (let i = 2; i <= pageCount; i++) {
        const paginatedUrl = `/collection/${collection.slug}?page=${i}`;
        sitemapList.push(
          { url: `${site_url}${paginatedUrl}`, lastModified },
          { url: `${site_url}/zh-CN${paginatedUrl}`, lastModified },
        );
      }
    } else {
      console.warn(`sitemap, collection slug invalid, id:${collection._id}`);
    }
  }

  for (const blog of blogListQueryResult) {
    if (blog.slug) {
      const lastModified = new Date(blog._updatedAt).toISOString();
      const routeUrl = `/blog/${blog.slug}`;
      sitemapList.push(
        { url: `${site_url}${routeUrl}`, lastModified },
        { url: `${site_url}/zh-CN${routeUrl}`, lastModified },
      );
    } else {
      console.warn(`sitemap, blog post slug invalid, id:${blog._id}`);
    }
  }

  for (const blogCategory of blogCategoryListQueryResult) {
    if (blogCategory.slug) {
      const lastModified = new Date(blogCategory._updatedAt).toISOString();
      const routeUrl = `/blog/category/${blogCategory.slug}`;
      sitemapList.push(
        { url: `${site_url}${routeUrl}`, lastModified },
        { url: `${site_url}/zh-CN${routeUrl}`, lastModified },
      );

      const pageCount = Math.ceil(blogCategory.count / ITEMS_PER_PAGE);
      console.log(`sitemap, blog category:${blogCategory.slug}, count:${blogCategory.count}, pageCount:${pageCount}`);
      for (let i = 2; i <= pageCount; i++) {
        const paginatedUrl = `/blog/category/${blogCategory.slug}?page=${i}`;
        sitemapList.push(
          { url: `${site_url}${paginatedUrl}`, lastModified },
          { url: `${site_url}/zh-CN${paginatedUrl}`, lastModified },
        );
      }
    } else {
      console.warn(
        `sitemap, blog category slug invalid, id:${blogCategory._id}`,
      );
    }
  }

  for (const page of pageListQueryResult) {
    if (page.slug) {
      const lastModified = new Date(page._updatedAt).toISOString();
      const routeUrl = `/page/${page.slug}`;
      sitemapList.push(
        { url: `${site_url}${routeUrl}`, lastModified },
        { url: `${site_url}/zh-CN${routeUrl}`, lastModified },
      );
    } else {
      console.warn(`sitemap, page slug invalid, id:${page._id}`);
    }
  }

  console.log("sitemap end, size:", sitemapList.length);
  return sitemapList;
}
