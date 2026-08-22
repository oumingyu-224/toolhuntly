"use client";

import { FormError } from "@/components/shared/form-error";
import { useCurrentRole } from "@/hooks/use-current-role";
import type { UserRole } from "@/types/user-role";
import { useTranslations } from "next-intl";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const t = useTranslations();
  const role = useCurrentRole();

  if (role !== allowedRole) {
    return (
      <FormError message={t("Auth.noPermissionViewContent")} />
    );
  }

  return <div>{children}</div>;
};
