import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await prisma.event.findMany({
    include: {
      organization: true,
      creditTypes: true,
      bundles: {
        include: {
          credits: {
            include: {
              creditType: true
            }
          }
        }
      },
      vendors: {
        include: {
          category: true
        },
        orderBy: [{ name: "asc" }]
      }
    },
    orderBy: [{ createdAt: "desc" }]
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-5 py-8 sm:px-8">
      <header className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ember">
            Docker-first scaffold
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-ink sm:text-5xl">
            Event Tasting Pass
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
            A starter build for charity tasting events with credit bundles, mobile
            wallets, vendor redemptions, and organization-owned events.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white"
        >
          Open Admin
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Events" value={events.length} />
        <Metric
          label="Credit Types"
          value={events.reduce((total, event) => total + event.creditTypes.length, 0)}
        />
        <Metric
          label="Vendors"
          value={events.reduce((total, event) => total + event.vendors.length, 0)}
        />
      </section>

      <section className="grid gap-5">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-black/20 bg-white/70 p-8">
            <h2 className="text-xl font-semibold">No events yet</h2>
            <p className="mt-2 text-black/70">
              Run the seed script after migrations to create a demo chili cook-off.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-leaf">
                    {event.organization.name}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">{event.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-black/65">
                    {event.description}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-corn/25 px-3 py-1 text-xs font-semibold text-ink">
                  {event.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-semibold">Credit Types</h3>
                  <ul className="mt-2 space-y-1 text-sm text-black/70">
                    {event.creditTypes.map((type) => (
                      <li key={type.id}>
                        {type.name}: cap {type.cap}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Bundles</h3>
                  <ul className="mt-2 space-y-1 text-sm text-black/70">
                    {event.bundles.map((bundle) => (
                      <li key={bundle.id}>
                        {bundle.name}: ${(bundle.priceCents / 100).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Vendors</h3>
                  <ul className="mt-2 space-y-1 text-sm text-black/70">
                    {event.vendors.map((vendor) => (
                      <li key={vendor.id}>
                        {vendor.name}
                        {vendor.category ? ` (${vendor.category.name})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5">
                <Link
                  href={`/e/${event.organization.slug}/${event.slug}`}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-ember px-4 text-sm font-semibold text-white"
                >
                  Test Buy Wallet
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-black/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
