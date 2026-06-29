import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { createTestEvent } from "../helpers/testData";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("buyer creates wallets and vendor redeems a credit", async ({ page }) => {
  const fixture = await createTestEvent(prisma, {
    slug: `e2e-chili-${Date.now()}`
  });
  const eventPath = `/e/${fixture.organization.slug}/${fixture.event.slug}`;
  const persistedEvent = await prisma.event.findFirst({
    where: {
      slug: fixture.event.slug,
      organization: {
        slug: fixture.organization.slug
      }
    }
  });

  expect(persistedEvent?.id).toBe(fixture.event.id);

  await page.goto(eventPath);
  await expect(page.getByRole("heading", { name: fixture.event.name })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Buy tasting passes" })).toBeVisible();

  await page.getByLabel("Buyer name").fill("Playwright Buyer");
  await page.getByLabel("Buyer email").fill("playwright@example.com");
  await page.getByLabel("Wallet name").first().fill("Playwright Guest One");
  await page.getByLabel("Extra donation").fill("5");
  await page.getByLabel(/non-refundable/).check();
  await page.getByRole("button", { name: "Create Wallets" }).click();

  await expect(page.getByRole("heading", { name: "Order Confirmed" })).toBeVisible();
  await expect(page.getByText("Playwright Guest One")).toBeVisible();

  await page.getByRole("link", { name: /Playwright Guest One/ }).click();
  await expect(page.getByRole("heading", { name: "Playwright Guest One" })).toBeVisible();
  await expect(page.getByText("Total credits remaining")).toBeVisible();
  await expect(page.getByText("Manual code:")).toBeVisible();

  const manualCodeText = await page
    .locator("text=Manual code:")
    .locator("span")
    .innerText();

  await page.goto(`/vendor/${fixture.vendor.scannerToken}`);
  await expect(page.getByRole("heading", { name: fixture.vendor.name })).toBeVisible();
  await page.getByLabel("Wallet URL or manual code").fill(manualCodeText);
  await page.getByRole("button", { name: "Redeem 1 Credit" }).click();

  await expect(page.getByText("Redeemed 1 credit for Playwright Guest One.")).toBeVisible();
  await expect(page.getByText("Playwright Guest One", { exact: true })).toBeVisible();

  await page.goto(eventPath);
  await expect(page.getByText("Test Vendor")).toBeVisible();
});
