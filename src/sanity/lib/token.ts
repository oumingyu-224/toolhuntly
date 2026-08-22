// TODO: fix token is server-only, otherwise sanity adapter can not create user!!!
import "server-only";

// import { experimental_taintUniqueValue } from "react";

// token is used to fetch data in Server Components,
// can not be used in client components for security reasons
// export const token = process.env.SANITY_API_TOKEN;

// if (!token) {
//   throw new Error("Missing SANITY_API_TOKEN");
// }

export const token: string | undefined = assertValueOrUndefined(
  process.env.SANITY_API_TOKEN,
  // process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  "Missing environment variable: SANITY_API_TOKEN",
);

// experimental_taintUniqueValue(
//   "Do not pass the sanity API read token to the client",
//   process,
//   token,
// );

/**
 * As this file is reused in several other files, try to keep it lean and small.
 * Importing other npm packages here could lead to needlessly increasing the client bundle size, or end up in a server-only function that don't need it.
 *
 * NOTE: We intentionally do NOT throw during build. A missing SANITY_API_TOKEN
 * at build time does not prevent static page data collection; write
 * operations (patch/create/commit) will naturally fail at runtime if a token
 * is required and not configured.
 */
function assertValueOrUndefined<T>(
  value: T | undefined,
  errorMessage: string,
): T | undefined {
  if (value === undefined || value === "") {
    if (typeof console !== "undefined") {
      // biome-ignore lint/suspicious/noConsoleLog: intentional runtime warning for operators
      console.warn(
        `[sanity/lib/token] ${errorMessage}. Protected Server-Component writes will be unavailable at runtime.`,
      );
    }
    return undefined;
  }

  return value;
}
