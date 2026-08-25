import Container from "@/components/container";
import { PricingPlans } from "@/components/dashboard/pricing-plans";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { HeaderSection } from "@/components/shared/header-section";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Pricing");
  return constructMetadata({
    title: t("pageTitle"),
    description: t("pageDescription"),
    canonicalUrl: `${siteConfig.url}/pricing`,
  });
}

export default async function PricingPage() {
  const t = await getTranslations();

  return (
    <Container className="mt-8 pb-16">
      <div className="w-full flex flex-col gap-16">
        <section className="w-full flex flex-col gap-8 justify-center">
          <HeaderSection
            labelAs="h1"
            label={t("Pricing.pageTitle")}
            titleAs="h2"
            title={t("Pricing.choosePlan")}
          />

          <div className="w-full mx-auto">
            <PricingPlans />
          </div>

          {/* add tips only for demo directory website */}
          {siteConfig.name === "Directory" && (
            <p className="text-center text-sm text-muted-foreground leading-normal">
              {t("Pricing.testNotice1")}
              <br />
              {t("Pricing.testNotice2")}
              <br />
              {t("Pricing.testNotice3")}
            </p>
          )}
        </section>

        <section className="w-full flex flex-col gap-8 justify-center">
          <HeaderSection
            label={t("Pricing.faq")}
            titleAs="h2"
            title={t("Home.faq.title")}
          />

          <div className="w-full max-w-4xl mx-auto">
            <PricingFaq />
          </div>
        </section>
      </div>
    </Container>
  );
}
