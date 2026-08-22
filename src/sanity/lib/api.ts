/**
 * Used to configure edit intent links, for Presentation Mode, as well as to configure where the Studio is mounted in the router.
 */
export const studioUrl = "/studio";

/**
 * Used to configure the Preview URL
 */
export const previewUrl = process.env.NEXT_PUBLIC_APP_URL;

/**
 * see https://www.sanity.io/docs/api-versioning for how versioning works
 */
export const apiVersion = "2024-08-01";

/**
 * As this file is reused in several other files, try to keep it lean and small.
 * Importing other npm packages here could lead to needlessly increasing the client bundle size, or end up in a server-only function that don't need it.
 */
export const dataset = assertValueOrFallback(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
  "",
);

export const projectId = assertValueOrFallback(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
  "",
);

/**
 * As this file is reused in several other files, try to keep it lean and small.
 * Importing other npm packages here could lead to needlessly increasing the client bundle size, or end up in a server-only function that don't need it.
 *
 * NOTE: We intentionally do NOT throw during build. Missing env values at
 * build time would otherwise fail the entire static-page-data collection
 * for unrelated routes. Runtime consumers of `dataset`/`projectId` already
 * guard against empty strings (see image.ts and sanityClient).
 */
function assertValueOrFallback<T, F>(
  value: T | undefined,
  errorMessage: string,
  fallback: F,
): T | F {
  if (value === undefined || value === "") {
    if (typeof console !== "undefined") {
      // biome-ignore lint/suspicious/noConsoleLog: intentional runtime warning for operators
      console.warn(`[sanity/lib/api] ${errorMessage}. Using fallback value at build time; please configure the env var for runtime features.`);
    }
    return fallback;
  }

  return value;
}
