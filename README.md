# Event Tasting Pass

Docker-first local scaffold for a charity tasting pass platform.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Stripe Checkout + Stripe Connect
- Docker Compose

## Local Development

Copy the example environment file if you want to run commands directly on the host:

```bash
cp .env.example .env
```

For Stripe development, set:

```txt
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

The local MVP checkout still works without Stripe keys; production checkout will
require them.

Start the full Docker environment:

```bash
docker compose up --build
```

The app will be available at:

```txt
http://localhost:3000
```

The database will be available on:

```txt
localhost:5432
```

## Seed Data

After the app has started and migrations have run, seed demo data:

```bash
docker compose exec app npm run db:seed
```

The seed creates:

- Demo Charity organization
- Charity Chili Cook-Off event
- Food and Drink credit types
- Combo Pass bundle
- Chili and beer garden vendors
- Demo wallet with food and drink credits

## Test Buying a Wallet

After seeding, open:

```txt
http://localhost:3000/e/demo-charity/chili-cookoff
```

Use the test checkout form to create a comped local wallet from an available
bundle. No payment is collected. After submit, the app redirects to the new
wallet page.

Production checkout will use Stripe Checkout with Stripe Connect so each
organization can connect its own Stripe account. Manual payments are admin-only
support flows, not the primary buyer checkout path.

## Useful Commands

```bash
docker compose up --build
docker compose exec app npm run db:seed
docker compose exec app npx prisma studio
docker compose exec app npm run test
docker compose exec app npm run test:e2e
docker compose down
```

## Tests

Unit/integration tests use Vitest and Prisma:

```bash
docker compose exec app npm run test
```

Browser MVP flow tests use Playwright. The Docker image includes Alpine Chromium
for this:

```bash
docker compose exec app npm run test:e2e
```

## Product Spec

See [PRODUCT_SPEC.md](./PRODUCT_SPEC.md).
