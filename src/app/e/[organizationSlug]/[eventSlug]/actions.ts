"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createLocalPaidOrder } from "@/lib/orders";

const testPurchaseSchema = z.object({
  eventId: z.string().min(1),
  buyerName: z.string().trim().min(1, "Buyer name is required"),
  buyerEmail: z.string().trim().email("Buyer email is required"),
  donationDollars: z.coerce.number().min(0).max(10000).default(0),
  acceptedTerms: z.literal("on"),
  wallets: z
    .array(
      z.object({
        enabled: z.boolean(),
        bundleId: z.string().min(1),
        displayName: z.string().trim(),
        recipientEmail: z.string().trim().optional()
      })
    )
    .transform((wallets) =>
      wallets
        .filter((wallet) => wallet.enabled)
        .map((wallet, index) => ({
          bundleId: wallet.bundleId,
          displayName: wallet.displayName || `Guest ${index + 1}`,
          recipientEmail: wallet.recipientEmail || undefined
        }))
    )
    .pipe(z.array(z.object({
      bundleId: z.string().min(1),
      displayName: z.string().min(1),
      recipientEmail: z.string().email().optional()
    })).min(1, "Select at least one wallet."))
});

export async function createTestWallet(formData: FormData) {
  const wallets = [0, 1, 2, 3, 4].map((index) => ({
    enabled: formData.get(`wallets.${index}.enabled`) === "on" || index === 0,
    bundleId: String(formData.get(`wallets.${index}.bundleId`) ?? ""),
    displayName: String(formData.get(`wallets.${index}.displayName`) ?? ""),
    recipientEmail: String(formData.get(`wallets.${index}.recipientEmail`) ?? "")
  }));

  const parsed = testPurchaseSchema.parse({
    eventId: formData.get("eventId"),
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
    donationDollars: formData.get("donationDollars") || 0,
    acceptedTerms: formData.get("acceptedTerms"),
    wallets
  });

  const result = await createLocalPaidOrder({
    eventId: parsed.eventId,
    buyerName: parsed.buyerName,
    buyerEmail: parsed.buyerEmail,
    donationCents: Math.round(parsed.donationDollars * 100),
    wallets: parsed.wallets,
    adminNote: "Local MVP checkout; Stripe payment not collected in development."
  });

  redirect(`/order/${result.order.id}`);
}
