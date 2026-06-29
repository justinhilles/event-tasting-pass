# Event Tasting Pass Task Backlog

This backlog is derived from `PRODUCT_SPEC.md`. It is organized roughly by build order, with MVP work first and future/fast-follow work later.

## 0. Project Foundation

- [x] Create private GitHub repository.
- [x] Add product specification.
- [x] Scaffold Next.js, TypeScript, Tailwind, Prisma, PostgreSQL, and Docker Compose.
- [x] Add initial Prisma schema.
- [x] Add Docker-first local development setup.
- [x] Add demo seed data.
- [x] Add starter home, admin, wallet, vendor, and test event pages.
- [x] Commit and push scaffold.
- [x] Add Vitest unit/integration test setup.
- [x] Add Playwright E2E test setup.
- [x] Add MVP checkout-to-redemption E2E coverage.
- [ ] Add CI checks for typecheck, lint, Prisma validation, and build.
- [ ] Add `.env.example` coverage for all required runtime variables.
- [ ] Decide deployment environments: local, staging, production.
- [ ] Configure Netlify project.
- [ ] Configure production/staging database.
- [ ] Document local setup, seeding, and troubleshooting.

## 1. Data Model And Database

- [x] Model organizations.
- [x] Model users and organization memberships.
- [x] Model events.
- [x] Model event statuses.
- [x] Model credit types and per-type caps.
- [x] Model credit bundles and bundle credit allocations.
- [x] Model vendor categories.
- [x] Model vendors.
- [x] Model vendor accepted credit types.
- [x] Model sponsors.
- [x] Model orders.
- [x] Model order items.
- [x] Model wallets.
- [x] Model credit ledger entries.
- [x] Model redemptions and voiding.
- [x] Model audit logs.
- [ ] Add promo code models.
- [ ] Add manual payment metadata fields.
- [ ] Add event setup checklist state.
- [ ] Add event notice/versioned policy acceptance fields.
- [ ] Add test-mode flags across events, orders, wallets, redemptions, and ledger entries.
- [ ] Add check-in import/reward models.
- [ ] Add email log model.
- [ ] Add platform fee reporting fields if current order fields are insufficient.
- [ ] Add indexes for common lookup paths: wallet token, manual code, event slug, vendor scanner token, buyer email.
- [ ] Add database constraints for non-negative caps/prices/quantities where appropriate.
- [ ] Add migration review checklist before production.

## 2. Authentication And Authorization

- [ ] Choose and install auth provider.
- [ ] Implement admin sign-in.
- [ ] Implement user session handling.
- [ ] Implement Super Admin role.
- [ ] Implement Organization Admin role.
- [ ] Implement Event Manager role.
- [ ] Implement Support Volunteer role.
- [ ] Implement vendor magic-link access.
- [ ] Add optional vendor PIN protection.
- [ ] Add route protection for admin pages.
- [ ] Add organization-level authorization checks.
- [ ] Add event-level authorization checks.
- [ ] Add audit logging for privileged actions.
- [ ] Add view-as/impersonation for Super Admin with audit logging.
- [ ] Prevent vendors from accessing buyer/order/private wallet data.
- [ ] Prevent support volunteers from changing payment/platform/event settings.

## 3. Super Admin Experience

- [ ] Build Super Admin dashboard.
- [ ] List organizations.
- [ ] Create organization.
- [ ] Edit organization.
- [ ] Invite Organization Admin.
- [ ] View all events across organizations.
- [ ] View payment connection status by organization.
- [ ] Configure platform/event fee settings.
- [ ] View platform fees collected.
- [ ] Disable organization.
- [ ] Disable event.
- [ ] View audit logs.
- [ ] Add support tools for viewing org/event context.

## 4. Organization Admin Experience

- [ ] Build organization dashboard.
- [ ] List organization events.
- [ ] Create event.
- [ ] Edit event details.
- [ ] Configure organization branding.
- [ ] Manage organization users.
- [ ] Connect payment account through hosted provider onboarding.
- [ ] Show payment account status.
- [ ] Block online sales until payment account is ready.
- [ ] Configure manual payment options.
- [ ] Configure receipt footer text.
- [ ] Configure event policy text.
- [ ] Configure event notices.

## 5. Event Setup And Publishing

- [ ] Build event setup wizard or organized settings screens.
- [ ] Configure event name, description, dates, timezone, and location.
- [ ] Configure sales window.
- [ ] Configure redemption window.
- [ ] Configure event status.
- [ ] Configure event branding: logo, hero image, color, public copy.
- [ ] Configure public page FAQ/policy content.
- [ ] Configure credit types.
- [ ] Configure credit-type caps.
- [ ] Configure bundles.
- [ ] Configure vendor categories.
- [ ] Configure vendors.
- [ ] Configure sponsor listings.
- [ ] Configure donation settings.
- [ ] Configure platform fee percent.
- [ ] Configure optional processing fee recovery.
- [ ] Configure vendor void window.
- [ ] Configure alcohol/age-restricted event settings.
- [ ] Add setup checklist.
- [ ] Block publishing when required setup items are missing.
- [ ] Show warnings for optional missing items.
- [ ] Allow admins to extend sales/redemption windows during event.
- [ ] Log changes to important live settings.

## 6. Credit Types And Inventory

- [ ] Build credit type management UI.
- [ ] Add/edit/archive credit types.
- [ ] Configure per-type caps.
- [ ] Show sold/issued/redeemed/remaining by credit type.
- [ ] Enforce credit-type caps during online checkout.
- [ ] Enforce credit-type caps during manual order creation.
- [ ] Count bonus/check-in credits against caps.
- [ ] Add cap override flow for Org Admin/Super Admin.
- [ ] Require reason/note for cap override.
- [ ] Log cap override.
- [ ] Add near-sold-out admin alerts.

## 7. Bundle Management

- [ ] Build bundle management UI.
- [ ] Create bundle.
- [ ] Edit bundle.
- [ ] Archive/deactivate bundle.
- [ ] Configure bundle price.
- [ ] Configure credit allocations by type.
- [ ] Configure public/private-link/admin-only visibility.
- [ ] Generate private bundle links.
- [ ] Configure availability for new wallets.
- [ ] Configure availability for top-ups.
- [ ] Configure bundle sales start/end.
- [ ] Configure bundle quantity limit.
- [ ] Configure max quantity per order.
- [ ] Show sold-out bundles publicly.
- [ ] Show sales-ended bundles when appropriate.
- [ ] Hide future bundles unless configured as coming soon.
- [ ] Enforce bundle limits at checkout.
- [ ] Enforce bundle limits for manual orders.

## 8. Public Event Page

- [x] Add initial event page.
- [ ] Polish public event page layout.
- [ ] Display event branding.
- [ ] Display event date/time/location.
- [ ] Display event description.
- [ ] Display event notice when active.
- [ ] Display bundles and availability.
- [ ] Display sold-out/sales-ended state.
- [ ] Display participating vendors.
- [ ] Group vendors by category.
- [ ] Display sponsor logos/listings.
- [ ] Display event policies.
- [ ] Add checkout entry point.
- [ ] Add private bundle route support.
- [ ] Add event cancelled/postponed state.
- [ ] Add sales paused state.

## 9. Checkout And Orders

- [x] Add local test wallet creation flow.
- [x] Build real checkout cart for new wallets.
- [x] Allow buyer to create multiple wallets in one order.
- [x] Require wallet display names or generate defaults.
- [x] Allow optional recipient email per wallet.
- [x] Select bundles per wallet.
- [ ] Support extra donation preset buttons.
- [x] Support custom donation amount.
- [x] Add terms/policy acceptance checkbox.
- [ ] Store accepted terms/policy versions.
- [x] Calculate subtotal.
- [ ] Apply promo code discounts to bundles only.
- [ ] Exclude donations from promo discounts.
- [x] Calculate buyer-paid platform fee after discounts.
- [x] Apply platform fee to donations.
- [ ] Add optional processing fee recovery checkbox.
- [ ] Create pending order.
- [ ] Handle successful payment.
- [ ] Create wallets after successful payment.
- [x] Create order items.
- [x] Create credit ledger entries.
- [ ] Handle failed/cancelled checkout.
- [x] Build confirmation page.
- [ ] Send buyer receipt/wallet email.
- [ ] Send optional recipient wallet emails.
- [ ] Ensure online checkout is disabled without connected payment account.
- [ ] Add day-of-event purchase support.

## 10. Payment Integrations

- [x] Decide initial provider implementation: Stripe Checkout + Stripe Connect.
- [x] Add Stripe SDK.
- [ ] Add Stripe Connect onboarding for organizations.
- [x] Store connected account IDs/status.
- [ ] Create checkout sessions for event purchases.
- [ ] Add Stripe webhook endpoint.
- [ ] Verify webhook signatures.
- [ ] Handle checkout completion.
- [ ] Handle payment failure/cancellation.
- [ ] Handle platform application fees.
- [ ] Route funds to connected organization account.
- [ ] Add optional processing fee recovery.
- [ ] Add payment status reporting.
- [ ] Add admin warning when payment account disconnects.
- [ ] Add local/test payment mode docs.

## 11. Manual Payments

- [ ] Build admin manual order creation flow.
- [ ] Support cash.
- [ ] Support Venmo.
- [ ] Support check.
- [ ] Support other manual payment.
- [ ] Support comp orders.
- [ ] Enforce same credit-type caps as online checkout.
- [ ] Enforce same bundle quantity limits as online checkout.
- [ ] Require admin note for manual payments.
- [ ] Track admin who recorded manual payment.
- [ ] Send admin-created order email.
- [ ] Add manual payment reports.
- [ ] Add explicit cap override option for Org Admin/Super Admin.

## 12. Wallet Experience

- [x] Add initial wallet page.
- [ ] Generate QR code from full wallet URL.
- [x] Show manual backup code.
- [x] Show credits remaining by credit type.
- [ ] Show simple single-credit label when only one credit type exists.
- [ ] Add show/hide QR behavior.
- [ ] Add sticky Show Pass button.
- [x] Show event timing/expiration message.
- [x] Show vendor live availability count.
- [ ] Show vendors grouped by category/type.
- [ ] Show vendor statuses.
- [x] Show tasted/not tasted lists.
- [ ] Hide redemption timestamps from guests.
- [ ] Add Buy More Credits button when eligible.
- [ ] Build top-up checkout from wallet page.
- [ ] Support printable wallet.
- [ ] Handle deactivated/reissued wallet token.
- [ ] Add event ended state.
- [ ] Add sold-out/no-top-up state.

## 13. Wallet Recovery And Support

- [ ] Build support search UI.
- [ ] Search by buyer email.
- [ ] Search by buyer name.
- [ ] Search by wallet display name.
- [ ] Search by manual wallet code.
- [ ] Search by order ID.
- [ ] Show wallet QR.
- [ ] Print wallet.
- [ ] Resend wallet link.
- [ ] Reissue wallet token.
- [ ] Deactivate old wallet token.
- [ ] Record support note.
- [ ] Restrict support actions by role.
- [ ] Log recovery/reissue actions.

## 14. Vendor Scanner

- [x] Add initial vendor magic-link page.
- [ ] Add camera QR scanner.
- [x] Parse full wallet URL from QR.
- [x] Add manual wallet code entry.
- [x] Validate wallet belongs to event.
- [x] Validate wallet is active.
- [x] Validate redemption window.
- [x] Validate accepted credit type balance.
- [x] Validate vendor-specific max redemptions per wallet.
- [x] Show wallet display name only.
- [ ] Show relevant credit balances only.
- [ ] Show already-redeemed warning.
- [ ] Show vendor status soft warning.
- [x] Show age-restricted warning.
- [x] Require ID Checked action for age-restricted vendors.
- [x] Redeem one credit.
- [x] Choose credit type when vendor accepts more than one.
- [x] Create redemption record.
- [x] Create negative credit ledger entry.
- [x] Show success state.
- [x] Show recent own redemptions.
- [x] Add own-redemption count.
- [ ] Add vendor void recent redemption action.
- [ ] Enforce vendor void time window.
- [ ] Log vendor voids.
- [ ] Keep scanner mobile-first.

## 15. Vendor Status And Reporting

- [x] Allow vendor to update own status.
- [ ] Allow admins to update any vendor status.
- [x] Support Available, Low supply, Paused, Sold out.
- [x] Show status on wallet page.
- [x] Show status on public event page during live event.
- [ ] Show soft warning in scanner.
- [ ] Include statuses in admin dashboard.
- [ ] Include statuses in reports.
- [ ] Build vendor post-event report.
- [ ] Export vendor-specific CSV/PDF/report view.

## 16. Admin Redemption Tools

- [ ] Admin manually redeem credit on behalf of vendor.
- [ ] Require vendor selection.
- [ ] Require reason/note.
- [ ] Count admin redemption toward vendor total.
- [ ] Mark admin-entered in audit log.
- [ ] Admin void any redemption.
- [ ] Restore credit on void.
- [ ] Mark redemption voided rather than deleting.
- [ ] Show full redemption log with timestamps.
- [ ] Filter redemptions by vendor, wallet, credit type, status, source.
- [ ] Reconcile backup sheet redemptions.

## 17. Alcohol And Age Verification

- [ ] Configure event as having age-restricted vendors/items.
- [ ] Mark vendors as age-restricted.
- [ ] Add checkout age acknowledgement text.
- [ ] Show alcohol ID note on wallet page.
- [ ] Show age-restricted warning in vendor scanner.
- [x] Require ID Checked click before alcohol redemption.
- [x] Record `idChecked` per alcohol redemption.
- [ ] Include age-restricted/id-checked fields in audit/export.
- [ ] Keep physical ID check disclaimer visible to organizers/vendors.

## 18. Promo Codes

- [ ] Add promo code models.
- [ ] Build promo code admin UI.
- [ ] Support percentage discount.
- [ ] Support fixed dollar discount.
- [ ] Support free/comp wallet.
- [ ] Support bonus credits.
- [ ] Configure usage limits.
- [ ] Configure valid date range.
- [ ] Configure minimum purchase.
- [ ] Restrict to specific bundles.
- [ ] Activate/deactivate promo codes.
- [ ] Apply promo to bundles only.
- [ ] Track promo usage.
- [ ] Add promo code reports/export.

## 19. Donations And Receipt Language

- [ ] Configure donations enabled per event.
- [ ] Configure preset donation amounts.
- [x] Enable custom donation amount.
- [ ] Add donation UI to checkout.
- [ ] Report donations separately.
- [ ] Add custom receipt footer text per org/event.
- [ ] Avoid automatic tax-deductibility claims.
- [ ] Add no-tax calculation behavior.
- [ ] Document org responsibility for tax/legal treatment.

## 20. Emails

- [ ] Choose email provider.
- [ ] Configure transactional email sender.
- [ ] Build checkout confirmation email.
- [ ] Build wallet delivery email.
- [ ] Build recipient wallet email.
- [ ] Build admin-created order email.
- [ ] Build wallet resend email.
- [ ] Build vendor magic link email.
- [ ] Build event update email composer.
- [ ] Restrict bulk event emails to Organization Admins.
- [ ] Add recipient group selection: buyers, recipients, both.
- [ ] Add preview before send.
- [ ] Log sent emails.
- [ ] Track email delivery failures if provider supports webhooks.
- [ ] Add email failure admin alerts.

## 21. Check-In Rewards

- [ ] Build check-in reward settings.
- [ ] Configure reward credit type.
- [ ] Configure check-ins required.
- [ ] Configure bonus credits awarded.
- [ ] Configure max bonus credits per wallet.
- [ ] Admin manually add check-in reward credit.
- [ ] Require reason/note.
- [ ] Count bonus credits against credit-type cap.
- [ ] Add CSV import flow.
- [ ] Add import preview.
- [ ] Match by wallet code first.
- [ ] Match by email/phone when available.
- [ ] Skip duplicates.
- [ ] Show unmatched rows.
- [ ] Confirm import before applying.
- [ ] Add secured check-in import API endpoint.
- [ ] Require API key/signed token.
- [ ] Require external check-in ID/idempotency.
- [ ] Log raw payload.
- [ ] Add check-in reward reports.

## 22. Reporting And Exports

- [ ] Build event summary report.
- [ ] Sales by payment method.
- [ ] Credits sold/redeemed/unused by type.
- [ ] Credit balances by type.
- [ ] Orders report.
- [ ] Wallets report.
- [ ] Credit ledger report.
- [ ] Vendor redemption report.
- [ ] Redemptions by time block.
- [ ] Manual payments report.
- [ ] Manual adjustment report.
- [ ] Promo usage report.
- [ ] Check-in rewards report.
- [ ] Platform fees report.
- [ ] Donations report.
- [ ] CSV export for each major report.
- [ ] Vendor-specific post-event report.
- [ ] Super Admin platform fee rollup.

## 23. Event Update And Notices

- [ ] Event status UI.
- [ ] Public notice fields.
- [ ] Show notice on event page.
- [ ] Show notice on checkout.
- [ ] Show notice on wallet page.
- [ ] Show notice on admin dashboard.
- [ ] Support postponed/cancelled messaging.
- [ ] Sales paused behavior.
- [ ] Bulk event update email composer.
- [ ] Log sent announcements.

## 24. Test Mode

- [ ] Add test mode toggle/flow.
- [ ] Create test wallets.
- [ ] Run test scanner redemptions.
- [ ] Void test redemptions.
- [ ] Preview emails.
- [ ] Preview checkout.
- [ ] Mark all test data.
- [ ] Exclude test data from official reports.
- [ ] Exclude test data from real caps/payments.
- [ ] Clear/delete test data.
- [ ] Prevent hard-delete of real transactional data.

## 25. Monitoring And Admin Alerts

- [ ] Show credit type near sold out.
- [ ] Show bundle sold out.
- [ ] Show payment account disconnected.
- [ ] Show email failures.
- [ ] Show scanner/redeem errors.
- [ ] Show sales window closed.
- [ ] Show redemption window ending soon.
- [ ] Show vendors marked sold out/paused.
- [ ] Add basic app health page or endpoint.
- [ ] Add production error tracking later.

## 26. Deployment And Operations

- [ ] Configure Netlify build.
- [ ] Configure Netlify environment variables.
- [ ] Configure Netlify database or external Postgres.
- [ ] Configure production migration process.
- [ ] Configure preview deploys.
- [ ] Configure production domain.
- [ ] Configure Stripe webhook URL.
- [ ] Configure email provider domain verification.
- [ ] Add backup/export strategy.
- [ ] Add launch checklist.
- [ ] Add event-day runbook.
- [ ] Add support playbook for lost wallet, failed scan, payment issue, vendor phone dead.

## 27. Security And Privacy

- [ ] Ensure wallet tokens are long and unguessable.
- [ ] Ensure manual codes avoid confusing characters.
- [ ] Rate-limit manual wallet code lookup.
- [ ] Rate-limit vendor scanner attempts.
- [ ] Protect admin routes.
- [ ] Protect API endpoints.
- [ ] Validate all server actions with schemas.
- [ ] Avoid exposing buyer emails to vendors.
- [ ] Avoid exposing payment details outside admin.
- [ ] Add CSRF/session safety through chosen auth framework.
- [ ] Verify Stripe webhook signatures.
- [ ] Add audit logging for sensitive actions.
- [ ] Review data retention needs.

## 28. Future / Fast-Follow

- [ ] SMS wallet delivery.
- [ ] Custom event/organization domains.
- [ ] Self-service organization signup.
- [ ] Public organizer API.
- [ ] Invoice-style unpaid orders.
- [ ] Event duplication/copying.
- [ ] Vendor self-service profile editing.
- [ ] Full offline redemption sync.
- [ ] Waitlists/restock notifications.
- [ ] Tax calculation integration.
- [ ] Advanced automated alerting.
- [ ] Apple Wallet / Google Wallet support.
- [ ] Direct voting integration.
- [ ] Access-controlled private bundle links with allowlists.
