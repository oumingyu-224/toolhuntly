import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import type { GroupListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { groupListQuery } from "@/sanity/lib/queries";

export const metadata = constructMetadata({
  title: "All AI Tool Categories",
  description: "Browse the full directory of AI tools by category",
  canonicalUrl: `${siteConfig.url}/category`,
});

export default async function CategoryIndexPage() {
  const groups =
    (await sanityFetch<GroupListQueryResult>({
      query: groupListQuery,
    })) || [];

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group._id}>
          <h2 className="mb-4 text-2xl font-bold">{group.name}</h2>

          {group.categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {group.categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug?.current}`}
                  className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No categories yet</p>
          )}
        </section>
      ))}
    </div>
  );
}
