"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function AllPostsButton() {
  const t = useTranslations();
  return (
    <Button
      size="lg"
      variant="outline"
      className="inline-flex items-center gap-2 group"
      asChild
    >
      <Link href="/blog" prefetch={false}>
        <ArrowLeftIcon
          className="w-5 h-5 
                    transition-transform duration-200 group-hover:-translate-x-1"
        />
        <span>{t("Blog.allPosts")}</span>
      </Link>
    </Button>
  );
}
