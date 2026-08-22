"use client";

import { faqConfig } from "@/config/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

/**
 * Home FAQ section. Renders the same translated Q&A data (via faqConfig keys)
 * as the FAQPage JSON-LD, so UI and structured data stay in sync per locale.
 */
export default function HomeFaq() {
  const t = useTranslations();

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
        {t("Home.faq.title")}
      </h2>

      <Accordion type="single" collapsible className="w-full">
        {faqConfig.items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left font-semibold">
              {t(item.questionKey)}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {t(item.answerKey)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
