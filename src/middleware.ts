import authConfig from "@/auth.config";
import { routing } from "@/i18n/routing";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";
import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";

/**
 * https://www.youtube.com/watch?v=1MTyCvS05V4
 * Next Auth V5 - Advanced Guide (2024)
 */
const { auth } = NextAuth(authConfig);

// next-intl middleware handles locale detection, rewriting & redirects
const intlMiddleware = createMiddleware(routing);

// Strip the locale prefix from a pathname (e.g. `/zh-CN/auth/login` -> `/auth/login`)
function getPathnameWithoutLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

// Read the locale from a pathname, falling back to the default locale
function getLocaleFromPathname(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return routing.defaultLocale;
}

// Build a pathname with the locale prefix applied (no prefix for default locale)
function localizePathname(locale: string, pathname: string): string {
  if (locale === routing.defaultLocale) return pathname;
  return `/${locale}${pathname}`;
}

// since we have put role in user session, so we can know the role of the user
export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  // API routes do not need locale handling — only run the original auth check
  if (pathname.startsWith("/api")) {
    // /api 根路径没有对应接口，直接返回 404（不跳登录、不空白）
    if (pathname === "/api") {
      return new Response("Not Found", { status: 404 });
    }

    if (pathname.startsWith(apiAuthPrefix)) {
      return null;
    }

    const isPublicApiRoute = publicRoutes.some((route) =>
      new RegExp(`^${route}$`).test(pathname),
    );

    if (!isLoggedIn && !isPublicApiRoute) {
      let callbackUrl = pathname;
      if (nextUrl.search) {
        callbackUrl += nextUrl.search;
      }
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);
      return Response.redirect(
        new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
      );
    }

    return null;
  }

  // Sanity Studio routes do not need locale handling or NextAuth gate;
  // it lives outside /[locale] and relies on Sanity's own auth (CORS + token).
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Redirect legacy /zh* URLs to /zh-CN (locale renamed from "zh" to "zh-CN").
  // 301 keeps previously crawled hreflang links working.
  if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    const newPath = `/zh-CN${pathname.slice(3)}${nextUrl.search}`;
    return Response.redirect(new URL(newPath, nextUrl), 301);
  }

  // For page routes, let next-intl handle the locale first
  const intlResponse = intlMiddleware(req);

  // Auth checks operate on the pathname without the locale prefix
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const locale = getLocaleFromPathname(pathname);

  // do nothing if on api auth routes
  if (pathnameWithoutLocale.startsWith(apiAuthPrefix)) {
    return intlResponse;
  }

  const isAuthRoute = authRoutes.includes(pathnameWithoutLocale);

  // redirect to dashboard if logged in and on auth routes
  if (isAuthRoute) {
    if (isLoggedIn) {
      console.log("middleware, redirecting to dashboard");
      return Response.redirect(
        new URL(localizePathname(locale, DEFAULT_LOGIN_REDIRECT), nextUrl),
      );
    }
    return intlResponse;
  }

  const isPublicRoute = publicRoutes.some((route) =>
    new RegExp(`^${route}$`).test(pathnameWithoutLocale),
  );

  // redirect to login if not logged in and not on public routes
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(
        `${localizePathname(locale, "/auth/login")}?callbackUrl=${encodedCallbackUrl}`,
        nextUrl,
      ),
    );
  }

  return intlResponse;
});

// https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
// https://clerk.com/docs/references/nextjs/auth-middleware#usage
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
