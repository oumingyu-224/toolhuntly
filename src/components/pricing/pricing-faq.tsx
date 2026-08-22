import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqConfig } from "@/config/faq";
import { getTranslations } from "next-intl/server";

export async function PricingFaq() {
  const t = await getTranslations();

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqConfig.items.map((faqItem) => (
        <AccordionItem key={faqItem.id} value={faqItem.id}>
          <AccordionTrigger className="text-base">
            <div className="text-left w-full">
              {t(faqItem.questionKey)}
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground whitespace-pre-wrap">
            {t(faqItem.answerKey)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
