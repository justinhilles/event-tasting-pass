import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { redeemCredit } from "@/lib/redemptions";
import { createTestEvent, createTestWallet } from "../helpers/testData";

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("redeemCredit", () => {
  it("redeems one accepted credit from a manual code", async () => {
    const fixture = await createTestEvent(prisma);
    const { wallet } = await createTestWallet(prisma, {
      eventId: fixture.event.id,
      foodCreditTypeId: fixture.creditTypes.food.id,
      manualCode: "ABC-123"
    });

    const result = await redeemCredit({
      scannerToken: fixture.vendor.scannerToken,
      walletLookup: "abc123",
      creditTypeId: fixture.creditTypes.food.id
    });

    expect(result).toEqual({
      ok: true,
      message: `Redeemed 1 credit for ${wallet.displayName}.`
    });

    const ledgerTotal = await prisma.creditLedgerEntry.aggregate({
      where: {
        walletId: wallet.id,
        creditTypeId: fixture.creditTypes.food.id
      },
      _sum: {
        amount: true
      }
    });
    const redemptions = await prisma.redemption.count({
      where: {
        walletId: wallet.id,
        vendorId: fixture.vendor.id
      }
    });

    expect(ledgerTotal._sum.amount).toBe(0);
    expect(redemptions).toBe(1);
  });

  it("prevents duplicate vendor redemption beyond the vendor wallet limit", async () => {
    const fixture = await createTestEvent(prisma);
    await createTestWallet(prisma, {
      eventId: fixture.event.id,
      foodCreditTypeId: fixture.creditTypes.food.id,
      foodCredits: 2,
      manualCode: "DUP-123"
    });

    await redeemCredit({
      scannerToken: fixture.vendor.scannerToken,
      walletLookup: "DUP-123",
      creditTypeId: fixture.creditTypes.food.id
    });

    const secondAttempt = await redeemCredit({
      scannerToken: fixture.vendor.scannerToken,
      walletLookup: "DUP-123",
      creditTypeId: fixture.creditTypes.food.id
    });

    expect(secondAttempt.ok).toBe(false);
    expect(secondAttempt.message).toContain("already redeemed");
  });

  it("blocks expired event redemption", async () => {
    const fixture = await createTestEvent(prisma, {
      redemptionStartAt: new Date(Date.now() - 60 * 60_000),
      redemptionEndAt: new Date(Date.now() - 60_000)
    });
    await createTestWallet(prisma, {
      eventId: fixture.event.id,
      foodCreditTypeId: fixture.creditTypes.food.id,
      manualCode: "EXP-123"
    });

    const result = await redeemCredit({
      scannerToken: fixture.vendor.scannerToken,
      walletLookup: "EXP-123",
      creditTypeId: fixture.creditTypes.food.id
    });

    expect(result).toEqual({
      ok: false,
      message: "Credits for this event have expired."
    });
  });
});
