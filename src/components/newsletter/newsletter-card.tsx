"use client";

import { useTranslations } from "next-intl";
import { HeaderSection } from "../shared/header-section";
import { NewsletterForm } from "./newsletter-form";

export function NewsletterCard() {
  const t = useTranslations();
  return (
    <div className="w-full px-4 py-8 md:p-12 bg-muted rounded-lg">
      <div className="flex flex-col items-center justify-center gap-8">
        <HeaderSection
          id="newsletter"
          labelAs="h2"
          label={t("Newsletter.label")}
          title={t("Newsletter.title")}
          titleAs="h3"
          subtitle={t("Newsletter.subtitle")}
        />

        <NewsletterForm />
      </div>
    </div>
  );
}
