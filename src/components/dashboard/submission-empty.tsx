import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { UploadIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

export async function EmptySubmission() {
  const t = await getTranslations();
  return (
    <EmptyPlaceholder>
      <EmptyPlaceholder.Icon name="submit" className="size-8" />
      <EmptyPlaceholder.Title>{t("DashboardNS.noSubmissions")}</EmptyPlaceholder.Title>
      <EmptyPlaceholder.Description>
        {t("DashboardNS.noSubmissionsDescription")}
      </EmptyPlaceholder.Description>
      <Button asChild size="lg" className="group whitespace-nowrap">
        <Link
          href="/submit"
          prefetch={false}
          className="flex items-center justify-center space-x-2"
        >
          <UploadIcon className="w-4 h-4" />
          <span>{t("Common.submit")}</span>
        </Link>
      </Button>
    </EmptyPlaceholder>
  );
}
