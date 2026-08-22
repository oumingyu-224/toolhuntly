import { buttonVariants } from "@/components/ui/button";
import { heroConfig } from "@/config/hero";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import HeroSearchBox from "./home-search-box";

/**
 * Huntify-style home hero:
 * badge pill → H1 (rotated brand highlight on "best") → subtitle →
 * search form + "Submit a tool" button → stats row.
 */
export default function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      {/* background glow: radial gradient ellipse, brand color → transparent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-[420px] max-w-4xl bg-[radial-gradient(ellipse_at_top,hsl(var(--brand)/0.25),transparent_65%)]"
      />

      <div className="relative flex flex-col items-center justify-center py-10 sm:py-14">
        <div className="flex max-w-5xl flex-col items-center gap-8 text-center">
          {/* badge pill */}
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground">
            {heroConfig.badge.text}
          </span>

          {/* H1 with rotated brand highlight */}
          <h1 className="max-w-4xl text-balance text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            {heroConfig.title.prefix}{" "}
            <span className="inline-block -rotate-2 rounded-md bg-brand px-2 text-brand-foreground">
              {heroConfig.title.highlight}
            </span>{" "}
            {heroConfig.title.suffix}
          </h1>

          <p className="max-w-3xl text-balance text-base text-muted-foreground">
            {heroConfig.subtitle}
          </p>

          {/* search + submit a tool */}
          <div className="flex w-full max-w-[560px] flex-col items-center gap-3 sm:flex-row">
            <div className="w-full flex-1">
              <HeroSearchBox />
            </div>
            <Link
              href="/submit"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full sm:w-auto rounded-full px-6",
              )}
            >
              Submit a tool
            </Link>
          </div>

          {/* stats row */}
          <dl className="mt-4 flex w-full max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {heroConfig.stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-0.5"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-bold text-foreground">
                  {stat.value}
                </dd>
                <dd className="text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
