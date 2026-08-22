import type { DashboardConfig } from "@/types";

export const dashboardConfig: DashboardConfig = {
  menus: [
    {
      title: "Dashboard.homepage",
      href: "/",
      icon: "home",
    },
    {
      title: "Dashboard.dashboard",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Dashboard.settings",
      href: "/settings",
      icon: "settings",
    },
    {
      title: "Dashboard.submit",
      href: "/submit",
      icon: "submit",
    },
  ],
};
