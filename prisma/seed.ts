import { PrismaClient, PaymentMethod, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "demo-charity" },
    update: {},
    create: {
      name: "Demo Charity",
      slug: "demo-charity"
    }
  });

  const event = await prisma.event.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: "chili-cookoff"
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Charity Chili Cook-Off",
      slug: "chili-cookoff",
      description: "A demo event for tasting wallets, food credits, and beer garden drink credits.",
      status: "PUBLISHED",
      timezone: "America/Los_Angeles",
      locationName: "Downtown Event Hall",
      locationAddress: "123 Main St",
      primaryColor: "#b83b2d",
      salesStartAt: new Date("2026-07-01T16:00:00.000Z"),
      salesEndAt: new Date("2026-07-25T22:30:00.000Z"),
      redemptionStartAt: new Date("2026-07-25T19:00:00.000Z"),
      redemptionEndAt: new Date("2026-07-25T23:00:00.000Z"),
      policyText: "Credits are non-refundable and expire when the event ends."
    }
  });

  const food = await prisma.creditType.upsert({
    where: {
      eventId_slug: {
        eventId: event.id,
        slug: "food"
      }
    },
    update: {},
    create: {
      eventId: event.id,
      name: "Food",
      slug: "food",
      cap: 1000
    }
  });

  const drink = await prisma.creditType.upsert({
    where: {
      eventId_slug: {
        eventId: event.id,
        slug: "drink"
      }
    },
    update: {},
    create: {
      eventId: event.id,
      name: "Drink",
      slug: "drink",
      cap: 300
    }
  });

  const chiliCategory = await prisma.vendorCategory.upsert({
    where: {
      eventId_slug: {
        eventId: event.id,
        slug: "chili"
      }
    },
    update: {},
    create: {
      eventId: event.id,
      name: "Chili",
      slug: "chili"
    }
  });

  const beerCategory = await prisma.vendorCategory.upsert({
    where: {
      eventId_slug: {
        eventId: event.id,
        slug: "beer-garden"
      }
    },
    update: {},
    create: {
      eventId: event.id,
      name: "Beer Garden",
      slug: "beer-garden"
    }
  });

  const firehouse = await prisma.vendor.upsert({
    where: {
      eventId_slug: {
        eventId: event.id,
        slug: "firehouse-chili"
      }
    },
    update: {},
    create: {
      eventId: event.id,
      categoryId: chiliCategory.id,
      name: "Firehouse Chili",
      slug: "firehouse-chili",
      boothLocation: "Booth 1",
      estimatedCapacity: 150
    }
  });

  const beerGarden = await prisma.vendor.upsert({
    where: {
      eventId_slug: {
        eventId: event.id,
        slug: "main-street-beer-garden"
      }
    },
    update: {},
    create: {
      eventId: event.id,
      categoryId: beerCategory.id,
      name: "Main Street Beer Garden",
      slug: "main-street-beer-garden",
      boothLocation: "Patio",
      ageRestricted: true,
      maxRedemptionsPerWallet: 5,
      estimatedCapacity: 300
    }
  });

  await prisma.vendorCreditType.upsert({
    where: {
      vendorId_creditTypeId: {
        vendorId: firehouse.id,
        creditTypeId: food.id
      }
    },
    update: {},
    create: {
      vendorId: firehouse.id,
      creditTypeId: food.id
    }
  });

  await prisma.vendorCreditType.upsert({
    where: {
      vendorId_creditTypeId: {
        vendorId: beerGarden.id,
        creditTypeId: drink.id
      }
    },
    update: {},
    create: {
      vendorId: beerGarden.id,
      creditTypeId: drink.id
    }
  });

  const combo = await prisma.creditBundle.upsert({
    where: {
      eventId_slug: {
        eventId: event.id,
        slug: "combo-pass"
      }
    },
    update: {},
    create: {
      eventId: event.id,
      name: "Combo Pass",
      slug: "combo-pass",
      description: "Five chili tastings plus two beer garden tastings.",
      priceCents: 3500,
      quantityLimit: 200,
      maxPerOrder: 6
    }
  });

  await prisma.creditBundleCredit.upsert({
    where: {
      bundleId_creditTypeId: {
        bundleId: combo.id,
        creditTypeId: food.id
      }
    },
    update: {},
    create: {
      bundleId: combo.id,
      creditTypeId: food.id,
      quantity: 5
    }
  });

  await prisma.creditBundleCredit.upsert({
    where: {
      bundleId_creditTypeId: {
        bundleId: combo.id,
        creditTypeId: drink.id
      }
    },
    update: {},
    create: {
      bundleId: combo.id,
      creditTypeId: drink.id,
      quantity: 2
    }
  });

  const order = await prisma.order.create({
    data: {
      eventId: event.id,
      buyerEmail: "demo@example.com",
      buyerName: "Demo Buyer",
      paymentMethod: PaymentMethod.COMP,
      paymentStatus: PaymentStatus.COMPED,
      subtotalCents: 0,
      totalCents: 0
    }
  });

  const wallet = await prisma.wallet.create({
    data: {
      eventId: event.id,
      orderId: order.id,
      displayName: "Demo Wallet",
      manualCode: "DEMO-01",
      recipientEmail: "demo@example.com"
    }
  });

  await prisma.creditLedgerEntry.createMany({
    data: [
      {
        eventId: event.id,
        walletId: wallet.id,
        creditTypeId: food.id,
        type: "COMP",
        amount: 5,
        reason: "Seed demo wallet"
      },
      {
        eventId: event.id,
        walletId: wallet.id,
        creditTypeId: drink.id,
        type: "COMP",
        amount: 2,
        reason: "Seed demo wallet"
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

