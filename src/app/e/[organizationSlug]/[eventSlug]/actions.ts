"use server";

import { redirect } from "next/navigation";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { createManualCode } from "@/lib/codes";
import { prisma } from "@/lib/prisma";

const testPurchaseSchema = z.object({
  eventId: z.string().min(1),
  bundleId: z.string().min(1),
  buyerName: z.string().trim().min(1, "Buyer name is required"),
  buyerEmail: z.string().trim().email("Buyer email is required"),
  walletDisplayName: z.string().trim().min(1, "Wallet name is required")
});

export async function createTestWallet(formData: FormData) {
  const parsed = testPurchaseSchema.parse({
    eventId: formData.get("eventId"),
    bundleId: formData.get("bundleId"),
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
    walletDisplayName: formData.get("walletDisplayName")
  });

  const bundle = await prisma.creditBundle.findFirstOrThrow({
    where: {
      id: parsed.bundleId,
      eventId: parsed.eventId,
      active: true
    },
    include: {
      credits: true
    }
  });

  const wallet = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        eventId: parsed.eventId,
        buyerEmail: parsed.buyerEmail,
        buyerName: parsed.buyerName,
        paymentMethod: PaymentMethod.COMP,
        paymentStatus: PaymentStatus.COMPED,
        subtotalCents: bundle.priceCents,
        discountCents: bundle.priceCents,
        totalCents: 0,
        adminNote: "Local test checkout; no payment collected."
      }
    });

    const createdWallet = await tx.wallet.create({
      data: {
        eventId: parsed.eventId,
        orderId: order.id,
        displayName: parsed.walletDisplayName,
        manualCode: createManualCode(),
        recipientEmail: parsed.buyerEmail
      }
    });

    await tx.orderItem.create({
      data: {
        orderId: order.id,
        bundleId: bundle.id,
        walletId: createdWallet.id,
        quantity: 1,
        unitPriceCents: bundle.priceCents
      }
    });

    await tx.creditLedgerEntry.createMany({
      data: bundle.credits.map((credit) => ({
        eventId: parsed.eventId,
        walletId: createdWallet.id,
        creditTypeId: credit.creditTypeId,
        type: "PURCHASE",
        amount: credit.quantity,
        reason: "Local test checkout"
      }))
    });

    return createdWallet;
  });

  redirect(`/w/${wallet.accessToken}`);
}

