import { createClient } from "next-sanity";
import type { SanityClient } from "sanity";
import { apiVersion, dataset, projectId } from "./api";
import { token } from "./token";

/**
 * NOTE: Defer Sanity client creation to first real use. Even with the safe
 * fallbacks introduced in `api.ts` and `token.ts`, `createClient` can throw
 * synchronously during its own validation when `projectId` is the empty
 * string. Lazily constructing the client means the build phase never
 * evaluates this path for routes that don't actually fetch from Sanity, and
 * runtime users who hit real Sanity endpoints get a deterministic "Sanity
 * not configured" error instead of a cryptic page-data-collection failure.
 */
let _sanityClient: SanityClient | null | undefined;

function initSanityClient(): SanityClient {
  if (_sanityClient !== undefined) return _sanityClient as SanityClient;
  try {
    _sanityClient = createClient({
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
        "[sanity/lib/client] Failed to initialize Sanity client. Sanity-backed features unavailable:",
        error,
      );
    }
    // Best-effort fallback: build a dummy-like client using createClient with
    // empty strings would also throw inside next-sanity, so we throw a clear
    // error on first *use* (fetch/patch/commit). We still cache a value in
    // _sanityClient via a "throw-on-access" proxy so the cache is sealed.
    _sanityClient = makeErrorClient(error);
  }
  return _sanityClient as SanityClient;
}

/**
 * Thin named export retained for existing callers.
 *
 * We expose the client via a Proxy so build-phase property access (e.g. a
 * server component simply importing the symbol to pass around) does not
 * trigger `createClient()` at module-evaluation time. Real method calls such
 * as `.fetch()` or `.patch().commit()` instantiate the client lazily.
 */
export const sanityClient: SanityClient = new Proxy<SanityClient>(
  {} as SanityClient,
  {
    get(_t, prop, receiver) {
      const actual = initSanityClient();
      return Reflect.get(actual, prop, receiver);
    },
  },
);

/**
 * Called by callers that want a plain `SanityClient` value without the Proxy
 * wrapper (e.g. if passing the client into a third-party helper). Throws or
 * warns at call-time instead of build-time.
 */
export function getSanityClient(): SanityClient {
  return initSanityClient();
}

// biome-ignore lint/suspicious/noExplicitAny: any-typed proxy because SanityClient has many methods
function makeErrorClient(cause: unknown): any {
  // biome-ignore lint/suspicious/noExplicitAny:
  const thrower: any = () => {
    throw new Error(
      "Sanity client unavailable (NEXT_PUBLIC_SANITY_PROJECT_ID / DATASET misconfigured). Original cause: " +
        String(cause),
    );
  };
  return new Proxy(thrower, {
    get(_t, p) {
      if (p === "then" || p === "catch" || p === "finally") {
        // biome-ignore lint/suspicious/noExplicitAny:
        return (thrower() as Promise<any>)[p];
      }
      return makeErrorClient(cause);
    },
    apply(_t, _this, _args) {
      return thrower();
    },
  });
}
