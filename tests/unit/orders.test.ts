import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { createLocalPaidOrder } from "@/lib/orders";
import { createTestEvent } from "../helpers/testData";

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("createLocalPaidOrder", () => {
  it("creates multiple wallets, order items, and credit ledger entries", async () => {
    const fixture = await createTestEvent(prisma);

    const result = await createLocalPaidOrder({
      eventId: fixture.event.id,
      buyerName: "MVP Buyer",
      buyerEmail: "mvp@example.com",
      donationCents: 500,
      wallets: [
        {
          bundleId: fixture.bundle.id,
          displayName: "Guest One"
        },
        {
          bundleId: fixture.bundle.id,
          displayName: "Guest Two",
          recipientEmail: "guest-two@example.com"
        }
      ]
    });

    expect(result.wallets).toHaveLength(2);
    expect(result.order.subtotalCents).toBe(5000);
    expect(result.order.donationCents).toBe(500);
    expect(result.order.platformFeeCents).toBe(165);
    expect(result.calculatedTotalCents).toBe(5665);

    const items = await prisma.orderItem.findMany({
      where: {
        orderId: result.order.id
      }
    });
    const ledgerEntries = await prisma.creditLedgerEntry.findMany({
      where: {
        walletId: {
          in: result.wallets.map((wallet) => wallet.id)
        }
      }
    });

    expect(items).toHaveLength(2);
    expect(ledgerEntries).toHaveLength(4);
    expect(ledgerEntries.reduce((sum, entry) => sum + entry.amount, 0)).toBe(14);
  });

  it("rejects orders that would exceed a credit cap", async () => {
    const fixture = await createTestEvent(prisma);

    await prisma.creditType.update({
      where: {
        id: fixture.creditTypes.food.id
      },
      data: {
        cap: 4
      }
    });

    await expect(
      createLocalPaidOrder({
        eventId: fixture.event.id,
        buyerName: "MVP Buyer",
        buyerEmail: "mvp@example.com",
        wallets: [
          {
            bundleId: fixture.bundle.id,
            displayName: "Guest One"
          }
        ]
      })
    ).rejects.toThrow("Food credits are sold out.");
  });
});
