import {
  LedgerEntryType,
  PaymentMethod,
  PaymentStatus,
  PrismaClient
} from "@prisma/client";

type TestEventOptions = {
  slug?: string;
  redemptionStartAt?: Date;
  redemptionEndAt?: Date;
};

export async function createTestEvent(prisma: PrismaClient, options: TestEventOptions = {}) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const organization = await prisma.organization.create({
    data: {
      name: `Test Charity ${suffix}`,
      slug: `test-charity-${suffix}`
    }
  });

  const event = await prisma.event.create({
    data: {
      organizationId: organization.id,
      name: `Test Chili Event ${suffix}`,
      slug: options.slug ?? `test-chili-${suffix}`,
      description: "Test event",
      status: "PUBLISHED",
      redemptionStartAt: options.redemptionStartAt ?? new Date(Date.now() - 60_000),
      redemptionEndAt: options.redemptionEndAt ?? new Date(Date.now() + 60 * 60_000),
      platformFeePercent: 3
    }
  });

  const food = await prisma.creditType.create({
    data: {
      eventId: event.id,
      name: "Food",
      slug: "food",
      cap: 100
    }
  });

  const drink = await prisma.creditType.create({
    data: {
      eventId: event.id,
      name: "Drink",
      slug: "drink",
      cap: 100
    }
  });

  const bundle = await prisma.creditBundle.create({
    data: {
      eventId: event.id,
      name: "Test Combo",
      slug: "test-combo",
      priceCents: 2500,
      quantityLimit: 10,
      maxPerOrder: 5,
      credits: {
        create: [
          {
            creditTypeId: food.id,
            quantity: 5
          },
          {
            creditTypeId: drink.id,
            quantity: 2
          }
        ]
      }
    },
    include: {
      credits: true
    }
  });

  const category = await prisma.vendorCategory.create({
    data: {
      eventId: event.id,
      name: "Chili",
      slug: "chili"
    }
  });

  const vendor = await prisma.vendor.create({
    data: {
      eventId: event.id,
      categoryId: category.id,
      name: "Test Vendor",
      slug: "test-vendor",
      maxRedemptionsPerWallet: 1,
      creditTypes: {
        create: {
          creditTypeId: food.id
        }
      }
    },
    include: {
      creditTypes: true
    }
  });

  return {
    organization,
    event,
    creditTypes: {
      food,
      drink
    },
    bundle,
    vendor
  };
}

export async function createTestWallet(
  prisma: PrismaClient,
  input: {
    eventId: string;
    foodCreditTypeId: string;
    displayName?: string;
    foodCredits?: number;
    manualCode?: string;
  }
) {
  const order = await prisma.order.create({
    data: {
      eventId: input.eventId,
      buyerEmail: "buyer@example.com",
      buyerName: "Buyer",
      paymentMethod: PaymentMethod.COMP,
      paymentStatus: PaymentStatus.COMPED,
      subtotalCents: 0,
      totalCents: 0
    }
  });

  const wallet = await prisma.wallet.create({
    data: {
      eventId: input.eventId,
      orderId: order.id,
      displayName: input.displayName ?? "Test Guest",
      manualCode: input.manualCode ?? `TST-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      recipientEmail: "guest@example.com"
    }
  });

  await prisma.creditLedgerEntry.create({
    data: {
      eventId: input.eventId,
      walletId: wallet.id,
      creditTypeId: input.foodCreditTypeId,
      type: LedgerEntryType.COMP,
      amount: input.foodCredits ?? 1,
      reason: "Test wallet"
    }
  });

  return {
    order,
    wallet
  };
}
