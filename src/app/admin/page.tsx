import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const organizations = await prisma.organization.findMany({
    include: {
      events: {
        include: {
          creditTypes: true,
          bundles: true,
          vendors: true,
          wallets: true,
          redemptions: true
        },
        orderBy: [{ createdAt: "desc" }]
      }
    },
    orderBy: [{ name: "asc" }]
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8">
      <header className="flex flex-col gap-3 border-b border-black/10 pb-6">
        <Link href="/" className="text-sm font-semibold text-ember">
          Back to app
        </Link>
        <h1 className="text-3xl font-semibold text-ink">Admin Dashboard</h1>
        <p className="max-w-2xl text-sm leading-6 text-black/70">
          This first scaffold reads organizations, events, bundles, vendors, wallets,
          and redemptions from Postgres. Auth and write flows come next.
        </p>
      </header>

      <section className="grid gap-5">
        {organizations.map((organization) => (
          <article
            key={organization.id}
            className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{organization.name}</h2>
            <div className="mt-5 grid gap-4">
              {organization.events.map((event) => (
                <div
                  key={event.id}
                  className="grid gap-4 rounded-md border border-black/10 p-4 md:grid-cols-5"
                >
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-leaf">
                      {event.status.replace("_", " ")}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{event.name}</h3>
                    <p className="mt-1 text-sm text-black/60">{event.locationName}</p>
                  </div>
                  <Stat label="Credit types" value={event.creditTypes.length} />
                  <Stat label="Bundles" value={event.bundles.length} />
                  <Stat label="Vendors" value={event.vendors.length} />
                  <Stat label="Wallets" value={event.wallets.length} />
                  <Stat label="Redemptions" value={event.redemptions.length} />
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-black/50">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
