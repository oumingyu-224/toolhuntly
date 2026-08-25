import ItemGrid from "@/components/item/item-grid";
import EmptyGrid from "@/components/shared/empty-grid";
import CustomPagination from "@/components/shared/pagination";
import { siteConfig } from "@/config/site";
import { getItems } from "@/data/item";
import {
  DEFAULT_SORT,
  ITEMS_PER_PAGE,
  SORT_FILTER_LIST,
} from "@/lib/constants";
import { constructMetadata } from "@/lib/metadata";
import type { SponsorItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { groupQuery, sponsorItemListQuery } from "@/sanity/lib/queries";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { HomeIcon } from "lucide-react";
import type { Metadata } from "next";

type CategoryWithCount = {
  _id: string;
  name: string;
  slug?: { current?: string };
  count?: number;
};

type GroupData = {
  _id: string;
  name: string;
  slug?: { current?: string };
  description?: string | null;
  categories?: CategoryWithCount[];
};

// Icon color map by group name keyword (same as category index page)
const GROUP_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  api: { bg: "bg-teal-100", text: "text-teal-700", label: "API" },
  detection: { bg: "bg-emerald-100", text: "text-emerald-700", label: "AI" },
  image: { bg: "bg-pink-100", text: "text-pink-700", label: "IMG" },
  design: { bg: "bg-pink-100", text: "text-pink-700", label: "DSN" },
  video: { bg: "bg-red-100", text: "text-red-700", label: "VID" },
  voice: { bg: "bg-purple-100", text: "text-purple-700", label: "AUD" },
  audio: { bg: "bg-purple-100", text: "text-purple-700", label: "AUD" },
  music: { bg: "bg-purple-100", text: "text-purple-700", label: "MSC" },
  productivity: { bg: "bg-amber-100", text: "text-amber-700", label: "PRD" },
  writing: { bg: "bg-blue-100", text: "text-blue-700", label: "WRT" },
  text: { bg: "bg-blue-100", text: "text-blue-700", label: "TXT" },
  coding: { bg: "bg-cyan-100", text: "text-cyan-700", label: "DEV" },
  development: { bg: "bg-cyan-100", text: "text-cyan-700", label: "DEV" },
  life: { bg: "bg-rose-100", text: "text-rose-700", label: "LFE" },
  assistant: { bg: "bg-rose-100", text: "text-rose-700", label: "AST" },
  marketing: { bg: "bg-orange-100", text: "text-orange-700", label: "MKT" },
  advertising: { bg: "bg-orange-100", text: "text-orange-700", label: "ADV" },
  education: { bg: "bg-indigo-100", text: "text-indigo-700", label: "EDU" },
  learning: { bg: "bg-indigo-100", text: "text-indigo-700", label: "LRN" },
  research: { bg: "bg-slate-100", text: "text-slate-700", label: "RSH" },
  search: { bg: "bg-yellow-100", text: "text-yellow-700", label: "SRC" },
  seo: { bg: "bg-lime-100", text: "text-lime-700", label: "SEO" },
  business: { bg: "bg-stone-100", text: "text-stone-700", label: "BSN" },
  finance: { bg: "bg-green-100", text: "text-green-700", label: "FIN" },
  legal: { bg: "bg-neutral-100", text: "text-neutral-700", label: "LGL" },
  health: { bg: "bg-emerald-100", text: "text-emerald-700", label: "HLT" },
  medical: { bg: "bg-emerald-100", text: "text-emerald-700", label: "MED" },
  travel: { bg: "bg-sky-100", text: "text-sky-700", label: "TRV" },
  real: { bg: "bg-stone-100", text: "text-stone-700", label: "EST" },
  estate: { bg: "bg-stone-100", text: "text-stone-700", label: "EST" },
  ecommerce: { bg: "bg-amber-100", text: "text-amber-700", label: "ECO" },
  commerce: { bg: "bg-amber-100", text: "text-amber-700", label: "ECO" },
  social: { bg: "bg-blue-100", text: "text-blue-700", label: "SCL" },
  media: { bg: "bg-fuchsia-100", text: "text-fuchsia-700", label: "MED" },
  humanizer: { bg: "bg-emerald-100", text: "text-emerald-700", label: "HUM" },
  chatbot: { bg: "bg-sky-100", text: "text-sky-700", label: "CHT" },
  agent: { bg: "bg-cyan-100", text: "text-cyan-700", label: "AGT" },
  avatar: { bg: "bg-purple-100", text: "text-purple-700", label: "AVT" },
  generator: { bg: "bg-emerald-100", text: "text-emerald-700", label: "GEN" },
  art: { bg: "bg-pink-100", text: "text-pink-700", label: "ART" },
};

function getGroupStyle(name: string) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(GROUP_STYLES)) {
    if (lower.includes(key)) return GROUP_STYLES[key];
  }
  // Fallback: take first 3 letters, generic slate color
  const label = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "GRP";
  return { bg: "bg-slate-100", text: "text-slate-700", label };
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata | undefined> {
  const group = (await sanityFetch<GroupData>({
    query: groupQuery,
    params: { slug: params.slug },
  })) as GroupData | null;
  if (!group) {
    console.warn(`generateMetadata, group not found for slug: ${params.slug}`);
    return;
  }

  const ogImageUrl = new URL(`${siteConfig.url}/api/og`);
  ogImageUrl.searchParams.append("title", group.name);
  ogImageUrl.searchParams.append("description", group.description || "");
  ogImageUrl.searchParams.append("type", "Group");

  return constructMetadata({
    title: `${group.name}`,
    description: group.description || undefined,
    canonicalUrl: `${siteConfig.url}/group/${params.slug}`,
    locale: params.locale,
  });
}

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const group = (await sanityFetch<GroupData>({
    query: groupQuery,
    params: { slug: params.slug },
  })) as GroupData | null;

  const categories = group?.categories ?? [];
  const totalCategoryCount = categories.length;

  const sponsorItems =
    (await sanityFetch<SponsorItemListQueryResult>({
      query: sponsorItemListQuery,
    })) || [];
  const showSponsor = true;
  const hasSponsorItem = showSponsor && sponsorItems.length > 0;

  const { sort, page } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    SORT_FILTER_LIST.find((item) => item.slug === sort) || DEFAULT_SORT;
  const currentPage = page ? Number(page) : 1;
  const { items, totalCount } = await getItems({
    group: params.slug,
    sortKey,
    reverse,
    currentPage,
    hasSponsorItem,
  });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const groupStyle = getGroupStyle(group?.name ?? "");

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="flex items-center gap-1">
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/category">All AI Tool Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {group?.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Header: Icon Badge + Name */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold tracking-wide ${groupStyle.bg} ${groupStyle.text} md:h-14 md:w-14 md:text-lg`}
        >
          {groupStyle.label}
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          {group?.name}
        </h1>
      </div>

      {/* 3. Description + two badges */}
      <div className="flex flex-wrap items-center gap-3">
        {group?.description && (
          <p className="text-base text-muted-foreground md:text-lg">
            {group.description}
          </p>
        )}
        <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-800">
          {totalCount} tools
        </span>
        <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground">
          {totalCategoryCount} categories
        </span>
      </div>

      {/* 4. Sub-category filter bar */}
      <ScrollArea className="w-full pb-2">
        <ul className="flex gap-x-2">
          <li>
            <Link
              href={`/group/${params.slug}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <span>All</span>
              <span className="tabular-nums text-xs opacity-80">
                {totalCount}
              </span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <Link
                href={`/category/${cat.slug?.current}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span>{cat.name}</span>
                <span className="tabular-nums text-xs opacity-60">
                  {cat.count ?? 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Grid + Pagination */}
      <div>
        {items?.length === 0 && <EmptyGrid />}

        {items && items.length > 0 && (
          <section>
            <ItemGrid
              items={items}
              sponsorItems={sponsorItems}
              showSponsor={showSponsor}
            />

            <div className="mt-8 flex items-center justify-center">
              <CustomPagination
                routePrefix={`/group/${params.slug}`}
                totalPages={totalPages}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
