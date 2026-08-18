import { env } from "./env.js";

export const PAYPAL_PACKAGES = Object.freeze({
  starter: Object.freeze({
    id: "starter",
    credits: 20,
    price: "2.00",
    currency: "USD",
    name: "20 AI Credits",
  }),

  creator: Object.freeze({
    id: "creator",
    credits: 50,
    price: "5.00",
    currency: "USD",
    name: "50 AI Credits",
  }),

  studio: Object.freeze({
    id: "studio",
    credits: 120,
    price: "12.00",
    currency: "USD",
    name: "120 AI Credits",
  }),
});

export function getPayPalBaseUrl() {
  return env.paypalEnvironment === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}
