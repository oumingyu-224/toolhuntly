"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { CategoryListQueryResult } from "@/sanity.types";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import FilterItemDesktop from "../shared/filter-item-desktop";

export type CategoryListDesktopProps = {
  categoryList: CategoryListQueryResult;
};

export function CategoryListDesktop({
  categoryList,
}: CategoryListDesktopProps) {
  const t = useTranslations();
  const { slug } = useParams() as { slug?: string };

  return (
    <ScrollArea className="hidden md:flex w-full pb-4">
      <ul className="flex gap-x-2">
        <FilterItemDesktop title={t("Common.all")} href="/category" active={!slug} />

        {categoryList.map((item) => (
          <FilterItemDesktop
            key={item.slug.current}
            title={item.name}
            href={`/category/${item.slug.current}`}
            active={item.slug.current === slug}
          />
        ))}
      </ul>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
