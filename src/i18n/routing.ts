import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "zh-CN"],

  // Used when no locale matches
  defaultLocale: "en",

  // Always show a prefix for non-default locales,
  // but no prefix for the default locale (e.g. `/pricing` for en, `/zh-CN/pricing` for zh)
  localePrefix: "as-needed",
});

/**
 * Map next-intl locale codes to BCP 47 language tags used for
 * `<html lang>` and hreflang declarations.
 */
export const localeToLangTag: Record<string, string> = {
  en: "en",
  "zh-CN": "zh-CN",
};

/**
 * Map next-intl locale codes to OpenGraph locale values.
 */
export const localeToOgLocale: Record<string, string> = {
  en: "en_US",
  "zh-CN": "zh_CN",
};
