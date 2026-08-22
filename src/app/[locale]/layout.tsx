import "@/styles/globals.css";

import {
  fontBricolageGrotesque as fontBricolage,
  fontSourceSans,
  fontSourceSerif,
  fontWorkSans,
} from "@/assets/fonts";
import { auth } from "@/auth";
import { Analytics } from "@/components/analytics/analytics";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import {
  buildFAQPageJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from "@/lib/seo-schema";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";

export const metadata = constructMetadata();

// Enable static rendering for all locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = params;

  // Ensure that the incoming locale is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // https://youtu.be/1MTyCvS05V4?t=21464
  const session = await auth();
  const messages = await getMessages();
  const t = await getTranslations();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 8. Organization schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildOrganizationJsonLd()),
          }}
        />
        {/* 9. WebSite + SearchAction JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildWebSiteJsonLd()),
          }}
        />
        {/* 10. FAQPage JSON-LD (data source for 4-4 home section too) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildFAQPageJsonLd(t)),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontBricolage.className,
          // fontSourceSans.className,
          // fontSourceSerif.className,
          // fontWorkSans.className,
          fontSourceSerif.variable,
          fontSourceSans.variable,
          fontWorkSans.variable,
          fontBricolage.variable,
        )}
      >
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}

              {/* https://sonner.emilkowal.ski/toaster */}
              <Toaster richColors position="top-right" offset={64} />

              <TailwindIndicator />

              <Analytics />
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
