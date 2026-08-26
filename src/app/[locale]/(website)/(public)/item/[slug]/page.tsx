import SponsorItemCard from "@/components/item/item-card-sponsor";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/config/site";
import { urlForIcon, urlForImage } from "@/lib/image";
import { constructMetadata } from "@/lib/metadata";
import { cn, getItemTargetLinkInWebsite } from "@/lib/utils";
import type {
  ItemInfoBySlugQueryResult,
  SponsorItemListQueryResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  itemFullInfoBySlugQuery,
  itemInfoBySlugQuery,
  sponsorItemListQuery,
} from "@/sanity/lib/queries";
import type { ItemFullInfo } from "@/types";
import {
  ArrowLeft,
  Check,
  Copy,
  GlobeIcon,
  Heart,
  HomeIcon,
  Link as LinkIcon,
  MessageCircle,
  Quote,
  Share2,
  Twitter,
  Flag,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata | undefined> {
  const item = await sanityFetch<ItemInfoBySlugQueryResult>({
    query: itemInfoBySlugQuery,
    params: { slug: params.slug },
  });
  if (!item) {
    console.warn(`generateMetadata, item not found for slug: ${params.slug}`);
    return;
  }

  const imageProps = item?.image ? urlForImage(item?.image) : null;
  return constructMetadata({
    title: `${item.name}`,
    description: item.description,
    canonicalUrl: `${siteConfig.url}/item/${params.slug}`,
    image: imageProps?.src,
    locale: params.locale,
  });
}

interface ItemPageProps {
  params: { slug: string };
}

function SectionHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "border-l-4 border-l-indigo-500 pl-4 text-2xl font-bold tracking-tight",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export default async function ItemPage({ params }: ItemPageProps) {
  const [item, sponsorItems] = await Promise.all([
    sanityFetch<ItemFullInfo>({
      query: itemFullInfoBySlugQuery,
      params: { slug: params.slug },
    }),
    sanityFetch<SponsorItemListQueryResult>({
      query: sponsorItemListQuery,
    }),
  ]);

  if (!item) {
    console.error("ItemPage, item not found");
    return notFound();
  }

  const imageProps = item?.image ? urlForImage(item?.image) : null;
  const imageBlurDataURL = item?.image?.blurDataURL || null;
  const iconProps = item?.icon ? urlForIcon(item.icon) : null;
  const iconBlurDataURL = item?.icon?.blurDataURL || null;
  const itemLink = getItemTargetLinkInWebsite(item);
  const sponsorItem = sponsorItems?.length
    ? sponsorItems[Math.floor(Math.random() * sponsorItems.length)]
    : null;
  const categories = item.categories ?? [];
  const firstCategory = categories[0];

  return (
    <div className="flex flex-col gap-10">
      {/* Back button + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            <HomeIcon className="h-4 w-4" />
          </Link>
          <span>/</span>
          <Link href="/category" className="hover:text-foreground">
            Categories
          </Link>
          {firstCategory && (
            <>
              <span>/</span>
              <Link
                href={`/category/${firstCategory.slug.current}`}
                className="hover:text-foreground"
              >
                {firstCategory.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-medium text-foreground">{item.name}</span>
        </nav>
      </div>

      {/* Header section */}
      <div className="rounded-xl border bg-card">
        <div className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: icon + name + tags + platforms */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                {iconProps && (
                  <Image
                    src={iconProps?.src}
                    alt={item.icon.alt || `icon of ${item.name}`}
                    title={item.icon.alt || `icon of ${item.name}`}
                    width={48}
                    height={48}
                    className="rounded-lg border object-cover image-scale"
                    {...(iconBlurDataURL && {
                      placeholder: "blur",
                      blurDataURL: iconBlurDataURL,
                    })}
                  />
                )}
                <h1 className="text-3xl font-bold tracking-tight">
                  {item.name}
                </h1>
              </div>

              {/* Plan label + platforms */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.planLabel && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {item.planLabel}
                  </span>
                )}
                {item.platforms?.map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Right: action buttons */}
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Claim
              </Button>
              <Button asChild className="gap-2">
                <Link
                  href={itemLink}
                  target="_blank"
                  prefetch={false}
                  className="flex items-center"
                >
                  <GlobeIcon className="h-4 w-4" />
                  Visit
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Preview image */}
        {imageProps && (
          <div className="relative border-t bg-muted/30 p-4">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border bg-background shadow-lg">
              <div className="relative aspect-video w-full">
                <Image
                  src={imageProps.src}
                  alt={item.image?.alt || `image for ${item.name}`}
                  title={item.image?.alt || `image for ${item.name}`}
                  loading="eager"
                  fill
                  className="object-cover image-scale"
                  {...(imageBlurDataURL && {
                    placeholder: "blur",
                    blurDataURL: imageBlurDataURL,
                  })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content + Sidebar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="flex flex-col gap-10">
          {/* What is this tool? */}
          {item.whatIs && (
            <section className="space-y-4">
              <SectionHeader>What is {item.name}?</SectionHeader>
              <p className="text-muted-foreground leading-relaxed">
                {item.whatIs}
              </p>
            </section>
          )}

          {/* Core Features */}
          {item.coreFeatures && item.coreFeatures.length > 0 && (
            <section className="space-y-4">
              <SectionHeader>What can {item.name} do?</SectionHeader>
              <div className="divide-y rounded-lg border">
                {item.coreFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      {feature.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Use Cases */}
          {item.useCases && item.useCases.length > 0 && (
            <section className="space-y-4">
              <SectionHeader>Use Cases</SectionHeader>
              <div className="space-y-4">
                {item.useCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg border bg-muted/30 p-4 pl-10"
                  >
                    <Quote className="absolute left-3 top-4 h-5 w-5 text-muted-foreground/40" />
                    <p className="text-sm">
                      <span className="font-semibold">{useCase.title}</span>
                      {useCase.description && (
                        <>
                          {" "}
                          <span className="text-muted-foreground">
                            — {useCase.description}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quick Facts */}
          {item.quickFacts &&
            (item.quickFacts.domainRating ||
              item.quickFacts.platforms ||
              item.quickFacts.languages) && (
              <section className="space-y-4">
                <SectionHeader>Quick Facts about {item.name}</SectionHeader>
                <div className="divide-y rounded-lg border">
                  {item.quickFacts.domainRating && (
                    <div className="flex items-center gap-4 p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <span className="w-32 text-sm text-muted-foreground">
                        Domain Rating
                      </span>
                      <span className="font-medium">
                        {item.quickFacts.domainRating}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        Domain Rating by Ahrefs
                      </span>
                    </div>
                  )}
                  {item.quickFacts.platforms && (
                    <div className="flex items-center gap-4 p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Check className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <span className="w-32 text-sm text-muted-foreground">
                        Platforms
                      </span>
                      <span className="font-medium">
                        {item.quickFacts.platforms}
                      </span>
                    </div>
                  )}
                  {item.quickFacts.languages && (
                    <div className="flex items-center gap-4 p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <span className="w-32 text-sm text-muted-foreground">
                        Languages
                      </span>
                      <span className="font-medium">
                        {item.quickFacts.languages}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* FAQ */}
          {item.faqs && item.faqs.length > 0 && (
            <section className="space-y-4">
              <SectionHeader>Frequently Asked Questions</SectionHeader>
              <Accordion type="single" collapsible className="w-full">
                {item.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border-b-0"
                  >
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

          {/* Alternatives */}
          {item.alternatives && item.alternatives.length > 0 && (
            <section className="space-y-4">
              <SectionHeader>Alternatives to {item.name}</SectionHeader>
              <p className="text-sm text-muted-foreground">
                Looking for a {item.name} alternative? Compare these curated AI
                tools that offer similar features and use cases.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {item.alternatives.map((alt) => (
                  <Link
                    key={alt._id}
                    href={`/item/${alt.slug?.current}`}
                    className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {alt.icon && (
                        <Image
                          src={urlForIcon(alt.icon)?.src || ""}
                          alt={alt.name || ""}
                          width={32}
                          height={32}
                          className="rounded object-cover"
                        />
                      )}
                      <h3 className="font-semibold group-hover:text-indigo-600">
                        {alt.name}
                      </h3>
                    </div>
                    {alt.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {alt.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="flex h-fit flex-col gap-6 lg:sticky lg:top-24">
          {/* Sponsor */}
          {sponsorItem && <SponsorItemCard item={sponsorItem} />}

          {/* Submit */}
          <div className="rounded-lg border p-5">
            <h3 className="font-semibold">Submit Your Tool</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Publish in {siteConfig.name} and earn public links to your primary
              website.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                Dofollow website backlinks on paid plans
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                Lifetime listing
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                Editor review within 72 hours
              </li>
            </ul>
            <Button asChild className="mt-4 w-full">
              <Link href="/submit">Submit Now</Link>
            </Button>
          </div>

          {/* Like / Report */}
          <div className="rounded-lg border">
            <div className="flex border-b">
              <button className="flex flex-1 items-center justify-center gap-2 py-3 text-sm hover:bg-muted/50">
                <Heart className="h-4 w-4" />
                Like
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 border-l py-3 text-sm hover:bg-muted/50">
                <Flag className="h-4 w-4" />
                Report
              </button>
            </div>
            <div className="flex">
              <button className="flex flex-1 items-center justify-center gap-2 py-3 text-sm hover:bg-muted/50">
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
              <div className="flex flex-1 items-center justify-center gap-2 border-l py-3 text-sm">
                <span className="text-xs text-muted-foreground">Share</span>
                <div className="flex items-center gap-1">
                  <Link
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(itemLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1 hover:bg-muted"
                  >
                    <Twitter className="h-3 w-3" />
                  </Link>
                  <button className="rounded p-1 hover:bg-muted">
                    <Share2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
