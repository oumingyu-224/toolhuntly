"use client";

import { urlForIcon, urlForImage } from "@/lib/image";
import { cn, getItemTargetLinkInWebsite } from "@/lib/utils";
import type { ItemInfo } from "@/types";
import { AwardIcon, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "../ui/skeleton";

type ItemCard2Props = {
  item: ItemInfo;
};

function extractDomain(url?: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * ItemCard2 shows item cover image with hover visit overlay + icon/name/domain row
 */
export default function ItemCard2({ item }: ItemCard2Props) {
  const t = useTranslations();
  const imageProps = item?.image ? urlForImage(item.image) : null;
  const imageBlurDataURL = item?.image?.blurDataURL || null;
  const iconProps = item?.icon ? urlForIcon(item.icon) : null;
  const iconBlurDataURL = item?.icon?.blurDataURL || null;

  const itemDetailUrl = `/item/${item.slug.current}`;
  const itemLink = getItemTargetLinkInWebsite(item);
  const domain = extractDomain(item.link || item.affiliateLink);

  return (
    <div
      className={cn(
        "group/card flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/30",
      )}
    >
      {/* 预览图区域 */}
      <Link
        href={itemDetailUrl}
        className="relative block overflow-hidden rounded-t-xl border-b"
        prefetch={false}
      >
        <div className="relative aspect-[16/9] w-full bg-muted/30">
          {imageProps ? (
            <>
              <Image
                src={imageProps.src}
                alt={item.image.alt || t("Item.imageAlt", { name: item.name })}
                title={item.image.alt || t("Item.imageAlt", { name: item.name })}
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover/card:scale-105"
                {...(imageBlurDataURL && {
                  placeholder: "blur",
                  blurDataURL: imageBlurDataURL,
                })}
              />
              {/* 遮罩层 + 访问按钮 */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover/card:bg-black/40">
                <Link
                  href={itemLink}
                  target="_blank"
                  prefetch={false}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/90 group-hover/card:opacity-100"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("Item.visitWebsite")}
                </Link>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {iconProps ? (
                <Image
                  src={iconProps.src}
                  alt={item.icon.alt || `icon of ${item.name}`}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover opacity-60"
                  {...(iconBlurDataURL && {
                    placeholder: "blur",
                    blurDataURL: iconBlurDataURL,
                  })}
                />
              ) : (
                <div className="text-xs text-muted-foreground">No preview</div>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* 下方内容区 */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* 图标 + 名称 + 域名 + 访问按钮 */}
        <div className="flex items-center justify-between gap-3">
          <Link href={itemDetailUrl} className="flex min-w-0 items-center gap-3">
            {iconProps ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white">
                <Image
                  src={iconProps.src}
                  alt={item.icon.alt || `icon of ${item.name}`}
                  width={28}
                  height={28}
                  className="rounded object-cover"
                  {...(iconBlurDataURL && {
                    placeholder: "blur",
                    blurDataURL: iconBlurDataURL,
                  })}
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                <AwardIcon className="h-5 w-5 text-muted-foreground/60" />
              </div>
            )}
            <div className="min-w-0 flex flex-col">
              <h3
                className={cn(
                  "truncate text-base font-semibold",
                  item.featured && "text-gradient_indigo-purple font-bold",
                )}
              >
                {item.featured && (
                  <AwardIcon className="mr-1 inline-block h-4 w-4 -translate-y-0.5 text-indigo-500" />
                )}
                {item.name}
              </h3>
              {domain && (
                <span className="truncate text-xs text-muted-foreground">
                  {domain}
                </span>
              )}
            </div>
          </Link>

          <Link
            href={itemLink}
            target="_blank"
            prefetch={false}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <span>访问</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </div>

        {/* 描述 */}
        {item.description && (
          <Link href={itemDetailUrl} className="block">
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}

export function ItemCard2Skeleton() {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-xl border bg-card p-0">
      <Skeleton className="w-full aspect-[16/9] rounded-b-none" />
      <div className="flex items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <div className="space-y-1 px-4 pb-4">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>
    </div>
  );
}
