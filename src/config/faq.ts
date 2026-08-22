import type { FAQConfig } from "@/types";

/**
 * Data source for:
 *   1. The FAQ section on the home page ("4-4 区块").
 *   2. The `FAQPage` schema.org JSON-LD block injected into every page <head>.
 *
 * NOTE: keep answers in plain English text (no leading markdown bullets).
 * The FAQ UI / schema renderer handles formatting; the JSON-LD payloads
 * prefer plain strings for best search-engine compatibility.
 */
export const faqConfig: FAQConfig = {
  items: [
    {
      id: "item-1",
      question: "What is ToolHuntly?",
      answer:
        "ToolHuntly is a curated directory of the best AI tools. We help you discover, compare, and pick the right AI for any job — writing, image, video, coding, audio, and more.",
    },
    {
      id: "item-2",
      question: "How are tools curated?",
      answer:
        "Our editors hand-review every submission. We test the product, verify the claims, check output quality, and only list tools we'd actually recommend. No paid placement without editorial review.",
    },
    {
      id: "item-3",
      question: "Is ToolHuntly free to use?",
      answer:
        "Yes. Browsing and searching is completely free. You can filter by category, use-case, price, and rating without an account. Submitting a tool is free for the basic listing; paid options exist for priority review and sponsored spots.",
    },
    {
      id: "item-4",
      question: "How do I submit my tool?",
      answer:
        "Click Submit in the top navigation, fill in your tool's URL and short description, and we'll send it to editorial review. The free plan lists within 72 hours; Pro submissions go live immediately with extra benefits.",
    },
    {
      id: "item-5",
      question: "How often is the directory updated?",
      answer:
        "Daily. New tools are added every day, ratings are refreshed, pricing and feature data are continuously synced, and stale listings are removed when products are no longer available.",
    },
  ],
};
