import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createTestWallet } from "./actions";

export const dynamic = "force-dynamic";

type EventPageProps = {
  params: Promise<{
    organizationSlug: string;
    eventSlug: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { organizationSlug, eventSlug } = await params;
  const event = await prisma.event.findFirst({
    where: {
      slug: eventSlug,
      organization: {
        slug: organizationSlug
      }
    },
    include: {
      organization: true,
      creditTypes: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      },
      bundles: {
        where: {
          active: true,
          availableForNewWallet: true
        },
        include: {
          credits: {
            include: {
              creditType: true
            }
          }
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      },
      vendors: {
        include: {
          category: true
        },
        orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }]
      }
    }
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8">
      <header className="grid gap-6 border-b border-black/10 pb-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <Link href="/" className="text-sm font-semibold text-ember">
            Event Tasting Pass
          </Link>
          <p className="mt-5 text-sm font-semibold text-leaf">
            {event.organization.name}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">
            {event.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/70">
            {event.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {event.creditTypes.map((creditType) => (
              <span
                key={creditType.id}
                className="rounded-full bg-corn/25 px-3 py-1 text-xs font-semibold"
              >
                {creditType.name} cap {creditType.cap}
              </span>
            ))}
          </div>
        </div>

        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Test checkout</h2>
          <p className="mt-2 text-sm leading-6 text-black/65">
            Creates a comped local wallet from a bundle. No payment is collected.
          </p>
          {event.bundles.length === 0 ? (
            <p className="mt-4 text-sm text-black/60">No active bundles available.</p>
          ) : (
            <form action={createTestWallet} className="mt-4 grid gap-3">
              <input type="hidden" name="eventId" value={event.id} />
              <label className="grid gap-1 text-sm font-medium">
                Bundle
                <select
                  name="bundleId"
                  className="h-11 rounded-md border border-black/15 bg-white px-3 text-sm"
                  required
                >
                  {event.bundles.map((bundle) => (
                    <option key={bundle.id} value={bundle.id}>
                      {bundle.name} - ${(bundle.priceCents / 100).toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Buyer name
                <input
                  name="buyerName"
                  className="h-11 rounded-md border border-black/15 px-3 text-sm"
                  defaultValue="Demo Buyer"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Buyer email
                <input
                  name="buyerEmail"
                  type="email"
                  className="h-11 rounded-md border border-black/15 px-3 text-sm"
                  defaultValue="demo@example.com"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Wallet display name
                <input
                  name="walletDisplayName"
                  className="h-11 rounded-md border border-black/15 px-3 text-sm"
                  defaultValue="Demo Guest"
                  required
                />
              </label>
              <button
                type="submit"
                className="mt-1 h-11 rounded-md bg-ink px-4 text-sm font-semibold text-white"
              >
                Create Test Wallet
              </button>
            </form>
          )}
        </section>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {event.bundles.map((bundle) => (
          <article
            key={bundle.id}
            className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{bundle.name}</h2>
            <p className="mt-2 text-3xl font-semibold">
              ${(bundle.priceCents / 100).toFixed(2)}
            </p>
            <p className="mt-2 text-sm leading-6 text-black/65">
              {bundle.description}
            </p>
            <ul className="mt-4 space-y-1 text-sm text-black/70">
              {bundle.credits.map((credit) => (
                <li key={credit.id}>
                  {credit.quantity} {credit.creditType.name} credits
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Participating vendors</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {event.vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="rounded-md border border-black/10 px-3 py-2"
            >
              <p className="font-semibold">{vendor.name}</p>
              <p className="text-sm text-black/60">
                {vendor.category?.name ?? "Vendor"} · {vendor.status.replace("_", " ")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

