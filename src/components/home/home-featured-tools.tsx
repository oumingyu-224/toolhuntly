import { cn } from "@/lib/utils";

type FeaturedTier = "Sponsored" | "PRO" | "BASIC" | "FREE";

type FeaturedTool = {
  name: string;
  tier: FeaturedTier;
  category: string;
  domain: string;
  description: string;
  logo: string;
  href: string;
};

/**
 * Home "Featured tools" tiered cards (huntify-style paid tier showcase).
 * 4 cards → 4 tiers, each with distinct border / background / badge / divider.
 */
const featuredTools: FeaturedTool[] = [
  {
    name: "Midjourney",
    tier: "Sponsored",
    category: "Image & Design",
    domain: "midjourney.com",
    description:
      "Generate stunning, high-quality images from text prompts with the most popular AI art generator.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=midjourney.com",
    href: "https://www.midjourney.com",
  },
  {
    name: "Claude",
    tier: "PRO",
    category: "Writing & Chat",
    domain: "claude.ai",
    description:
      "Anthropic's AI assistant for writing, analysis, and coding with a 1M-token context window.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=claude.ai",
    href: "https://claude.ai",
  },
  {
    name: "Canva",
    tier: "BASIC",
    category: "Image & Design",
    domain: "canva.com",
    description:
      "Drag-and-drop design tool with AI-powered magic studio for social posts, decks, and more.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=canva.com",
    href: "https://www.canva.com",
  },
  {
    name: "Grammarly",
    tier: "FREE",
    category: "Writing & Text",
    domain: "grammarly.com",
    description:
      "AI writing assistant that checks grammar, tone, and clarity across the web.",
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

export default function HomeFeaturedTools() {
  return (
    <section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featuredTools.map((tool) => {
          const style = tierStyles[tool.tier];
          return (
            <a
              key={tool.name}
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
                    {tool.category}
                  </p>
                </div>
              </div>

              {/* description */}
              <p className="mt-3 flex-1 text-sm text-muted-foreground line-clamp-3">
                {tool.description}
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
                  Try it
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
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
