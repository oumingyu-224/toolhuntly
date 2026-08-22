"use client";

import { submitToReview } from "@/actions/submit-to-review";
import { Icons } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { FreePlanStatus } from "@/lib/submission";
import { cn } from "@/lib/utils";
import type { ItemInfo } from "@/types";
import {
  ArrowRightIcon,
  ArrowUpLeftIcon,
  CheckCircleIcon,
  EditIcon,
  SendIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

interface FreePlanButtonProps {
  item?: ItemInfo;
  className?: string;
}

export function FreePlanButton({ item, className }: FreePlanButtonProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  // console.log('FreePlanButton, item:', item);

  const submitToReviewAction = () => {
    startTransition(async () => {
      submitToReview(item._id)
        .then((data) => {
          if (data.status === "success") {
            console.log("submitToReviewAction, success:", data.message);
            router.refresh();
            toast.success(t("Payment.submittedToReviewSuccess"));
          }
          if (data.status === "error") {
            console.error("submitToReviewAction, error:", data.message);
            toast.error(data.message);
          }
        })
        .catch((error) => {
          console.error("submitToReviewAction, error:", error);
          toast.error(t("Payment.failedToSubmitToReview"));
        });
    });
  };

  const handleClick = () => {
    console.log(
      "FreePlanButton, handleClick, item.freePlanStatus:",
      item?.freePlanStatus,
    );
    if (!item) {
      // no specific item in pricing page
      router.push("/submit");
    } else if (item.publishDate) {
      // already published
      router.push("/dashboard");
    } else if (item.freePlanStatus === FreePlanStatus.SUBMITTING) {
      submitToReviewAction();
    } else if (item.freePlanStatus === FreePlanStatus.APPROVED) {
      router.push(`/publish/${item._id}`);
    } else if (item.freePlanStatus === FreePlanStatus.REJECTED) {
      router.push(`/edit/${item._id}`);
    } else if (item.freePlanStatus === FreePlanStatus.PENDING) {
      router.push("/dashboard");
    } else {
      console.error(
        "FreePlanButton, invalid free plan status:",
        item.freePlanStatus,
      );
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className={cn(
        "overflow-hidden rounded-full",
        "group transition-transform duration-300 ease-in-out hover:scale-105",
        className,
      )}
      disabled={isPending}
      onClick={handleClick}
    >
      {!item ? (
        <div className="flex items-center justify-center gap-2">
          <span>{t("Payment.goSubmit")}</span>
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      ) : item.publishDate ? (
        <div className="flex items-center justify-center">
          <ArrowUpLeftIcon className="mr-2 size-4 icon-scale" />
          <span>{t("Payment.goDashboard")}</span>
        </div>
      ) : (
        <div>
          {isPending ? (
            <div className="flex items-center justify-center">
              <Icons.spinner className="mr-2 size-4 animate-spin" />
              <span>{t("Payment.submitting")}</span>
            </div>
          ) : item.freePlanStatus === FreePlanStatus.PENDING ? (
            <div className="flex items-center justify-center">
              <ArrowUpLeftIcon className="mr-2 size-4 icon-scale" />
              <span>{t("Payment.goDashboardAndWait")}</span>
            </div>
          ) : item.freePlanStatus === FreePlanStatus.APPROVED ? (
            <div className="flex items-center justify-center">
              <CheckCircleIcon className="mr-2 size-4 icon-scale" />
              <span>{t("Payment.goPublish")}</span>
            </div>
          ) : item.freePlanStatus === FreePlanStatus.REJECTED ? (
            <div className="flex items-center justify-center">
              <EditIcon className="mr-2 size-4 icon-scale" />
              <span>{t("Payment.goEdit")}</span>
            </div>
          ) : item.freePlanStatus === FreePlanStatus.SUBMITTING ? (
            <div className="flex items-center justify-center">
              <SendIcon className="mr-2 size-4 icon-scale" />
              <span>{t("Payment.submitToReview")}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ArrowUpLeftIcon className="mr-2 size-4 icon-scale" />
              <span>{t("Payment.goDashboard")}</span>
            </div>
          )}
        </div>
      )}
    </Button>
  );
}
