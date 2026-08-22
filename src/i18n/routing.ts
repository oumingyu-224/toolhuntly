import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "zh"],

  // Used when no locale matches
  defaultLocale: "en",

  // Always show a prefix for non-default locales,
  // but no prefix for the default locale (e.g. `/pricing` for en, `/zh/pricing` for zh)
  localePrefix: "as-needed",
});
