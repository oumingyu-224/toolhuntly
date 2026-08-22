import type { FooterConfig } from "@/types";

export const footerConfig: FooterConfig = {
  links: [
    {
      title: "Footer.product",
      items: [
        { title: "Footer.search", href: "/search" },
        { title: "Footer.collection", href: "/collection" },
        { title: "Footer.category", href: "/category" },
        { title: "Footer.tag", href: "/tag" },
      ],
    },
    {
      title: "Footer.resources",
      items: [
        { title: "Footer.blog", href: "/blog" },
        { title: "Footer.pricing", href: "/pricing" },
        { title: "Footer.submit", href: "/submit" },
        { title: "Footer.studio", href: "/studio", external: true },
      ],
    },
    {
      title: "Footer.pages",
      items: [
        { title: "Footer.home2", href: "/home2" },
        { title: "Footer.home3", href: "/home3" },
        { title: "Footer.collection1", href: "/collection/the-best-google-analytics-alternatives-in-2024" },
        { title: "Footer.collection2", href: "/collection/the-best-alternatives-to-semrush-in-2024" },
      ],
    },
    {
      title: "Footer.company",
      items: [
        { title: "Footer.aboutUs", href: "/about" },
        { title: "Footer.privacyPolicy", href: "/privacy" },
        { title: "Footer.termsOfService", href: "/terms" },
        { title: "Footer.sitemap", href: "/sitemap.xml" },
      ],
    },
  ],
};
