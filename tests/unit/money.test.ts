import { describe, expect, it } from "vitest";
import { calculatePlatformFeeCents, formatCents } from "@/lib/money";

describe("money helpers", () => {
  it("formats cents as USD by default", () => {
    expect(formatCents(3599)).toBe("$35.99");
  });

  it("rounds platform fee cents", () => {
    expect(calculatePlatformFeeCents(3090, 3)).toBe(93);
  });

  it("does not charge a fee for zero totals or zero percent", () => {
    expect(calculatePlatformFeeCents(0, 3)).toBe(0);
    expect(calculatePlatformFeeCents(1000, 0)).toBe(0);
  });
});
