import type { UserButtonConfig } from "@/types";

export const userButtonConfig: UserButtonConfig = {
  menus: [
    {
      title: "UserButton.dashboard",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "UserButton.settings",
      href: "/settings",
      icon: "settings",
    },
    {
      title: "UserButton.submit",
      href: "/submit",
      icon: "submit",
    },
  ],
};
