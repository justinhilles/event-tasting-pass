# Event Tasting Pass Product Spec

## Overview

Event Tasting Pass is a multi-organization, multi-event web platform for charity tasting events. Guests buy tasting credit bundles, receive transferable mobile wallet links, and redeem credits at participating vendors. Vendors use a mobile web scanner to redeem credits with minimal setup. Organizers manage events, vendors, bundles, credit caps, reporting, and support.

The first event use case is a charity chili cook-off with a beer garden. Voting is handled in a separate platform, so this system focuses on credit sales, wallet delivery, vendor redemption, inventory/cap tracking, and reporting.

## Core Concepts

- One organization can run many events.
- Multiple organizations can use the same platform.
- Each organization connects its own payment account.
- Each event defines its own credit types, bundles, vendors, caps, rules, branding, and policies.
- Guests purchase bundles, not arbitrary individual credits.
- A buyer can purchase multiple wallets in one order.
- Wallets are transferable by secure link/QR code.
- QR codes encode the full secure wallet URL.
- Each wallet also has a short manual backup code.
- Credits expire at the event's redemption end time.
- Purchases are non-refundable; unused credits expire and are treated as part of the charity/event contribution.

## Roles

### Super Admin

- Create and manage organizations.
- View all organizations and events.
- Configure platform-level settings.
- Configure or override event platform fee settings.
- View payment connection status.
- View platform fees collected.
- Support organizations.
- Use view-as/impersonation tools with audit logging.
- Access system-wide audit logs.

### Organization Admin

- Create and manage events for their organization.
- Invite/manage organization users.
- Connect/manage the organization's payment account through hosted provider onboarding.
- Configure event details, credit types, bundles, vendors, sponsors, policies, and branding.
- Send bulk event update emails.
- Override credit-type caps with required reason/note.
- Manage manual payments, adjustments, and support actions.

### Event Manager

- May manage event operations depending on organization permissions.
- Cannot send bulk event update emails in MVP unless promoted to Organization Admin.

### Support Volunteer

- Search buyer/order/wallet records.
- Resend wallet links.
- Show or print wallet QR codes.
- View remaining credits and tasted/not tasted lists.
- Record support notes.
- Void recent redemptions within the same configured correction window as vendors.
- Cannot create arbitrary credits, override caps, change payment settings, change platform fees, or send bulk emails.

### Vendor

- Access scanner via vendor magic link/QR and optional PIN.
- Scanner link is tied to one vendor.
- Scan wallet QR or enter manual backup code.
- Redeem credits.
- View own redemption count and recent activity.
- Void own recent redemption within configured event window.
- Update own vendor status.
- Cannot search wallets by name/email.
- Cannot see buyer email, order details, payment details, other wallet links, or full wallet history.

## Organization Model

- Super Admin manually creates organizations and invites Organization Admins in MVP.
- Self-service organization signup is future scope.
- Each organization can have its own branding and payment settings.
- Each organization connects its own payment account, expected to be Stripe Connect or equivalent.
- Online sales are disabled until the organization's payment account is fully connected and charges are enabled.
- Manual payments may still be recorded if enabled.

## Event Model

Each event belongs to one organization and includes:

- Event name, description, date/time, location, timezone.
- Public event page branding.
- Sales window.
- Redemption window.
- Event status.
- Credit types and caps.
- Credit bundles.
- Vendors and vendor categories.
- Sponsor listings.
- Policy text.
- Receipt footer text.
- Platform fee settings.
- Optional processing fee recovery setting.
- Donation settings.
- Manual payment settings.

Event statuses:

- Draft
- Published
- Sales paused
- Postponed
- Cancelled
- Completed

Events have a public notice field:

- Notice title
- Notice body
- Notice active flag

The notice can appear on the public event page, checkout, wallet page, and admin dashboard.

## Credit Types

Events support multiple credit types.

Example credit types:

- Food
- Drink
- Dessert
- VIP

Vendors can be configured to accept one or more credit types.

Examples:

- Chili vendors accept Food credits.
- Beer garden vendors accept Drink credits.
- Dessert booths accept Dessert credits.

Wallet balances are shown by credit type when more than one credit type exists:

- Food credits: 4
- Drink credits: 2

If an event has only one credit type, the wallet can show a simpler "Credits remaining" label.

## Credit Caps

- Each event credit type has its own cap.
- All issued credits count against the relevant credit-type cap, including purchased credits, bonus/check-in credits, and comp/manual credits.
- Manual payments consume the same credit-type caps and bundle quantity limits as online checkout.
- Organization Admins and Super Admins can override credit-type caps.
- Overrides require a reason/note and are logged.
- Support Volunteers cannot override caps.

Example:

- Food credit cap: 1,000
- Drink credit cap: 300

If a bundle includes 5 Food credits and 3 Drink credits, checkout requires both:

- Food remaining >= 5
- Drink remaining >= 3

## Credit Bundles

Guests buy bundles, not arbitrary individual credits.

Bundle fields:

- Name
- Description
- Price
- Included credit allocations by credit type
- Active flag
- Visibility: public, private-link, admin-only
- Available for new wallets
- Available for top-ups
- Sales start/end
- Bundle quantity limit
- Max quantity per order

Examples:

- Chili Pass: 5 Food credits
- Beer Garden Pass: 3 Drink credits
- Combo Pass: 5 Food credits + 3 Drink credits

Bundle validation:

- Event sales window is open.
- Bundle sales window is open.
- Bundle is active.
- Bundle is available for the purchase context: new wallet or top-up.
- Bundle quantity limit has not been reached.
- Per-order bundle quantity limit is not exceeded.
- Credit-type caps have enough remaining inventory.

Sold-out bundles should remain visible as sold out. Sales-ended bundles may remain visible if previously visible. Future bundles should be hidden unless configured to show as coming soon. Private/admin-only bundles are hidden from the public event page.

Private-link bundles:

- Hidden from public page.
- Accessible to anyone with the private link in MVP.
- Still respect sales windows, quantity limits, and credit-type caps.
- Tracked in reports.

Per-buyer lifetime limits across multiple orders are not included in MVP.

## Wallets

- A buyer can purchase multiple wallets in one order.
- Each wallet has a display name.
- If no display name is entered, the system can use Wallet 1, Wallet 2, etc.
- Wallets are transferable by secure link/QR.
- No guest login is required.
- Whoever has the wallet link can use the credits.
- Admins can reissue/deactivate the wallet access token if a link is misused.
- Reissuing keeps credits, redemption history, and order history attached to the same wallet while invalidating old links/QR codes.

Wallet QR code:

- Encodes the full secure wallet URL.
- Example: `https://eventpass.app/w/secure-long-token`

Manual backup code:

- Separate short code.
- Example: `K7M-42P`

Wallet page should show:

- Wallet display name.
- Credits remaining by credit type.
- QR/pass with show/hide behavior.
- Manual backup code.
- Event timing/expiration message.
- Vendor list.
- Live available vendor count during event.
- Vendor statuses.
- Simple tasted/not tasted grouping.
- Buy more credits button when eligible.

Wallet page should not show detailed redemption timestamps to guests.

Wallet status messages:

- Before event: Tastings open at [time].
- During event: Credits expire at [time].
- After event: Event ended; unused credits have expired.

Printable wallets are included in MVP and should include:

- Event name.
- Wallet display name.
- QR code.
- Manual backup code.
- Event date/time.
- Support note.

Avoid printing static remaining-credit balances unless generated immediately before use, because balances can change.

## Wallet Delivery

MVP supports email delivery.

- Buyer always receives all wallet links.
- Each wallet can optionally have a recipient email.
- If recipient email is provided, that recipient receives their own wallet link.
- Buyer confirmation page displays all wallet links and QR codes.
- Mobile browser share button can be used for manual texting.

SMS/text delivery is future scope.

Future SMS scope:

- Recipient phone per wallet.
- SMS wallet delivery.
- SMS resend.
- Opt-in/compliance handling.
- SMS provider cost tracking.

## Top-Ups

Guests can buy more credits during the event if:

- Sales window is open.
- Relevant bundle is available for top-ups.
- Event credit-type caps have inventory.
- Online checkout is available.

Top-ups:

- Must be purchased as bundles.
- Cannot be individual credits.
- Apply only to the wallet from which the top-up flow was started.
- Can be purchased by anyone with the wallet link.
- Receipt goes to the email entered at top-up checkout.

If a wallet cannot receive a specific bundle due to bundle rules or caps, the bundle is unavailable.

## Checkout

Checkout supports:

- New wallet purchases.
- Wallet top-ups.
- Multiple wallets per order.
- Credit bundles.
- Optional extra donation.
- Platform fee added on top.
- Optional processing fee recovery.
- Promo/comp codes.
- Required terms/policy acceptance.

MVP payment methods:

- Online checkout.
- Manual Venmo.
- Manual cash.
- Manual check/other.
- Comp/manual admin credit.

Online payments:

- Each organization uses its own connected payment account.
- Online checkout is disabled until payment account is ready.

Manual payments:

- Admin-only.
- Vendors cannot create or sell credits.
- May be used even if the online payment account is not connected.
- Consume the same credit-type caps and bundle quantity limits as online checkout.
- No automatic platform fee in MVP.

Day-of-event purchases:

- Allowed while the sales window is open and inventory remains.

## Donations

Checkout supports optional extra donations.

Donation controls:

- Preset donation buttons.
- Custom amount.
- No thanks option.
- Configurable per event.

Donation rules:

- Donation does not add credits.
- Donation goes to the organization/event.
- Donation appears separately in reports.
- Promo codes do not discount donations.
- Platform fee applies to donations for online checkout.

## Platform Fee

- Percentage platform fee offsets platform costs.
- Fee is configurable per event.
- Only Super Admins or platform admins can set/change it.
- Fee is added on top of buyer checkout total.
- Fee applies after bundle discounts.
- Fee applies to full online checkout amount after discounts, including extra donations.
- Fee applies to online checkout only in MVP.
- Manual Venmo/cash/check/comp payments do not automatically add platform fee.

Example:

- Credits after discount: $20.00
- Extra donation: $10.00
- Fee basis: $30.00
- Platform fee 3%: $0.90
- Total: $30.90

## Processing Fee Recovery

- Optional per event.
- Recommended mode: optional checkbox at checkout.

Example:

- Add $1.10 to help cover card processing fees.

This is separate from the platform fee.

## Promo And Comp Codes

Event-level promo codes are included.

Types:

- Percentage discount.
- Fixed dollar discount.
- Free/comp wallet.
- Bonus credits.

Controls:

- Usage limit.
- Valid dates.
- Minimum purchase.
- Specific bundles only.
- Active/inactive.

Rules:

- Promo codes apply to credit bundles only.
- Extra donations are not discounted.
- Discount applies before platform fee.
- Platform fee is calculated on discounted checkout subtotal plus donations.
- For fully comped checkout, platform fee is $0.

## Refunds And Expiration

- Public policy: purchases are non-refundable.
- Unused credits expire after the event redemption window.
- Unused credits are treated as part of the charity/event contribution.
- Admin exception path may exist for unusual support reasons.

Receipts should avoid automatic tax-deductibility claims.

Receipt language:

- "Thank you for supporting [Organization/Event]."
- Organization/event can set custom receipt footer text.

No tax calculation is included in MVP.

Future tax scope:

- Optional tax calculation, such as Stripe Tax or similar, if needed.

## Vendor Redemption

Primary flow:

1. Vendor opens mobile scanner via magic link/QR.
2. Vendor scans guest wallet QR or enters manual backup code.
3. Scanner validates wallet, credits, event timing, vendor rules, and credit type.
4. Vendor taps Redeem.
5. System records redemption and decrements the relevant credit balance.

Vendor scanner should show minimal info:

- Wallet display name.
- Credits remaining for accepted credit types.
- Whether already redeemed at this vendor.
- Redemption action/status.

Hidden from vendors:

- Buyer email.
- Recipient email.
- Order details.
- Payment details.
- Other wallet links.
- Full redemption history.

Default vendor redemption rule:

- One redemption per vendor per wallet, unless vendor-specific settings allow more.

Each vendor can have its own max redemptions per wallet.

Examples:

- Chili vendor: 1
- Beer garden: 5
- Wine booth: 3
- Dessert booth: 2

Each redemption costs exactly 1 credit of one accepted credit type in MVP.

If a vendor accepts multiple credit types, scanner can present eligible choices.

## Alcohol And Age Verification

Age handling is event/vendor configurable.

Events can mark age-restricted areas/items.
Vendors can be marked age-restricted.

Alcohol vendor scanner flow:

1. Scan wallet.
2. Show wallet validity/credits.
3. Show age-restricted warning.
4. Vendor checks physical ID.
5. Vendor taps "ID Checked - Redeem 1 Credit."
6. Redemption records `id_checked = true`.

Age verification is recorded per alcohol redemption in MVP.

The app should not be the only age verification mechanism. Staff must still check physical ID where required.

Checkout can include age-related acknowledgement:

- "I confirm that any attendee using alcohol tasting credits is 21+ and must show valid ID before receiving alcohol."

Wallet page can show:

- "Alcohol tastings require valid ID."

## Vendor Status

Vendor status values:

- Available
- Low supply
- Paused
- Sold out

Vendors can update their own status.
Admins can update any vendor status.

Status is a soft warning, not a hard block.

Example:

- Vendor status: Sold out
- Scanner shows: "This vendor is marked sold out. Redeem anyway?"
- Vendor/admin can still confirm redemption.

Guest wallet page should show vendor statuses.

Live event summary:

- Vendors available: 12 of 15
- Low supply: 2
- Sold out: 1

Available vendors are vendors with status Available or Low supply.
Unavailable vendors are Paused or Sold out.

## Vendor Capacity

Vendor capacity is an estimate only.

- It is used for planning and reports.
- It does not block redemption.
- Vendors can redeem as many credits as they want.

Example report:

- Estimated capacity: 150
- Redeemed: 184
- Status: over estimate

## Vendor Backup

MVP includes printable vendor backup sheets.

Backup sheet should include:

- Event name.
- Vendor name.
- Vendor scanner magic link/QR.
- Support phone/email.
- Manual redemption columns:
  - Wallet code
  - Wallet display name
  - Time
  - Staff initials
  - Notes

## Voids And Corrections

Vendor correction:

- Vendors can void their own recent redemption within configured event window.

Support volunteer correction:

- Support volunteers can void recent redemptions within the same configured window.

Admin correction:

- Admins can void any redemption.
- Admins can manually redeem credits on behalf of a vendor.
- Admin manual redemptions require vendor selection and reason/note.
- Admin manual redemptions count toward vendor totals.

Voided redemptions:

- Restore the credit.
- Remain in audit log.
- Are marked voided, not hard-deleted.

Suggested event setting:

- `vendor_void_window_minutes = 2` or `5`

## Check-In Rewards

External check-in app is separate.

MVP support:

- Admin-managed manual bonus credits.
- CSV import for check-ins.
- Secured API endpoint for future/import integration.

Check-in reward rules:

- Configurable per event.
- Bonus credits count against the relevant credit-type cap.
- Credit ledger records source/reason.

Suggested fields:

- Check-in rewards enabled.
- Check-ins required for bonus credit.
- Bonus credits awarded.
- Max bonus credits per wallet.
- Eligible credit type.

CSV import should:

- Preview matches before confirmation.
- Match by wallet code first, then email/phone if available.
- Skip duplicates.
- Show unmatched rows.
- Award bonus credits when rules are met.

API endpoint future/MVP integration:

- Secured check-in import endpoint.
- Requires API key or signed token.
- Requires idempotency key or external check-in ID.
- Logs raw payload.

## Voting

Voting is handled in a separate platform for MVP.

This system may export redemption data to help reconcile external voting:

- Wallet code.
- Wallet display name.
- Vendors tasted.
- Redemption timestamps.

No voting UI is included in MVP.

## Public Event Page

Structured branding, not a full website builder.

Fields:

- Event name.
- Organization logo.
- Event hero image.
- Primary color.
- Event description.
- Date/time.
- Location.
- Participating vendors.
- Sponsor logos.
- FAQ/policy text.
- Checkout button text.

Public page should show:

- Participating vendors.
- Credit bundles.
- Sponsors.
- Event notice if active.
- Sold-out/sales-ended bundles.

Public vendor list/map:

- Public vendor list before purchase.
- Wallet page also shows vendor list.
- Map optional per event.

## Sponsors

Events can display sponsor logos/listings.

Sponsor fields:

- Name.
- Logo.
- Website link.
- Sponsor tier.
- Display order.
- Optional description.

Sponsors can appear on:

- Public event page.
- Confirmation page.
- Wallet page.

## Vendor Categories

Events support configurable vendor categories.

Examples:

- Chili
- Beer Garden
- Dessert
- Sponsor
- Entertainment

Uses:

- Public event page grouping.
- Wallet vendor list grouping.
- Admin filtering.
- Reports.
- Map/list display.

Admins manage vendor profiles in MVP.
Vendor self-service profile editing is future scope.

## Email

MVP includes automatic email delivery.

Email types:

- Checkout confirmation/receipt.
- Wallet delivery email.
- Admin-created order email.
- Wallet resend email.
- Vendor magic link email.
- Event update email.

Buyer email includes:

- Event name/date/time/location.
- Order summary.
- Payment summary.
- All wallet links.
- Wallet display names.
- Non-refundable policy.
- Support contact.

Bulk event update emails:

- Organization Admins only.
- Recipient groups:
  - Buyers only.
  - Wallet recipients only.
  - Buyers + recipients.
- Include preview before send.

## Reporting

Admin reports:

- Event summary.
- Sales by payment method.
- Credits sold/redeemed/unused.
- Credit balances by type.
- Orders.
- Wallets.
- Credit ledger.
- Vendor redemption counts.
- Redemptions by time block.
- Manual payments.
- Manual credit adjustments.
- Promo code usage.
- Check-in reward credits.
- Platform fees.
- Donations.

CSV exports:

- Orders.
- Wallets.
- Credit balances by type.
- Credit ledger.
- Redemptions.
- Vendors.
- Manual payments.
- Promo code usage.
- Check-in imports/rewards.
- Platform fees.
- Donations.

Vendor post-event reports:

- Vendor name.
- Total redemptions.
- Estimated capacity.
- Over/under estimate.
- Redemptions by time block.
- Optional sample redemption log.

Vendors see only their own live count and recent activity during event.
Vendors do not see other vendors' counts.

## Admin Dashboard Alerts

MVP includes basic dashboard alerts, not complex automated alerting.

Alerts:

- Credit type near sold out.
- Bundle sold out.
- Payment account disconnected.
- Email failures.
- Scanner/redeem errors.
- Event sales window closed.
- Event redemption window ending soon.
- Vendors marked sold out/paused.

## Event Setup Checklist

MVP includes setup checklist before publishing.

Required items:

- Event details complete.
- At least one credit type.
- Credit caps configured.
- At least one active bundle.
- Sales/redemption windows set.
- Payment account connected for online sales.
- Policy/terms configured.

Optional warnings:

- No vendors added.
- No sponsors added.
- No hero image.
- Vendor scanner links not sent.

## Test Mode

MVP includes test mode.

Test mode supports:

- Create test wallets.
- Run scanner redemptions.
- Void redemptions.
- Preview emails.
- Preview checkout.

Test data:

- Clearly marked.
- Does not affect real credit caps, real payments, or official reports.
- Can be cleared/deleted by admins.

Real transactional data:

- Cannot be hard-deleted through normal admin tools.
- Mistakes handled through voids, adjustments, cancellations, or refunds if applicable.

## API Scope

MVP API scope:

- Internal/admin API only.
- No general public organizer API.

Allowed integration endpoints:

- Payment provider webhooks.
- Secured check-in import endpoint.
- CSV import flow.
- Vendor scanner endpoints.
- Wallet/top-up checkout endpoints.

Future API scope:

- Public organizer API with API keys, scopes, rate limits, and documentation.

## MVP Scope

Included:

- Multi-organization, multi-event model.
- Super admin dashboard.
- Manual organization creation/invites.
- Organization admin event creation.
- Organization payment account connection.
- Public event page.
- Structured event branding.
- Credit types and per-type caps.
- Bundles with schedules, visibility, quantity limits, and per-order limits.
- New wallet purchases.
- Wallet top-ups by bundle.
- Multiple wallets per order.
- Transferable wallet links/QR codes.
- Manual backup wallet codes.
- Email delivery.
- Optional recipient email per wallet.
- Printable wallets.
- Vendor scanner mobile web flow.
- Vendor magic links/optional PIN.
- Vendor status updates.
- Vendor soft warning for sold out/paused.
- Age-restricted vendor flow with per-redemption ID checked confirmation.
- Vendor/support/admin void rules.
- Admin manual payments.
- Manual Venmo/cash/check/comp records.
- Promo/comp codes.
- Donations.
- Buyer-paid platform fee for online checkout.
- Optional processing fee recovery.
- Terms/policy acceptance.
- Event notices/status.
- Event update emails by Organization Admins.
- Check-in reward manual adjustment plus CSV/API import pathway.
- CSV exports.
- Reporting.
- Setup checklist.
- Test mode.
- Basic dashboard alerts.

## Future / Fast-Follow Features

- SMS wallet delivery.
- Custom event/organization domains.
- Self-service organization signup.
- Public organizer API.
- Invoice-style unpaid orders.
- Event duplication/copying.
- Vendor self-service profile editing.
- Full offline redemption sync.
- Waitlists/restock notifications.
- Tax calculation integration.
- Advanced automated alerting.
- Wallet pass support such as Apple Wallet/Google Wallet.
- Direct voting integration.
- Access-controlled private bundle links with allowlists.

## Recommended Technical Direction

The product should be a responsive web app, not native mobile apps.

Suggested architecture:

- Frontend/backend: Next.js or similar full-stack web framework.
- Database: PostgreSQL.
- Payments: Stripe Connect for organization-owned payment accounts.
- Emails: Resend, Postmark, or similar transactional provider.
- QR generation: server-generated or client-rendered QR from secure wallet URL.
- Hosting: Vercel or equivalent.

Mobile web support is essential for:

- Guest wallet.
- Vendor scanner.
- Support/admin tablet workflows.

Admin dashboards can be optimized for desktop/tablet.
