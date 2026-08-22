"use client";

import { LoginWrapper } from "@/components/auth/login-button";
import Container from "@/components/container";
import { Icons } from "@/components/icons/icons";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserButton } from "@/components/layout/user-button";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import type { DashboardConfig, MarketingConfig } from "@/types";
import { MenuIcon, SendIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import React from "react";
import { Logo } from "../logo";

interface NavBarProps {
  scroll?: boolean;
  config: DashboardConfig | MarketingConfig;
}

export function Navbar({ scroll = false, config }: NavBarProps) {
  const t = useTranslations();
  const scrolled = useScroll(50);
  const user = useCurrentUser();

  const pathname = usePathname();
  const links = config.menus;

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const [open, setOpen] = useState(false);
  // prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* Desktop View */}
      <header
        className={cn(
          "hidden md:flex justify-center bg-background/60 backdrop-blur-xl transition-all",
          scroll ? (scrolled ? "border-b" : "bg-transparent") : "border-b",
        )}
      >
        <Container className="flex h-16 items-center justify-between">
          {/* Left: Logo (32x32) + brand name ToolHuntly */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="size-8" />
              <span className="text-xl font-bold">{t("Nav.brand")}</span>
            </Link>

            {/* Middle nav menus — keep existing structure */}
            {links && links.length > 0 ? (
              <NavigationMenu>
                <NavigationMenuList className="gap-1 overflow-x-auto scrollbar-none">
                  {links.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuLink
                        href={item.disabled ? "#" : item.href}
                        target={item.external ? "_blank" : ""}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "px-2 bg-transparent focus:bg-transparent text-base",
                          isLinkActive(item.href)
                            ? "text-foreground font-semibold"
                            : "text-foreground/60",
                          item.disabled && "cursor-not-allowed opacity-80",
                        )}
                      >
                        {t(item.title)}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            ) : null}
          </div>

          {/* Right actions: Submit + Log in + User menu */}
          <div className="flex items-center gap-x-3">
            <Link href="/submit">
              <Button
                className="flex items-center gap-2 px-4 rounded-full"
                variant="default"
                size="default"
              >
                <SendIcon className="size-4" />
                <span className="font-medium">{t("Nav.submit")}</span>
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center">
                <UserButton />
              </div>
            ) : (
              <LoginWrapper mode="modal" asChild>
                <Button
                  className="px-4 rounded-full"
                  variant="secondary"
                  size="default"
                >
                  <span className="font-medium">{t("Nav.logIn")}</span>
                </Button>
              </LoginWrapper>
            )}

            {/* <ModeToggle /> */}
          </div>
        </Container>
      </header>

      {/* Mobile View — 3-part: Hamburger (left) + Logo (center) + Login (right) */}
      <header className="md:hidden flex justify-center bg-background/60 backdrop-blur-xl transition-all">
        <div className="w-full px-4 h-16 grid grid-cols-3 items-center">
          {/* Left: Hamburger */}
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0"
                >
                  <MenuIcon className="size-5" />
                  <span className="sr-only">{t("Nav.toggleNav")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <div className="flex h-screen flex-col">
                  {/* Sheet header: big Logo */}
                  <Link
                    href="/"
                    className="flex items-center space-x-2 pl-4 pt-4"
                    onClick={() => setOpen(false)}
                  >
                    <Logo className="size-8" />
                    <span className="text-xl font-bold">{t("Nav.brand")}</span>
                  </Link>

                  <nav className="flex flex-1 flex-col gap-2 p-2 pt-8 font-medium">
                    {links.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];
                      return (
                        <Link
                          key={item.title}
                          href={item.disabled ? "#" : item.href}
                          target={item.external ? "_blank" : ""}
                          onClick={() => {
                            if (!item.disabled) setOpen(false);
                          }}
                          className={cn(
                            "flex items-center rounded-md gap-2 p-2 text-sm font-medium hover:bg-muted",
                            isLinkActive(item.href)
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                            item.disabled &&
                              "cursor-not-allowed opacity-80 hover:bg-transparent hover:text-muted-foreground",
                          )}
                        >
                          <Icon className="size-5" />
                          {t(item.title)}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center: Logo */}
          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setOpen(false)}
            >
              <Logo className="size-8" />
              <span className="text-xl font-bold">{t("Nav.brand")}</span>
            </Link>
          </div>

          {/* Right: Login only (no language switcher here) */}
          <div className="flex items-center justify-end gap-x-2">
            {user ? (
              <div className="flex items-center">
                <UserButton />
              </div>
            ) : (
              <LoginWrapper mode="redirect" asChild>
                <Button
                  className="px-4 rounded-full"
                  variant="secondary"
                  size="default"
                >
                  <span className="font-medium">{t("Nav.logIn")}</span>
                </Button>
              </LoginWrapper>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
