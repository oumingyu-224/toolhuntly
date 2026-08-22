import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

type FeaturedTier = "Sponsored" | "PRO" | "BASIC" | "FREE";

type FeaturedTool = {
  id: string;
  name: string;
  tier: FeaturedTier;
  categoryKey: string;
  domain: string;
  descriptionKey: string;
  logo: string;
  href: string;
};

/**
 * Home "Featured tools" tiered cards (huntify-style paid tier showcase).
 * 4 cards → 4 tiers, each with distinct border / background / badge / divider.
 * Category + description text is translated via message keys (Home.featured.*).
 */
const featuredTools: FeaturedTool[] = [
  {
    id: "midjourney",
    name: "Midjourney",
    tier: "Sponsored",
    categoryKey: "Home.featured.category.imageDesign",
    domain: "midjourney.com",
    descriptionKey: "Home.featured.tools.midjourney.desc",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=midjourney.com",
    href: "https://www.midjourney.com",
  },
  {
    id: "claude",
    name: "Claude",
    tier: "PRO",
    categoryKey: "Home.featured.category.writingChat",
    domain: "claude.ai",
    descriptionKey: "Home.featured.tools.claude.desc",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=claude.ai",
    href: "https://claude.ai",
  },
  {
    id: "canva",
    name: "Canva",
    tier: "BASIC",
    categoryKey: "Home.featured.category.imageDesign",
    domain: "canva.com",
    descriptionKey: "Home.featured.tools.canva.desc",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=canva.com",
    href: "https://www.canva.com",
  },
  {
    id: "grammarly",
    name: "Grammarly",
    tier: "FREE",
    categoryKey: "Home.featured.category.writingText",
    domain: "grammarly.com",
    descriptionKey: "Home.featured.tools.grammarly.desc",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=grammarly.com",
    href: "https://www.grammarly.com",
  },
];

const tierStyles: Record<
  FeaturedTier,
  { card: string; badge: string; divider: string }
> = {
  Sponsored: {
    card: "border-brand bg-[#fbfde9]",
    badge: "bg-brand text-brand-foreground",
    divider: "border-brand/40",
  },
  PRO: {
    card: "border bg-card",
    badge: "bg-primary text-brand",
    divider: "border-border",
  },
  BASIC: {
    card: "border bg-card",
    badge: "bg-accent text-accent-foreground",
    divider: "border-border",
  },
  FREE: {
    card: "border bg-card",
    badge: "bg-secondary text-secondary-foreground",
    divider: "border-border",
  },
};

export default async function HomeFeaturedTools() {
  const t = await getTranslations();

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl font-bold sm:text-3xl">
          {t("Home.featured.title")}
        </h2>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          {t("Home.featured.intro")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featuredTools.map((tool) => {
          const style = tierStyles[tool.tier];
          return (
            <a
              key={tool.id}
              href={tool.href}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "group flex flex-col rounded-xl border p-4 transition-transform hover:-translate-y-[3px]",
                style.card,
              )}
            >
              {/* top: logo + name + badge */}
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  width={50}
                  height={50}
                  loading="lazy"
                  className="size-[50px] rounded-lg border border-border bg-background object-contain"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold">{tool.name}</h3>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        style.badge,
                      )}
                    >
                      {tool.tier}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {t(tool.categoryKey)}
                  </p>
                </div>
              </div>

              {/* description */}
              <p className="mt-3 flex-1 text-sm text-muted-foreground line-clamp-3">
                {t(tool.descriptionKey)}
              </p>

              {/* footer: domain + CTA */}
              <div
                className={cn(
                  "mt-4 flex items-center justify-between gap-2 border-t pt-3",
                  style.divider,
                )}
              >
                <span className="truncate text-sm text-muted-foreground">
                  {tool.domain}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-foreground">
                  {t("Home.featured.try")}
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
