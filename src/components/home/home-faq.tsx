"use client";

import { faqConfig } from "@/config/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Home FAQ section. Renders the same Q&A data as the FAQPage JSON-LD
 * (config/faq.ts) so UI and structured data stay in sync.
 */
export default function HomeFaq() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
        Frequently Asked Questions
      </h2>

      <Accordion type="single" collapsible className="w-full">
        {faqConfig.items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left font-semibold">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
