import { createClient } from "next-sanity";
import type { SanityClient } from "sanity";
import { apiVersion, dataset, projectId } from "./api";
import { token } from "./token";

/**
 * Lazily build the singleton Sanity client the first time any code actually
 * reaches for a method (fetch, patch, create, withConfig, …).
 *
 * This is the critical fix for the earlier Vercel build crashes: importing
 * the `sanityClient` symbol must never, on its own, invoke
 * `next-sanity/createClient`. If `projectId`/`dataset` aren't available at
 * module-evaluation time, construction is deferred to first use.
 *
 * NOTE: We intentionally construct a real SanityClient instance (not a
 * Proxy) and then return its methods through an accessor Proxy. Using a
 * Proxy around the real instance preserves class private fields (the
 * `#config` slot that next-sanity reads internally), which is what the
 * previous draft-route crash was about:
 *   `TypeError: Cannot read private member #c from an object whose class
 *    did not declare it`
 * That error happened because a Proxy target of `{}` (plain object) does
 * not declare the `#config` private member that `withConfig` / `config`
 * read from `this`. Instantiating `createClient` first gives `this` the
 * correct class, so private member access works.
 */
let _real: SanityClient | null | undefined;

function realClient(): SanityClient {
  if (_real !== undefined && _real !== null) return _real;
  try {
    _real = createClient({
      projectId,
      dataset,
      apiVersion,
      perspective: "published",
      useCdn: process.env.NODE_ENV === "production",
      token: token ?? undefined,
    });
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn(
        "[sanity/lib/client] Sanity client failed to initialize (projectId/dataset missing?). Sanity-backed features are unavailable at runtime until env is configured. Cause:",
        error,
      );
    }
    // Fallback: keep _real defined but throw a clear error on first use.
    // We still create an object so import sites never crash at build time.
    _real = makeThrowClient(error);
  }
  return _real as SanityClient;
}

/**
 * Public named export. Kept for backward compatibility with every existing
 * `import { sanityClient } from "@/sanity/lib/client"` call site.
 *
 * The outer Proxy is only a method-access forwarder — it does not masquerade
 * as a SanityClient instance. Once a property is requested, the real client
 * is materialized (if it wasn't already) and that property is returned with
 * the correct `this` bound to the real instance. This keeps private field
 * lookups (`#config`) inside next-sanity's class methods working.
 */
export const sanityClient: SanityClient = new Proxy<SanityClient>(
  {} as SanityClient,
  {
    get(_trapTarget, prop, _receiver) {
      const actual = realClient();
      // biome-ignore lint/suspicious/noExplicitAny: Reflect accept any key
      const value = Reflect.get(actual, prop, actual) as any;
      // If we're returning a function (fetch, patch, withConfig, etc.),
      // rebind `this` to the real client so private member access doesn't
      // walk back up to the empty trap target.
      if (typeof value === "function") {
        // biome-ignore lint/suspicious/noExplicitAny: <matching any arity>
        return (...args: any[]) =>
          // biome-ignore lint/suspicious/noExplicitAny: <any cast for arity>
          (value as any).apply(actual, args);
      }
      return value;
    },
  },
);

export function getSanityClient(): SanityClient {
  return realClient();
}

/**
 * Best-effort "throw on use" client used when `createClient` itself fails
 * (e.g. required env is missing). We still need a value that has the shape
 * of SanityClient on the type level so TS doesn't break all import sites,
 * but any runtime use throws a deterministic message.
 */
// biome-ignore lint/suspicious/noExplicitAny: intentionally generic proxy shape
function makeThrowClient(cause: unknown): any {
  // biome-ignore lint/suspicious/noExplicitAny:
  const fn: any = () => {
    throw new Error(
      "Sanity client unavailable — check NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_TOKEN. Original createClient error: " +
        String(cause),
    );
  };
  return new Proxy(fn, {
    get(_t, p) {
      if (p === "then" || p === "catch" || p === "finally") {
        // biome-ignore lint/suspicious/noExplicitAny:
        return (fn() as Promise<any>)[p];
      }
      return makeThrowClient(cause);
    },
    apply(_t, _this, _args) {
      return fn();
    },
  });
}
