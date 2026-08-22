import type { HeroConfig } from "@/types";

/**
 * Home hero copy (huntify-style). The highlight word "best" is rendered with
 * the rotated brand-color background in HomeHero.
 */
export const heroConfig: HeroConfig = {
  badge: {
    text: "Curated daily",
  },
  title: {
    prefix: "Discover the",
    highlight: "best",
    suffix: "AI tools & alternatives",
  },
  subtitle:
    "From writing to coding to images — filtered to only what works.",
  search: {
    placeholder: `Try "image generator" or "video api"...`,
    shortcut: "⌘K",
  },
  // Honest initial numbers — update once real data is available.
  stats: [
    { value: "1,200+", label: "tools listed" },
    { value: "45+", label: "categories" },
    { value: "Daily", label: "fresh picks" },
    { value: "80K+", label: "monthly visits" },
  ],
};
