import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import type { GroupListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { groupListQuery } from "@/sanity/lib/queries";
import {
  Plug2,
  ShieldCheck,
  ImageIcon,
  Video,
  Mic,
  Zap,
  PenLine,
  Code2,
  Heart,
  Megaphone,
  GraduationCap,
  Bot,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "All AI Tool Categories",
  description: "Browse the full directory of AI tools by category",
  canonicalUrl: `${siteConfig.url}/category`,
});

const iconMap: Record<string, LucideIcon> = {
  "api": Plug2,
  "proxy": Plug2,
  "detection": ShieldCheck,
  "detect": ShieldCheck,
  "image": ImageIcon,
  "design": ImageIcon,
  "photo": ImageIcon,
  "video": Video,
  "voice": Mic,
  "audio": Mic,
  "productivity": Zap,
  "writing": PenLine,
  "text": PenLine,
  "coding": Code2,
  "development": Code2,
  "code": Code2,
  "life": Heart,
  "assistant": Bot,
  "marketing": Megaphone,
  "advertising": Megaphone,
  "education": GraduationCap,
  "learning": GraduationCap,
  "education & learning": GraduationCap,
  "marketing & advertising": Megaphone,
  "coding & development": Code2,
  "writing & text": PenLine,
  "voice & audio": Mic,
  "image & design": ImageIcon,
  "life assistant": Heart,
  "ai detection": ShieldCheck,
  "api & proxy": Plug2,
};

const colorMap: Record<string, string> = {
  "api & proxy": "text-emerald-500",
  "ai detection": "text-emerald-500",
  "image & design": "text-pink-500",
  "video": "text-red-500",
  "voice & audio": "text-purple-500",
  "productivity": "text-amber-500",
  "writing & text": "text-blue-500",
  "coding & development": "text-cyan-500",
  "life assistant": "text-rose-500",
  "marketing & advertising": "text-orange-500",
  "education & learning": "text-indigo-500",
};

function getIconForGroup(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (iconMap[lower]) return iconMap[lower];
  for (const key of Object.keys(iconMap)) {
    if (lower.includes(key)) return iconMap[key];
  }
  return Sparkles;
}

function getColorForGroup(name: string): string {
  const lower = name.toLowerCase();
  if (colorMap[lower]) return colorMap[lower];
  for (const key of Object.keys(colorMap)) {
    if (lower.includes(key)) return colorMap[key];
  }
  return "text-foreground";
}

function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type CategoryWithCount = GroupListQueryResult[number]["categories"][number] & {
  count?: number;
};

type GroupWithCount = Omit<GroupListQueryResult[number], "categories"> & {
  categories: CategoryWithCount[];
};

export default async function CategoryIndexPage() {
  const groups =
    ((await sanityFetch<GroupWithCount[]>({
      query: groupListQuery,
    })) as GroupWithCount[]) || [];

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          All AI Tool Categories
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Browse the full directory of AI tools by category — from writing and image generation to coding, video, and chat. Find the right AI tool for any task.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Left sidebar - Group navigation */}
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="sticky top-24 flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {groups.map((group) => {
              const groupId = slugifyId(group.name || "");
              const Icon = getIconForGroup(group.name || "");
              const iconColor = getColorForGroup(group.name || "");
              return (
                <Link
                  key={group._id}
                  href={`/category#${groupId}`}
                  className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:rounded-lg"
                >
                  <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
                  <span className="whitespace-nowrap">{group.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Right content - Groups with categories */}
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          {groups.map((group) => {
            const groupId = slugifyId(group.name || "");
            const Icon = getIconForGroup(group.name || "");
            const iconColor = getColorForGroup(group.name || "");
            return (
              <section key={group._id} id={groupId} className="scroll-mt-24">
                <Link
                  href={`/category#${groupId}`}
                  className="mb-4 flex items-center gap-3 border-b pb-3 transition-colors hover:text-foreground/80"
                >
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                  <h2 className="text-xl font-bold md:text-2xl">
                    {group.name}
                  </h2>
                </Link>

                {group.categories.length > 0 ? (
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                    {group.categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/category/${category.slug?.current}`}
                        className="group flex items-center gap-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className="truncate transition-colors group-hover:text-foreground">
                          {category.name}
                        </span>
                        <span
                          className="h-px flex-1 border-t border-dashed border-muted-foreground/30"
                          aria-hidden="true"
                        />
                        <span className="shrink-0 tabular-nums text-muted-foreground/70">
                          {category.count ?? 0}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No categories yet</p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
