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
      "Midjourney is the go-to AI image generator for artists, designers, and marketers — turning plain text prompts into stunning, high-resolution visuals in seconds. It is the most widely used AI art tool on the internet, with a huge community sharing prompts and workflows every day. The default quality bar is so high that it has become the benchmark every other image model is measured against.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=midjourney.com",
    href: "https://www.midjourney.com",
  },
  {
    name: "Claude",
    tier: "PRO",
    category: "Writing & Chat",
    domain: "claude.ai",
    description:
      "Claude is Anthropic's flagship AI assistant, built for writing, analysis, and coding with a 1M-token context window — it can read an entire book in one go. It is widely praised for careful, nuanced responses and strong reasoning on long documents. Teams use it every day for drafting, research, and refactoring large codebases.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=claude.ai",
    href: "https://claude.ai",
  },
  {
    name: "Canva",
    tier: "BASIC",
    category: "Image & Design",
    domain: "canva.com",
    description:
      "Canva pairs a drag-and-drop design editor with an AI-powered magic studio, so anyone can create social posts, decks, posters, and videos without design training. Magic Write, background remover, and one-click brand kits turn rough ideas into polished visuals in minutes. With millions of templates, it is the fastest way to look professional.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=canva.com",
    href: "https://www.canva.com",
  },
  {
    name: "Grammarly",
    tier: "FREE",
    category: "Writing & Text",
    domain: "grammarly.com",
    description:
      "Grammarly is the AI writing assistant that checks grammar, spelling, tone, and clarity in real time across your browser, docs, and email. Beyond basic corrections, it offers AI-generated rewrites, tone adjustments, and full-document summaries. The free tier alone catches the mistakes that hurt most casual writing.",
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Featured AI tools</h2>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          A snapshot of the tools our readers reach for most — from sponsored
          partners with priority placement to solid everyday picks. Every card
          below is a real product we stand behind, updated as the landscape
          changes.
        </p>
      </div>

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
