"use client";

import { publish } from "@/actions/publish";
import { Icons } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { getPublishable } from "@/lib/submission";
import type { ItemInfo } from "@/types";
import { ArrowUpToLineIcon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import React from "react";
import { useTransition } from "react";
import { toast } from "sonner";

interface PublishButtonProps {
  item: ItemInfo;
}

export function PublishButton({ item }: PublishButtonProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePublishClick = async () => {
    const publishable = getPublishable(item);
    if (publishable) {
      await publishAction();
    } else {
      router.push(`/payment/${item._id}`);
    }
  };

  const publishAction = () => {
    startTransition(async () => {
      publish(item._id)
        .then((data) => {
          if (data.status === "success") {
            console.log("publishAction, success:", data.message);
            router.refresh();
            toast.success(data.message);
          }
          if (data.status === "error") {
            console.error("publishAction, error:", data.message);
            toast.error(data.message);
          }
        })
        .catch((error) => {
          console.error("publishAction, error:", error);
          toast.error(t("DashboardNS.failedToPublish"));
        });
    });
  };

  return (
    <Button
      variant="default"
      disabled={isPending}
      onClick={handlePublishClick}
      className="group overflow-hidden"
    >
      {isPending ? (
        <div className="flex items-center justify-center">
          <Icons.spinner className="mr-2 w-4 h-4 animate-spin" />
          <span>{t("DashboardNS.publish")}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <ArrowUpToLineIcon className="mr-2 w-4 h-4 icon-scale" />
          <span>{t("DashboardNS.publish")}</span>
        </div>
      )}
    </Button>
  );
}
