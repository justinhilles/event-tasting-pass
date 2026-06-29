import { prisma } from "@/lib/prisma";

export async function getWalletBalances(walletId: string) {
  const entries = await prisma.creditLedgerEntry.groupBy({
    by: ["creditTypeId"],
    where: { walletId },
    _sum: { amount: true }
  });

  const creditTypes = await prisma.creditType.findMany({
    where: {
      id: {
        in: entries.map((entry) => entry.creditTypeId)
      }
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });

  return creditTypes.map((creditType) => {
    const entry = entries.find((item) => item.creditTypeId === creditType.id);

    return {
      creditType,
      balance: entry?._sum.amount ?? 0
    };
  });
}

