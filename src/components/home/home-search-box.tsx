"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { SearchIcon } from "lucide-react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { heroConfig } from "@/config/hero";

/**
 * Marketing-style hero search: submitting navigates to /search?q=<query>.
 * ⌘K (or Ctrl+K) focuses the input.
 */
export default function HeroSearchBox() {
  const t = useTranslations();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const q = String(data.get("q") || "").trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center"
      role="search"
    >
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          type="text"
          name="q"
          placeholder={t(heroConfig.search.placeholderKey)}
          autoComplete="off"
          className="h-12 pr-16 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary focus:border-2 focus:border-r-0"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
          {heroConfig.search.shortcut}
        </kbd>
      </div>
      <Button type="submit" className="rounded-l-none size-12 shrink-0">
        <SearchIcon className="size-6" aria-hidden="true" />
        <span className="sr-only">{t("Common.search")}</span>
      </Button>
    </form>
  );
}
