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
import type {
  CategoryListQueryResult,
  CategoryQueryResult,
  SponsorItemListQueryResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  categoryListQuery,
  categoryQuery,
  sponsorItemListQuery,
} from "@/sanity/lib/queries";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/navigation";
import { Check, HomeIcon } from "lucide-react";
import type { Metadata } from "next";

type CategoryWithCount = CategoryListQueryResult[number] & {
  count?: number;
};

type CategoryWithInfo = CategoryQueryResult & {
  whatIs?: string | null;
  whatDoes?: Array<string> | null;
  whoUses?: Array<{ title?: string; description?: string }> | null;
  howItWorks?: string | null;
  faqs?: Array<{ question?: string | null; answer?: string | null }> | null;
};

function CategoryInfoSections({
  category,
}: {
  category: CategoryWithInfo | null;
}) {
  if (!category) return null;

  const coreFeatures = category.whatDoes ?? [];
  const whoUsesItems = category.whoUses ?? [];
  const hasWhatIs = !!category.whatIs;
  const hasCoreFeatures = coreFeatures.length > 0;
  const hasWhoUses = whoUsesItems.length > 0;
  const hasHowItWorks = !!category.howItWorks;
  const hasFaqs = (category.faqs ?? []).length > 0;

  if (
    !hasWhatIs &&
    !hasCoreFeatures &&
    !hasWhoUses &&
    !hasHowItWorks &&
    !hasFaqs
  )
    return null;

  const displayName = category.name ?? "category";

  return (
    <div className="flex flex-col gap-16">
      {hasWhatIs && (
        <section className="mx-auto w-full max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            What is {displayName}?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {category.whatIs}
          </p>
        </section>
      )}

      {hasCoreFeatures && (
        <section className="mx-auto w-full max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Core features to look for
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {coreFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-lime-500" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasWhoUses && (
        <section className="mx-auto w-full max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Who uses {displayName}, and how
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {whoUsesItems.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border bg-card p-5"
              >
                <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-lime-100 text-xs font-semibold text-lime-700">
                  {String(index + 1).padStart(2, "0")}
                </div>
                {item.title && (
                  <p className="font-medium leading-tight">
                    {item.title}
                  </p>
                )}
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasHowItWorks && (
        <section className="mx-auto w-full max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            How does {displayName} work?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {category.howItWorks}
          </p>
        </section>
      )}

      {hasFaqs && (
        <section className="mx-auto w-full max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-6 w-full">
            {(category.faqs ?? []).map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata | undefined> {
  const category = await sanityFetch<CategoryWithInfo>({
    query: categoryQuery,
    params: { slug: params.slug },
  });
  if (!category) {
    console.warn(
      `generateMetadata, category not found for slug: ${params.slug}`,
    );
    return;
  }

  const ogImageUrl = new URL(`${siteConfig.url}/api/og`);
  ogImageUrl.searchParams.append("title", category.name);
  ogImageUrl.searchParams.append("description", category.description || "");
  ogImageUrl.searchParams.append("type", "Category");

  return constructMetadata({
    title: `${category.name}`,
    description: category.description,
    canonicalUrl: `${siteConfig.url}/category/${params.slug}`,
    // image: ogImageUrl.toString(),
    locale: params.locale,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const category = await sanityFetch<CategoryQueryResult>({
    query: categoryQuery,
    params: { slug: params.slug },
  });

  const allCategories =
    ((await sanityFetch<CategoryWithCount[]>({
      query: categoryListQuery,
    })) as CategoryWithCount[]) || [];

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
    category: params.slug,
    sortKey,
    reverse,
    currentPage,
    hasSponsorItem,
  });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-16">
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
              {category?.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Category Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background">
          <span className="h-2 w-2 rounded-full bg-lime-400" />
          <span>{category?.name}</span>
          <span className="opacity-60">·</span>
          <span className="tabular-nums opacity-80">{totalCount} tools</span>
        </div>
      </div>

      {/* 3. H1 Title */}
      <h1 className="text-center text-3xl font-bold tracking-tight md:text-5xl">
        Best {category?.name} Tools ({year})
      </h1>

      {/* 4. Description */}
      {category?.description && (
        <p className="mx-auto max-w-2xl text-center text-base text-muted-foreground md:text-lg">
          {category.description}
        </p>
      )}

      {/* 5. Horizontal Category Filter Bar */}
      <ScrollArea className="w-full pb-2">
        <ul className="flex gap-x-2">
          <li>
            <Link
              href="/category"
              className="inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              All
            </Link>
          </li>
          {allCategories.map((cat) => {
            const isActive = cat.slug?.current === params.slug;
            return (
              <li key={cat._id}>
                <Link
                  href={`/category/${cat.slug?.current}`}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-foreground bg-foreground text-background hover:bg-foreground/90"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`tabular-nums text-xs ${
                      isActive ? "opacity-80" : "opacity-60"
                    }`}
                  >
                    {cat.count ?? 0}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* 6. List Section Title */}
      <h2 className="text-xl font-bold md:text-2xl">
        All {category?.name} tools
      </h2>

      {/* 7. Tool Grid + Pagination */}
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
                routePrefix={`/category/${params.slug}`}
                totalPages={totalPages}
              />
            </div>
          </section>
        )}
      </div>

      {/* 8. Info Sections */}
      <CategoryInfoSections category={category} />
    </div>
  );
}
