import type { MarketingConfig } from "@/types";

export const marketingConfig: MarketingConfig = {
  menus: [
    {
      title: "Marketing.search",
      href: "/search",
      icon: "search",
    },
    {
      title: "Marketing.collection",
      href: "/collection",
      icon: "collection",
    },
    {
      title: "Marketing.category",
      href: "/category",
      icon: "category",
    },
    {
      title: "Marketing.tag",
      href: "/tag",
      icon: "tag",
    },
    {
      title: "Marketing.blog",
      href: "/blog",
      icon: "blog",
    },
    {
      title: "Marketing.pricing",
      href: "/pricing",
      icon: "pricing",
    },
    {
      title: "Marketing.studio",
      href: "/admin",
      icon: "studio",
      external: true,
    },
  ],
};
