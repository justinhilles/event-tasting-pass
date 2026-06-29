import {
  LedgerEntryType,
  RedemptionStatus,
  VendorStatus
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type RedeemCreditResult = {
  ok: boolean;
  message: string;
};

type RedeemCreditInput = {
  scannerToken: string;
  walletLookup: string;
  creditTypeId?: string;
  idChecked?: boolean;
};

export async function redeemCredit(input: RedeemCreditInput): Promise<RedeemCreditResult> {
  const vendor = await prisma.vendor.findUnique({
    where: { scannerToken: input.scannerToken },
    include: {
      event: true,
      creditTypes: {
        include: {
          creditType: true
        }
      }
    }
  });

  if (!vendor) {
    return { ok: false, message: "Vendor scanner link was not found." };
  }

  if (
    vendor.status !== VendorStatus.AVAILABLE &&
    vendor.status !== VendorStatus.LOW_SUPPLY
  ) {
    return { ok: false, message: "This vendor is not currently accepting redemptions." };
  }

  const walletLookup = normalizeWalletLookup(input.walletLookup);
  const wallet = await prisma.wallet.findFirst({
    where: {
      eventId: vendor.eventId,
      deactivatedAt: null,
      OR: [{ manualCode: walletLookup.manualCode }, { accessToken: walletLookup.accessToken }]
    }
  });

  if (!wallet) {
    return { ok: false, message: "Wallet was not found for this event." };
  }

  const now = new Date();

  if (vendor.event.redemptionStartAt && now < vendor.event.redemptionStartAt) {
    return { ok: false, message: "Redemption has not started yet." };
  }

  if (vendor.event.redemptionEndAt && now > vendor.event.redemptionEndAt) {
    return { ok: false, message: "Credits for this event have expired." };
  }

  if (vendor.ageRestricted && !input.idChecked) {
    return { ok: false, message: "Confirm ID check before redeeming this credit." };
  }

  const acceptedCreditTypeIds = vendor.creditTypes.map((item) => item.creditTypeId);
  const creditTypeId = input.creditTypeId || acceptedCreditTypeIds[0];

  if (!creditTypeId || !acceptedCreditTypeIds.includes(creditTypeId)) {
    return { ok: false, message: "This vendor does not accept that credit type." };
  }

  const previousRedemptions = await prisma.redemption.count({
    where: {
      walletId: wallet.id,
      vendorId: vendor.id,
      status: RedemptionStatus.ACTIVE
    }
  });

  if (previousRedemptions >= vendor.maxRedemptionsPerWallet) {
    return {
      ok: false,
      message: "This wallet has already redeemed the allowed tasting here."
    };
  }

  const balance = await getWalletCreditBalance(wallet.id, creditTypeId);

  if (balance <= 0) {
    const creditTypeName =
      vendor.creditTypes.find((item) => item.creditTypeId === creditTypeId)?.creditType
        .name ?? "selected";

    return { ok: false, message: `No ${creditTypeName} credits remain on this wallet.` };
  }

  await prisma.$transaction(async (tx) => {
    const redemption = await tx.redemption.create({
      data: {
        eventId: vendor.eventId,
        walletId: wallet.id,
        vendorId: vendor.id,
        creditTypeId,
        ageRestricted: vendor.ageRestricted,
        idChecked: Boolean(input.idChecked)
      }
    });

    await tx.creditLedgerEntry.create({
      data: {
        eventId: vendor.eventId,
        walletId: wallet.id,
        creditTypeId,
        type: LedgerEntryType.REDEMPTION,
        amount: -1,
        reason: `Redeemed at ${vendor.name}`,
        sourceId: redemption.id
      }
    });
  });

  return { ok: true, message: `Redeemed 1 credit for ${wallet.displayName}.` };
}

async function getWalletCreditBalance(walletId: string, creditTypeId: string) {
  const result = await prisma.creditLedgerEntry.aggregate({
    where: {
      walletId,
      creditTypeId
    },
    _sum: {
      amount: true
    }
  });

  return result._sum.amount ?? 0;
}

function normalizeWalletLookup(value: string) {
  const trimmed = value.trim();
  const accessToken = extractAccessToken(trimmed);
  const manualCode = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");

  return {
    accessToken,
    manualCode:
      manualCode.length === 6
        ? `${manualCode.slice(0, 3)}-${manualCode.slice(3)}`
        : trimmed.toUpperCase()
  };
}

function extractAccessToken(value: string) {
  try {
    const url = new URL(value);
    const walletMatch = url.pathname.match(/\/w\/([^/]+)/);

    if (walletMatch?.[1]) {
      return walletMatch[1];
    }
  } catch {
    // Plain manual codes are expected here too.
  }

  return value.includes("/") ? "" : value;
}
