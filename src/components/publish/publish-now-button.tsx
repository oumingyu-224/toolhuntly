"use client";

import { publish } from "@/actions/publish";
import { Icons } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { ItemInfo } from "@/types";
import confetti from "canvas-confetti";
import { RocketIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { triggerConfetti } from "../shared/confetti-effect";

interface PublishNowButtonProps {
  item: ItemInfo;
}

export function PublishNowButton({ item }: PublishNowButtonProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const publishAction = () => {
    startTransition(async () => {
      publish(item._id)
        .then((data) => {
          if (data.status === "success") {
            console.log("publishAction, success:", data.message);
            triggerConfetti();
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
          toast.error(t("Publish.failedToPublish"));
        });
    });
  };

  return (
    <Button
      size="lg"
      variant="default"
      className="w-full group overflow-hidden"
      disabled={isPending}
      onClick={publishAction}
    >
      {isPending ? (
        <div className="flex items-center justify-center">
          <Icons.spinner className="mr-2 size-4 animate-spin" />
          <span>{t("Publish.publishing")}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <RocketIcon className="mr-2 size-4 icon-scale" />
          <span>{t("Publish.publishNow")}</span>
        </div>
      )}
    </Button>
  );
}
