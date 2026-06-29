import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-06-24.dahlia"
    });
  }

  return stripeClient;
}

export function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
