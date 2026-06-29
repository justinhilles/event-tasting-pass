import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type VendorPageProps = {
  params: Promise<{
    scannerToken: string;
  }>;
};

export default async function VendorPage({ params }: VendorPageProps) {
  const { scannerToken } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { scannerToken },
    include: {
      event: true,
      creditTypes: {
        include: {
          creditType: true
        }
      },
      redemptions: {
        where: {
          status: "ACTIVE"
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 10,
        include: {
          wallet: true
        }
      }
    }
  });

  if (!vendor) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-4 py-5">
      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-ember">{vendor.event.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{vendor.name}</h1>
        <p className="mt-2 text-sm text-black/65">
          Status: <span className="font-semibold">{vendor.status.replace("_", " ")}</span>
        </p>
        <p className="mt-1 text-sm text-black/65">
          Redemptions today: <span className="font-semibold">{vendor.redemptions.length}</span>
        </p>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Redeem credit</h2>
        <p className="mt-2 text-sm leading-6 text-black/65">
          Scanner and manual-code redemption actions come next. This page is already
          locked to the vendor magic link.
        </p>
        <div className="mt-4 rounded-md bg-paper p-4">
          <p className="text-sm font-medium text-black/60">Accepted credit types</p>
          <p className="mt-1 font-semibold">
            {vendor.creditTypes.map((item) => item.creditType.name).join(", ")}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Recent redemptions</h2>
        <div className="mt-3 grid gap-2">
          {vendor.redemptions.length === 0 ? (
            <p className="text-sm text-black/60">No redemptions yet.</p>
          ) : (
            vendor.redemptions.map((redemption) => (
              <div
                key={redemption.id}
                className="rounded-md border border-black/10 px-3 py-2"
              >
                {redemption.wallet.displayName}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
