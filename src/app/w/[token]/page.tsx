import { notFound } from "next/navigation";
import { getWalletBalances } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type WalletPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function WalletPage({ params }: WalletPageProps) {
  const { token } = await params;
  const wallet = await prisma.wallet.findUnique({
    where: { accessToken: token },
    include: {
      event: {
        include: {
          vendors: {
            include: {
              category: true,
              redemptions: {
                where: {
                  status: "ACTIVE"
                }
              }
            },
            orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }]
          }
        }
      },
      redemptions: {
        where: {
          status: "ACTIVE"
        },
        include: {
          vendor: true
        }
      }
    }
  });

  if (!wallet || wallet.deactivatedAt) {
    notFound();
  }

  const balances = await getWalletBalances(wallet.id);
  const tastedVendorIds = new Set(wallet.redemptions.map((item) => item.vendorId));
  const availableVendors = wallet.event.vendors.filter((vendor) =>
    ["AVAILABLE", "LOW_SUPPLY"].includes(vendor.status)
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-5">
      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-ember">{wallet.event.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{wallet.displayName}</h1>
        <p className="mt-2 text-sm text-black/65">
          Manual code: <span className="font-semibold">{wallet.manualCode}</span>
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {balances.map(({ creditType, balance }) => (
            <div
              key={creditType.id}
              className="rounded-md border border-black/10 bg-paper p-4"
            >
              <p className="text-sm font-medium text-black/60">
                {creditType.name} credits
              </p>
              <p className="mt-1 text-3xl font-semibold">{balance}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Live vendor status</h2>
        <p className="mt-1 text-sm text-black/65">
          {availableVendors.length} of {wallet.event.vendors.length} vendors available
        </p>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Tasted</h2>
        <div className="mt-3 grid gap-2">
          {wallet.redemptions.length === 0 ? (
            <p className="text-sm text-black/60">No tastings redeemed yet.</p>
          ) : (
            wallet.redemptions.map((redemption) => (
              <div key={redemption.id} className="rounded-md bg-leaf/10 px-3 py-2">
                {redemption.vendor.name}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Not tasted</h2>
        <div className="mt-3 grid gap-2">
          {wallet.event.vendors
            .filter((vendor) => !tastedVendorIds.has(vendor.id))
            .map((vendor) => (
              <div
                key={vendor.id}
                className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2"
              >
                <span>{vendor.name}</span>
                <span className="text-xs font-semibold text-black/55">
                  {vendor.status.replace("_", " ")}
                </span>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}
