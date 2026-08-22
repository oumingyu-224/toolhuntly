import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as "en" | "zh-CN")) {
    locale = routing.defaultLocale;
  }

  // Message files keep short names (en.json / zh.json) while the locale
  // code is the BCP 47 tag (en / zh-CN).
  const messagesFile = locale === "zh-CN" ? "zh" : locale;

  return {
    locale,
    messages: (await import(`../../messages/${messagesFile}.json`)).default,
  };
});
