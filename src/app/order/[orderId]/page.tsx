import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    include: {
      event: {
        include: {
          organization: true
        }
      },
      wallets: {
        orderBy: {
          createdAt: "asc"
        }
      },
      items: {
        include: {
          bundle: true,
          wallet: true
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-ember">{order.event.organization.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Order Confirmed</h1>
        <p className="mt-2 text-sm leading-6 text-black/65">
          {order.event.name} wallets are ready. In production this confirmation will
          be created after Stripe confirms payment.
        </p>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Wallets</h2>
        <div className="mt-4 grid gap-3">
          {order.wallets.map((wallet) => {
            const item = order.items.find((orderItem) => orderItem.walletId === wallet.id);

            return (
              <Link
                key={wallet.id}
                href={`/w/${wallet.accessToken}`}
                className="flex items-center justify-between rounded-md border border-black/10 px-3 py-3 hover:bg-paper"
              >
                <span>
                  <span className="block font-semibold">{wallet.displayName}</span>
                  <span className="text-sm text-black/60">
                    {item?.bundle.name ?? "Wallet"} · Code {wallet.manualCode}
                  </span>
                </span>
                <span className="text-sm font-semibold text-ember">Open</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Summary</h2>
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt>Bundles</dt>
            <dd>{formatCents(order.subtotalCents, order.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Donation</dt>
            <dd>{formatCents(order.donationCents, order.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Platform fee</dt>
            <dd>{formatCents(order.platformFeeCents, order.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-2 font-semibold">
            <dt>Total</dt>
            <dd>{formatCents(order.subtotalCents + order.donationCents + order.platformFeeCents, order.currency)}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
