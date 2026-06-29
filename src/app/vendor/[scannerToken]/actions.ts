"use server";

import { VendorStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redeemCredit } from "@/lib/redemptions";
import { prisma } from "@/lib/prisma";

const redeemSchema = z.object({
  scannerToken: z.string().min(1),
  walletLookup: z.string().trim().min(1, "Enter a wallet URL or manual code."),
  creditTypeId: z.string().optional(),
  idChecked: z.string().optional()
});

export async function redeemCreditAction(
  _previousState: { ok: boolean; message: string },
  formData: FormData
) {
  const parsed = redeemSchema.parse({
    scannerToken: formData.get("scannerToken"),
    walletLookup: formData.get("walletLookup"),
    creditTypeId: formData.get("creditTypeId") || undefined,
    idChecked: formData.get("idChecked") || undefined
  });

  const result = await redeemCredit({
    scannerToken: parsed.scannerToken,
    walletLookup: parsed.walletLookup,
    creditTypeId: parsed.creditTypeId,
    idChecked: parsed.idChecked === "on"
  });

  revalidatePath(`/vendor/${parsed.scannerToken}`);

  return result;
}

const statusSchema = z.object({
  scannerToken: z.string().min(1),
  status: z.nativeEnum(VendorStatus)
});

export async function updateVendorStatus(formData: FormData) {
  const parsed = statusSchema.parse({
    scannerToken: formData.get("scannerToken"),
    status: formData.get("status")
  });

  await prisma.vendor.update({
    where: {
      scannerToken: parsed.scannerToken
    },
    data: {
      status: parsed.status
    }
  });

  revalidatePath(`/vendor/${parsed.scannerToken}`);
}
