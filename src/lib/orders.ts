import {
  LedgerEntryType,
  PaymentMethod,
  PaymentStatus,
  Prisma
} from "@prisma/client";
import { createManualCode } from "@/lib/codes";
import { calculatePlatformFeeCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type WalletBundleSelection = {
  bundleId: string;
  displayName: string;
  recipientEmail?: string | null;
};

type CreateLocalOrderInput = {
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  wallets: WalletBundleSelection[];
  donationCents?: number;
  adminNote?: string;
};

export async function createLocalPaidOrder(input: CreateLocalOrderInput) {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: input.eventId },
    include: {
      creditTypes: true,
      bundles: {
        include: {
          credits: true
        }
      }
    }
  });

  const bundleIds = input.wallets.map((wallet) => wallet.bundleId);
  const bundles = event.bundles.filter(
    (bundle) =>
      bundleIds.includes(bundle.id) &&
      bundle.active &&
      bundle.availableForNewWallet
  );
  const bundleById = new Map(bundles.map((bundle) => [bundle.id, bundle]));

  for (const wallet of input.wallets) {
    if (!bundleById.has(wallet.bundleId)) {
      throw new Error("Selected bundle is not available.");
    }
  }

  await assertCreditCapsAvailable(input.eventId, input.wallets, bundleById);
  await assertBundleQuantityLimits(input.wallets, bundleById);

  const subtotalCents = input.wallets.reduce((total, wallet) => {
    const bundle = bundleById.get(wallet.bundleId);
    return total + (bundle?.priceCents ?? 0);
  }, 0);
  const donationCents = input.donationCents ?? 0;
  const platformFeePercent = Number(event.platformFeePercent);
  const platformFeeCents = calculatePlatformFeeCents(
    subtotalCents + donationCents,
    platformFeePercent
  );
  const totalCents = subtotalCents + donationCents + platformFeeCents;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        eventId: input.eventId,
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        paymentMethod: PaymentMethod.COMP,
        paymentStatus: PaymentStatus.COMPED,
        subtotalCents,
        donationCents,
        platformFeeCents,
        totalCents: 0,
        acceptedTermsAt: new Date(),
        adminNote:
          input.adminNote ??
          `Local MVP checkout. Calculated buyer total would be ${totalCents} cents.`
      }
    });

    const createdWallets = [];

    for (const walletInput of input.wallets) {
      const bundle = bundleById.get(walletInput.bundleId);

      if (!bundle) {
        throw new Error("Selected bundle is not available.");
      }

      const wallet = await tx.wallet.create({
        data: {
          eventId: input.eventId,
          orderId: order.id,
          displayName: walletInput.displayName,
          manualCode: await createUniqueManualCode(tx, input.eventId),
          recipientEmail: walletInput.recipientEmail || input.buyerEmail
        }
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          bundleId: bundle.id,
          walletId: wallet.id,
          quantity: 1,
          unitPriceCents: bundle.priceCents
        }
      });

      await tx.creditLedgerEntry.createMany({
        data: bundle.credits.map((credit) => ({
          eventId: input.eventId,
          walletId: wallet.id,
          creditTypeId: credit.creditTypeId,
          type: LedgerEntryType.PURCHASE,
          amount: credit.quantity,
          reason: "Local MVP checkout",
          sourceId: order.id
        }))
      });

      createdWallets.push(wallet);
    }

    return {
      order,
      wallets: createdWallets,
      calculatedTotalCents: totalCents
    };
  });
}

async function assertCreditCapsAvailable(
  eventId: string,
  selections: WalletBundleSelection[],
  bundleById: Map<string, { credits: { creditTypeId: string; quantity: number }[] }>
) {
  const requestedByCreditType = new Map<string, number>();

  for (const selection of selections) {
    const bundle = bundleById.get(selection.bundleId);

    for (const credit of bundle?.credits ?? []) {
      requestedByCreditType.set(
        credit.creditTypeId,
        (requestedByCreditType.get(credit.creditTypeId) ?? 0) + credit.quantity
      );
    }
  }

  const creditTypes = await prisma.creditType.findMany({
    where: {
      eventId,
      id: {
        in: [...requestedByCreditType.keys()]
      }
    }
  });

  const issuedEntries = await prisma.creditLedgerEntry.groupBy({
    by: ["creditTypeId"],
    where: {
      eventId,
      type: {
        in: [
          LedgerEntryType.PURCHASE,
          LedgerEntryType.TOP_UP,
          LedgerEntryType.BONUS,
          LedgerEntryType.COMP,
          LedgerEntryType.MANUAL_ADJUSTMENT
        ]
      }
    },
    _sum: {
      amount: true
    }
  });

  for (const creditType of creditTypes) {
    const requested = requestedByCreditType.get(creditType.id) ?? 0;
    const alreadyIssued =
      issuedEntries.find((entry) => entry.creditTypeId === creditType.id)?._sum
        .amount ?? 0;

    if (alreadyIssued + requested > creditType.cap) {
      throw new Error(`${creditType.name} credits are sold out.`);
    }
  }
}

async function assertBundleQuantityLimits(
  selections: WalletBundleSelection[],
  bundleById: Map<string, { id: string; name: string; quantityLimit: number | null; maxPerOrder: number | null }>
) {
  const requestedByBundle = new Map<string, number>();

  for (const selection of selections) {
    requestedByBundle.set(
      selection.bundleId,
      (requestedByBundle.get(selection.bundleId) ?? 0) + 1
    );
  }

  const soldItems = await prisma.orderItem.groupBy({
    by: ["bundleId"],
    where: {
      bundleId: {
        in: [...requestedByBundle.keys()]
      },
      order: {
        paymentStatus: {
          in: [PaymentStatus.PAID, PaymentStatus.COMPED]
        }
      }
    },
    _sum: {
      quantity: true
    }
  });

  for (const [bundleId, requested] of requestedByBundle.entries()) {
    const bundle = bundleById.get(bundleId);

    if (!bundle) {
      throw new Error("Selected bundle is not available.");
    }

    if (bundle.maxPerOrder && requested > bundle.maxPerOrder) {
      throw new Error(`${bundle.name} is limited to ${bundle.maxPerOrder} per order.`);
    }

    const sold = soldItems.find((item) => item.bundleId === bundleId)?._sum.quantity ?? 0;

    if (bundle.quantityLimit && sold + requested > bundle.quantityLimit) {
      throw new Error(`${bundle.name} is sold out.`);
    }
  }
}

async function createUniqueManualCode(
  tx: Prisma.TransactionClient,
  eventId: string
) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const manualCode = createManualCode();
    const existing = await tx.wallet.findUnique({
      where: {
        eventId_manualCode: {
          eventId,
          manualCode
        }
      },
      select: { id: true }
    });

    if (!existing) {
      return manualCode;
    }
  }

  throw new Error("Could not create a unique manual code.");
}
