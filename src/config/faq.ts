import type { FAQConfig } from "@/types";

/**
 * Data source for:
 *   1. The FAQ section on the home page.
 *   2. The `FAQPage` schema.org JSON-LD block injected into every page <head>.
 *
 * The question/answer text lives in the i18n messages (Home.faq.items.*) so
 * both the UI and the JSON-LD render the same translated copy per locale.
 */
export const faqConfig: FAQConfig = {
  items: [
    {
      id: "item-1",
      questionKey: "Home.faq.items.item-1.question",
      answerKey: "Home.faq.items.item-1.answer",
    },
    {
      id: "item-2",
      questionKey: "Home.faq.items.item-2.question",
      answerKey: "Home.faq.items.item-2.answer",
    },
    {
      id: "item-3",
      questionKey: "Home.faq.items.item-3.question",
      answerKey: "Home.faq.items.item-3.answer",
    },
    {
      id: "item-4",
      questionKey: "Home.faq.items.item-4.question",
      answerKey: "Home.faq.items.item-4.answer",
    },
    {
      id: "item-5",
      questionKey: "Home.faq.items.item-5.question",
      answerKey: "Home.faq.items.item-5.answer",
    },
  ],
};
