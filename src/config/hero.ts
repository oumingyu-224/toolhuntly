import type { HeroConfig } from "@/types";

/**
 * Home hero copy, stored as next-intl message keys (Home.hero.*) so the hero
 * renders in the active locale. The highlight word ("best") is rendered with
 * the rotated brand-color background in HomeHero.
 */
export const heroConfig: HeroConfig = {
  badgeKey: "Home.hero.badge",
  title: {
    prefixKey: "Home.hero.title.prefix",
    highlightKey: "Home.hero.title.highlight",
    suffixKey: "Home.hero.title.suffix",
  },
  subtitleKey: "Home.hero.subtitle",
  introKeys: [
    "Home.hero.intro1",
    "Home.hero.intro2",
    "Home.hero.intro3",
  ],
  search: {
    placeholderKey: "Home.hero.searchPlaceholder",
    shortcut: "⌘K",
  },
  submitKey: "Home.hero.submit",
  // Honest initial numbers — update once real data is available.
  stats: [
    { valueKey: "Home.hero.stats.toolsValue", labelKey: "Home.hero.stats.toolsLabel" },
    { valueKey: "Home.hero.stats.categoriesValue", labelKey: "Home.hero.stats.categoriesLabel" },
    { valueKey: "Home.hero.stats.dailyValue", labelKey: "Home.hero.stats.dailyLabel" },
    { valueKey: "Home.hero.stats.visitsValue", labelKey: "Home.hero.stats.visitsLabel" },
  ],
};
