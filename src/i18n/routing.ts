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

/**
 * Map next-intl locale codes to BCP 47 language tags used for
 * `<html lang>` and hreflang declarations (e.g. `zh` -> `zh-CN`).
 */
export const localeToLangTag: Record<string, string> = {
  en: "en",
  zh: "zh-CN",
};

/**
 * Map next-intl locale codes to OpenGraph locale values (e.g. `zh` -> `zh_CN`).
 */
export const localeToOgLocale: Record<string, string> = {
  en: "en_US",
  zh: "zh_CN",
};
