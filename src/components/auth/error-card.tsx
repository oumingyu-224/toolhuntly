import { AuthCard } from "@/components/auth/auth-card";
import { getTranslations } from "next-intl/server";
import { TriangleAlertIcon } from "lucide-react";

export async function ErrorCard() {
  const t = await getTranslations();
  return (
    <AuthCard
      headerLabel={t("Auth.somethingWentWrongExclamation")}
      bottomButtonHref="/auth/login"
      bottomButtonLabel={t("Auth.backToLogin")}
      className="border-none"
    >
      <div className="w-full flex justify-center items-center py-4 gap-2">
        <TriangleAlertIcon className="text-destructive size-4" />
        <p className="font-medium text-destructive">{t("Auth.pleaseTryAgain")}</p>
      </div>
    </AuthCard>
  );
}
