import Stripe from "stripe";

/**
 * NOTE: Lazy-init the Stripe client. See the same note in `mail.ts` — module
 * top-level `new Stripe(undefined)` used to crash Vercel's build phase
 * whenever the env var was unavailable at module-evaluation time. Deferring
 * init to first real use lets the build succeed and surfaces a clear error
 * in whichever runtime flow actually needs Stripe (checkout, webhook, etc.).
 */
let _stripe: Stripe | null | undefined;

function initStripe(): Stripe | null {
  if (_stripe !== undefined) return _stripe;
  const apiKey = process.env.STRIPE_API_KEY;
  if (!apiKey) {
    if (typeof console !== "undefined") {
      console.warn(
        "[lib/stripe] STRIPE_API_KEY is not configured. Payment services unavailable.",
      );
    }
    _stripe = null;
    return _stripe;
  }
  try {
    _stripe = new Stripe(apiKey, {
      apiVersion: "2024-04-10",
      typescript: true,
    });
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn("[lib/stripe] Failed to initialize Stripe client:", error);
    }
    _stripe = null;
  }
  return _stripe;
}

export function getStripe(): Stripe | null {
  return initStripe();
}

/**
 * @deprecated Use `getStripe()` instead and handle the null case explicitly.
 * Kept as a thin lazy alias to avoid touching dozens of import sites in one
 * go. Build-phase access through this export no longer throws.
 */
export const stripe = new Proxy<Stripe>({} as Stripe, {
  get(_target, prop, receiver) {
    const client = initStripe();
    if (!client) {
      // Return a fake chain that, when any part of it is invoked as a
      // function, returns a rejected Promise with a clear message. This
      // keeps the build from throwing while still producing usable
      // runtime errors for payment flows.
      return makeFakeStripeChain(
        `STRIPE_API_KEY is not configured. Cannot access Stripe.${String(prop)}`,
      );
    }
    return Reflect.get(client, prop, receiver);
  },
});

// biome-ignore lint/suspicious/noExplicitAny: intentional generic proxy chain
function makeFakeStripeChain(message: string): any {
  // biome-ignore lint/suspicious/noExplicitAny:
  const fn: any = () =>
    Promise.reject(new Error("Stripe unavailable: " + message));
  return new Proxy(fn, {
    get(_t, p) {
      if (p === "then" || p === "catch" || p === "finally") {
        // Accessing a Promise method means someone is awaiting the chain
        // directly — hand them the rejected Promise.
        // biome-ignore lint/suspicious/noExplicitAny:
        return (fn() as Promise<any>)[p];
      }
      return makeFakeStripeChain(message);
    },
    apply(_t, _this, _args) {
      return fn();
    },
  });
}
