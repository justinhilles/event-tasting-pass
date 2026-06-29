export function formatCents(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(cents / 100);
}

export function calculatePlatformFeeCents(amountCents: number, percent: number) {
  if (amountCents <= 0 || percent <= 0) {
    return 0;
  }

  return Math.round(amountCents * (percent / 100));
}
