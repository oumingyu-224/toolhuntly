import { Link } from "@/i18n/navigation";
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";

type RankingTool = {
  name: string;
  domain: string;
  href: string;
  logo: string;
};

type RankingCategory = {
  title: string;
  tools: RankingTool[];
};

/**
 * Home "Find your tool by use case" ranking (huntify-style).
 * 4 columns × 5 tools each; tool rows link out to their site.
 */
const rankingCategories: RankingCategory[] = [
  {
    title: "Writing & Text",
    tools: [
      {
        name: "DeepL",
        domain: "deepl.com",
        href: "https://www.deepl.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=deepl.com",
      },
      {
        name: "QuillBot",
        domain: "quillbot.com",
        href: "https://quillbot.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=quillbot.com",
      },
      {
        name: "Sudowrite",
        domain: "sudowrite.com",
        href: "https://www.sudowrite.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=sudowrite.com",
      },
      {
        name: "Writer",
        domain: "writer.com",
        href: "https://writer.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=writer.com",
      },
      {
        name: "Grammarly",
        domain: "grammarly.com",
        href: "https://www.grammarly.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=grammarly.com",
      },
    ],
  },
  {
    title: "Image & Design",
    tools: [
      {
        name: "Midjourney",
        domain: "midjourney.com",
        href: "https://www.midjourney.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=midjourney.com",
      },
      {
        name: "Canva",
        domain: "canva.com",
        href: "https://www.canva.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=canva.com",
      },
      {
        name: "Stable Diffusion",
        domain: "stability.ai",
        href: "https://stability.ai",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=stability.ai",
      },
      {
        name: "Leonardo",
        domain: "leonardo.ai",
        href: "https://leonardo.ai",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=leonardo.ai",
      },
      {
        name: "DALL·E 3",
        domain: "openai.com",
        href: "https://openai.com/dall-e-3",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=openai.com",
      },
    ],
  },
  {
    title: "Video & Audio",
    tools: [
      {
        name: "Runway",
        domain: "runwayml.com",
        href: "https://runwayml.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=runwayml.com",
      },
      {
        name: "HeyGen",
        domain: "heygen.com",
        href: "https://www.heygen.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=heygen.com",
      },
      {
        name: "ElevenLabs",
        domain: "elevenlabs.io",
        href: "https://elevenlabs.io",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=elevenlabs.io",
      },
      {
        name: "Suno",
        domain: "suno.com",
        href: "https://suno.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=suno.com",
      },
      {
        name: "Descript",
        domain: "descript.com",
        href: "https://www.descript.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=descript.com",
      },
    ],
  },
  {
    title: "Code & Data",
    tools: [
      {
        name: "GitHub Copilot",
        domain: "github.com",
        href: "https://github.com/features/copilot",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=github.com",
      },
      {
        name: "Cursor",
        domain: "cursor.com",
        href: "https://cursor.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=cursor.com",
      },
      {
        name: "Replit",
        domain: "replit.com",
        href: "https://replit.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=replit.com",
      },
      {
        name: "Vercel",
        domain: "vercel.com",
        href: "https://vercel.com",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=vercel.com",
      },
      {
        name: "Claude",
        domain: "claude.ai",
        href: "https://claude.ai",
        logo: "https://www.google.com/s2/favicons?sz=32&domain=claude.ai",
      },
    ],
  },
];

export default function HomeCategoryRanking() {
  return (
    <section>
      {/* section header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Find your tool by use case
          </h2>
          <p className="text-muted-foreground">
            Top-ranked picks in the categories people search most
          </p>
        </div>
        <Link
          href="/category"
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-foreground"
        >
          All categories
          <ArrowRightIcon
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="grid gap-9 sm:grid-cols-2 xl:grid-cols-4">
        {rankingCategories.map((category) => (
          <div key={category.title}>
            <h3 className="border-b-[1.5px] border-foreground pb-3 text-center text-lg font-semibold">
              {category.title}
            </h3>

            <ol className="mt-2 flex flex-col">
              {category.tools.map((tool, index) => (
                <li key={tool.name}>
                  <a
                    href={tool.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 rounded-md py-2 transition-[padding] hover:pl-2.5"
                  >
                    {/* rank number */}
                    <span className="w-4 shrink-0 text-right font-bold text-foreground/40">
                      {index + 1}
                    </span>
                    {/* favicon */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tool.logo}
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                      className="size-6 shrink-0 rounded-[7px] bg-muted object-contain"
                    />
                    {/* name */}
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {tool.name}
                    </span>
                    {/* chevron */}
                    <ChevronRightIcon
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                    />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
