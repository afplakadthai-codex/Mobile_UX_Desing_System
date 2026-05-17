# Bettavaro Mobile App Screen Map

This document defines the production-oriented screen map for the Bettavaro iOS and Android mobile app. It is documentation only: it does not introduce backend code, API changes, or app source code.

## 1) App Entry Flow

### Splash

- **Purpose:** Present a polished brand entry while the app prepares required runtime state.
- **Primary content:** Bettavaro wordmark, premium betta marketplace positioning, subtle loading indicator.
- **System checks:** App version, minimum supported version, device locale, network reachability, push permission status, cached session availability.
- **Exit paths:** Continue to app bootstrap, forced update message, or temporary maintenance message.

### App Bootstrap

- **Purpose:** Load the minimum state required to route the user safely.
- **Bootstrap state:** Feature flags, remote configuration, anonymous session token if supported, active cart count, notification badge count, and cached buyer/seller role summary.
- **Expected handling:** Use skeleton or branded loading state; avoid blocking the user on non-critical personalization.
- **Failure behavior:** Show a retry action and offline-friendly message if critical configuration cannot load.

### Auth Check

- **Purpose:** Determine whether the user enters as a guest or authenticated user.
- **Inputs:** Stored access token/session cookie, refresh token validity, account status, seller eligibility, and any pending checkout continuation state.
- **Authenticated route:** Main tab navigation with logged-in capabilities enabled.
- **Unauthenticated route:** Main tab navigation in guest mode with authentication prompts at protected actions.
- **Expired session route:** Guest mode with a non-blocking sign-in prompt unless the user was completing a protected payment/order action.

### Guest Mode

- **Allowed:** Browse ranked listings, search, filter, view listing details, view seller/review summaries, open gallery, and start account registration.
- **Protected actions:** Bid, make offer, add to cart, checkout, view orders, request refund, seller mode, and notification preferences.
- **UX rule:** Prompt for login/register only at the moment value is clear, such as tapping **Bid**, **Make Offer**, or **Checkout**.

### Logged-in Mode

- **Allowed:** Full buyer flow, notifications, buyer orders, refunds, account management, and seller flows when seller mode is enabled.
- **Role-aware routing:** Account tab exposes seller mode entry if the account is an approved seller or has a pending seller onboarding state.
- **Session recovery:** If payment or checkout returns from Stripe, resume the pending cart/order result before routing to the default Home tab.

## 2) Main Navigation Tabs

The mobile app uses a persistent bottom tab bar on primary screens. Detail, checkout, modal, and task-completion screens may hide the tab bar when focused completion is required.

| Tab | Primary screen | Purpose | Badge support | Guest behavior |
| --- | --- | --- | --- | --- |
| Home | Home / Ranked Listings | Discovery, ranking, featured auctions, recommended listings | Optional promo badge | Fully browsable |
| Search | Search / Filters | Keyword search, species/trait filters, auction/fixed-price discovery | No | Fully browsable |
| Notifications | Notification Center | Alerts for bids, offers, orders, refunds, fulfillment, and system messages | Unread count | Prompts login |
| Orders | My Orders | Buyer order history, active order tracking, refunds | Active issue count | Prompts login |
| Account | Account / Profile | Login, register, profile, seller mode, settings, logout | Optional account attention badge | Shows login/register |

## 3) Buyer Screen Flow

### Home / Ranked Listings

- **Entry:** Splash routing, Home tab, notification deep link fallback, or post-checkout return.
- **Content:** Ranked listing feed, featured bettas, ending-soon auctions, new arrivals, trusted sellers, review highlights, and category chips.
- **Primary actions:** Open listing detail, save/share listing, open seller profile summary, jump to filtered search.
- **States:** Loading feed skeleton, empty marketplace state, network error with retry, personalized recommendations unavailable state.
- **Next screens:** Listing Detail, Search / Filters, Login/Register prompt for protected actions.

### Search / Filters

- **Entry:** Search tab, Home category chip, listing tag, notification deep link fallback.
- **Content:** Search input, recent searches, filter panel, sort options, listing results, auction/fixed-price toggles.
- **Filters:** Betta type, color, sex, price range, auction status, seller rating, shipping region, availability, ending soon, fixed price, accepts offers.
- **Primary actions:** Apply filters, clear filters, save search, open listing detail.
- **States:** No results with filter-reset CTA, offline cached recent results, invalid query helper text.

### Listing Detail

- **Entry:** Home, Search, Notification Center, Orders, seller share link.
- **Content:** Listing title, price/current bid, auction countdown, offer eligibility, seller summary, ranking/review indicators, health notes, shipping policy, refund policy, and related listings.
- **Primary actions:** View gallery, place bid, make offer, add to cart or buy now, contact/report seller where allowed, share listing.
- **Rules:** Clearly distinguish auction, fixed price, and offer states; never show unavailable actions as primary CTAs.
- **Next screens:** Gallery, Auction Bid, Make Offer, Cart, Checkout, Login/Register prompt.

### Gallery

- **Entry:** Listing Detail media tap.
- **Content:** Full-screen image/video carousel, zoom, media count, health/provenance captions when available.
- **Primary actions:** Swipe media, pinch zoom, close, share listing.
- **States:** Low-bandwidth image fallback, broken media placeholder, accessible alt text labels.

### Auction Bid

- **Entry:** Listing Detail **Place Bid** CTA, outbid notification deep link.
- **Content:** Current bid, minimum next bid, bid increment guidance, auction end time, shipping estimate, bid terms.
- **Primary actions:** Submit bid, confirm bid, edit bid amount.
- **Rules:** Require authenticated buyer; validate minimum bid and auction status before confirmation; show outbid and winning states distinctly.
- **Next screens:** Payment setup if needed, Listing Detail bid confirmation state, Notification Center for later bid updates.

### Make Offer

- **Entry:** Listing Detail **Make Offer** CTA, offer notification deep link.
- **Content:** Seller asking price, offer amount input, optional buyer note, expiration window, offer terms.
- **Primary actions:** Submit offer, revise offer, cancel pending offer if allowed.
- **Rules:** Require authenticated buyer; prevent duplicate pending offers unless revision is supported; show seller response timeline.
- **Next screens:** Listing Detail offer status, Checkout if seller accepts and buyer proceeds.

### Cart

- **Entry:** Listing Detail **Add to Cart**, Account/order continuation, Checkout back navigation.
- **Content:** Cart items, seller grouping, shipping estimates, item availability, fixed-price totals, offer-accepted items, warnings for auction-ineligible items.
- **Primary actions:** Update quantity if supported, remove item, proceed to checkout, return to listing.
- **Rules:** Revalidate price, availability, seller shipping constraints, and offer acceptance before checkout.
- **Next screens:** Checkout, Listing Detail, Login/Register prompt.

### Checkout

- **Entry:** Cart, Listing Detail **Buy Now**, accepted offer flow.
- **Content:** Buyer shipping details, order summary, taxes/fees if applicable, shipping method, refund policy acknowledgement, Stripe payment entry/redirect.
- **Primary actions:** Confirm shipping, continue to Stripe checkout, place order, edit cart.
- **Rules:** Require authenticated buyer; use Stripe for payment; do not store raw card details in the app.
- **Next screens:** Stripe checkout, Payment Result, Cart on recoverable validation failure.

### Payment Result

- **Entry:** Stripe return URL, checkout polling completion, app deep link after external payment.
- **Content:** Payment success, pending, failed, canceled, or requires-action status; order reference; next action.
- **Primary actions:** View order, retry payment, return to cart, contact support.
- **Rules:** Treat payment status as server-authoritative; show pending state while order confirmation is being finalized.
- **Next screens:** Order Detail, Cart, My Orders, Home.

### My Orders

- **Entry:** Orders tab, Payment Result, Account, notification deep link fallback.
- **Content:** Active orders, past orders, status filters, refund indicators, shipment/tracking summaries.
- **Primary actions:** Open order detail, filter by status, request support.
- **States:** Empty order history, loading skeleton, offline cached order list, error retry.

### Order Detail

- **Entry:** My Orders, Payment Result, notification deep link.
- **Content:** Order number, listing snapshot, seller, payment status, fulfillment status, tracking, delivery estimate, refund eligibility, timeline, support actions.
- **Primary actions:** Track shipment, request refund, message/support where supported, reorder/similar listing discovery.
- **Rules:** Keep immutable order snapshot even if listing changes later.
- **Next screens:** Request Refund, Refund Status, Listing Detail for snapshot/similar item.

### Request Refund

- **Entry:** Order Detail **Request Refund** CTA.
- **Content:** Refund eligibility rules, reason picker, free-text details, evidence upload placeholder, refund amount preview when available.
- **Primary actions:** Submit refund request, cancel, review policy.
- **Rules:** Require order eligibility validation; communicate seller/platform review timeline.
- **Next screens:** Refund Status, Order Detail.

### Refund Status

- **Entry:** Request Refund submission, Order Detail refund section, refund notification.
- **Content:** Refund request status, timeline, seller/platform decision, approved amount, Stripe refund progress, next steps.
- **Primary actions:** View order, add information if requested, contact support.
- **States:** Pending review, approved, denied, canceled, refunded, action required.

## 4) Seller Screen Flow

### Seller Dashboard

- **Entry:** Account tab **Seller Mode**, seller notification deep link, post-login role routing.
- **Content:** Sales summary, active listings, active auctions, pending offers, paid orders awaiting fulfillment, refund issues, balance snapshot, payout alerts.
- **Primary actions:** View seller orders, view listings, manage refunds, view balance/payouts.
- **States:** Seller not approved, onboarding pending, no seller activity, network error retry.

### Seller Listings

- **Entry:** Seller Dashboard, Account seller mode menu.
- **Content:** Active listings, draft listings if supported later, sold listings, auction status, fixed-price inventory, ranking performance.
- **Primary actions:** View listing, pause/end listing if supported by backend, review performance.
- **Rules:** Documentation maps listing management screens without introducing new listing-create/edit app source code.

### Seller Orders

- **Entry:** Seller Dashboard, seller order paid notification.
- **Content:** Paid orders, fulfillment status filters, buyer/shipping summary, order age, refund flags.
- **Primary actions:** Open Seller Order Detail, filter by fulfillment state.
- **States:** Empty paid orders, fulfillment backlog warning, error retry.

### Seller Order Detail

- **Entry:** Seller Orders, order paid alert, fulfillment alert.
- **Content:** Order item snapshot, buyer shipping information, payment confirmation, fulfillment requirements, refund status, timeline.
- **Primary actions:** Mark fulfillment action, view buyer order snapshot, respond to refund if applicable.
- **Rules:** Show only seller-safe buyer information needed for fulfillment and support.

### Fulfillment Action

- **Entry:** Seller Order Detail **Fulfill** CTA, fulfillment alert.
- **Content:** Shipment carrier, tracking number, shipped date, package notes, shipping confirmation checklist.
- **Primary actions:** Submit tracking, mark fulfilled, edit pending fulfillment where allowed.
- **Rules:** Validate required tracking fields before submission; show buyer-facing consequences before final confirmation.
- **Next screens:** Seller Order Detail, Notification Center success state.

### Seller Refund Queue

- **Entry:** Seller Dashboard, refund alert, Account seller mode menu.
- **Content:** Refund requests requiring seller review, statuses, age, order reference, requested amount/reason.
- **Primary actions:** Open refund detail, filter by status.
- **States:** Empty queue, urgent refund attention state, error retry.

### Seller Refund Detail

- **Entry:** Seller Refund Queue, refund alert, Seller Order Detail.
- **Content:** Refund reason, buyer evidence placeholder, order snapshot, fulfillment timeline, seller response options, platform policy notes.
- **Primary actions:** Approve refund, dispute/respond, add seller note, view order.
- **Rules:** Make decision consequences and Stripe refund implications explicit.

### Seller Balance

- **Entry:** Seller Dashboard, Account seller mode menu.
- **Content:** Available balance, pending balance, holds, recent balance events, refunds affecting balance, next payout estimate.
- **Primary actions:** View payout history, open balance event details if supported.
- **States:** No balance yet, payout hold notice, error retry.

### Payout History

- **Entry:** Seller Balance.
- **Content:** Payout list, payout status, payout date, amount, destination summary, related orders/refunds.
- **Primary actions:** Filter payouts, open payout detail if supported, contact support.
- **States:** Empty payout history, pending payout explanation, failed payout action guidance.

## 5) Notification Flow

### Notification Center

- **Entry:** Notifications tab, push notification tap, in-app badge tap.
- **Content:** Chronological alerts, unread state, notification categories, related listing/order/offer/refund context.
- **Primary actions:** Open target screen, mark read, clear where supported, manage notification settings.
- **Guest behavior:** Prompt login/register because notifications are account-specific.

### Outbid Alert

- **Trigger:** Another buyer places a higher bid on an auction the user is bidding on.
- **Destination:** Auction Bid or Listing Detail with bid panel focused.
- **Message intent:** Make the current bid status and next valid bid obvious.

### Offer Alert

- **Trigger:** Offer submitted, accepted, rejected, expired, countered if supported, or action required.
- **Destination:** Make Offer status, Listing Detail, or Checkout for accepted offers.
- **Message intent:** Clarify deadline and next action.

### Order Paid Alert

- **Trigger:** Buyer payment succeeds or seller receives a paid order.
- **Destination:** Buyer Order Detail or Seller Order Detail depending on role.
- **Message intent:** Confirm payment and expose fulfillment/shipping next steps.

### Refund Alert

- **Trigger:** Refund requested, seller response required, approved, denied, Stripe refund processed, or additional information requested.
- **Destination:** Refund Status for buyers or Seller Refund Detail for sellers.
- **Message intent:** Communicate status, amount, decision reason, and required action.

### Fulfillment Alert

- **Trigger:** Seller submits tracking, order ships, delivery update arrives, or fulfillment action is overdue.
- **Destination:** Order Detail for buyers or Seller Order Detail/Fulfillment Action for sellers.
- **Message intent:** Make shipment status and tracking next steps clear.

## 6) Account Flow

### Login

- **Entry:** Account tab, protected action prompt, expired session prompt.
- **Content:** Email/password or supported auth method, password reset entry, register link, privacy/security messaging.
- **Primary actions:** Log in, reset password, switch to register.
- **Success route:** Return to the initiating protected action when possible; otherwise Account or Home.

### Register

- **Entry:** Account tab, protected action prompt, Login screen.
- **Content:** Account creation form, terms/privacy acknowledgement, optional marketing preference.
- **Primary actions:** Create account, verify account if required, switch to login.
- **Success route:** Return to protected action or Account profile completion.

### Profile

- **Entry:** Account tab for logged-in users.
- **Content:** Buyer identity summary, contact details, shipping addresses, review summary, seller status entry if applicable.
- **Primary actions:** Edit profile, manage addresses, enter seller mode, open settings.

### Seller Mode

- **Entry:** Account tab, Profile, Seller Dashboard deep link.
- **Content:** Seller status, approval state, seller dashboard entry, seller policy reminders.
- **Primary actions:** Open Seller Dashboard, review seller requirements, continue onboarding if already supported.
- **Rules:** Do not create new seller onboarding/API behavior in this documentation.

### Settings

- **Entry:** Account tab, Profile.
- **Content:** Notification preferences, privacy/security, payment/shipping preferences if supported, accessibility preferences, app version, support links.
- **Primary actions:** Update preferences, open legal/support content, logout.

### Logout

- **Entry:** Settings or Account menu.
- **Content:** Confirmation dialog, explanation that local cached account data will be cleared.
- **Primary actions:** Confirm logout, cancel.
- **Success route:** Guest Account state or Home in guest mode.

## 7) Screen Priority

### MVP

- Splash
- App Bootstrap
- Auth Check
- Guest Mode / Logged-in Mode routing
- Bottom tab shell: Home, Search, Notifications, Orders, Account
- Home / Ranked Listings
- Search / Filters
- Listing Detail
- Gallery
- Auction Bid
- Make Offer
- Cart
- Checkout
- Payment Result
- My Orders
- Order Detail
- Login
- Register
- Profile
- Logout

### Production Beta

- Request Refund
- Refund Status
- Notification Center with category routing
- Outbid, offer, order paid, refund, and fulfillment alerts
- Seller Dashboard
- Seller Listings
- Seller Orders
- Seller Order Detail
- Fulfillment Action
- Settings
- Seller Mode entry and role-aware routing

### Phase 2

- Seller Refund Queue
- Seller Refund Detail
- Seller Balance
- Payout History
- Saved searches
- Advanced listing ranking explanations
- Enhanced offline cached order/listing states
- Evidence upload UX for refunds if backend support exists

### Later

- Native listing creation/editing screens
- In-app buyer/seller messaging
- Payout detail drill-down
- Push preference personalization by species/listing category
- Advanced seller analytics
- Loyalty, promotions, or collector club experiences

## 8) API Mapping

Endpoint names below are conceptual and describe expected app-to-platform capabilities. They are not implementation instructions and do not change the existing API contract.

| Major screen | Conceptual endpoint name | Expected purpose |
| --- | --- | --- |
| Splash / App Bootstrap | `GET /mobile/bootstrap` | Load app config, feature flags, required version, badges, and minimal session context. |
| Auth Check | `GET /auth/session` / `POST /auth/refresh` | Validate current session and refresh authentication state when possible. |
| Home / Ranked Listings | `GET /listings/ranked` | Retrieve ranked marketplace listings, featured auctions, and recommendation modules. |
| Search / Filters | `GET /listings/search` / `GET /listings/filters` | Run listing search and load available filter metadata. |
| Listing Detail | `GET /listings/{listingId}` | Retrieve listing details, seller summary, auction/fixed-price/offer state, and policy information. |
| Gallery | `GET /listings/{listingId}/media` | Retrieve media list and captions for the listing. |
| Auction Bid | `GET /auctions/{listingId}/bid-state` / `POST /auctions/{listingId}/bids` | Load bid state and submit a buyer bid. |
| Make Offer | `GET /listings/{listingId}/offer-state` / `POST /offers` | Load offer eligibility and submit or revise an offer. |
| Cart | `GET /cart` / `POST /cart/items` / `PATCH /cart/items/{itemId}` / `DELETE /cart/items/{itemId}` | Manage fixed-price and accepted-offer cart items. |
| Checkout | `POST /checkout/session` | Create or resume a Stripe checkout session for eligible cart/order items. |
| Payment Result | `GET /checkout/session/{sessionId}/result` | Confirm server-authoritative checkout/payment/order status after Stripe return. |
| My Orders | `GET /buyer/orders` | Retrieve buyer order list with status and refund summaries. |
| Order Detail | `GET /buyer/orders/{orderId}` | Retrieve buyer order snapshot, payment, fulfillment, tracking, and refund state. |
| Request Refund | `POST /buyer/orders/{orderId}/refund-requests` | Submit a refund request for an eligible order. |
| Refund Status | `GET /refunds/{refundId}` | Retrieve refund timeline, decision state, and Stripe refund progress. |
| Notification Center | `GET /notifications` / `PATCH /notifications/{notificationId}` | Retrieve notifications and mark them read/cleared. |
| Account Login | `POST /auth/login` | Authenticate an existing user. |
| Account Register | `POST /auth/register` | Create a buyer account. |
| Profile | `GET /account/profile` / `PATCH /account/profile` | Retrieve and update profile details. |
| Seller Mode | `GET /seller/status` | Retrieve seller approval and role state. |
| Settings | `GET /account/settings` / `PATCH /account/settings` | Retrieve and update preferences, including notifications. |
| Logout | `POST /auth/logout` | End the current authenticated session. |
| Seller Dashboard | `GET /seller/dashboard` | Retrieve seller KPIs, order counts, refund counts, balance summary, and alerts. |
| Seller Listings | `GET /seller/listings` | Retrieve seller listing inventory and listing status summaries. |
| Seller Orders | `GET /seller/orders` | Retrieve seller order queue and fulfillment statuses. |
| Seller Order Detail | `GET /seller/orders/{orderId}` | Retrieve seller-safe order detail, fulfillment requirements, and refund context. |
| Fulfillment Action | `POST /seller/orders/{orderId}/fulfillment` | Submit tracking and fulfillment confirmation. |
| Seller Refund Queue | `GET /seller/refunds` | Retrieve refund requests requiring seller visibility or action. |
| Seller Refund Detail | `GET /seller/refunds/{refundId}` / `POST /seller/refunds/{refundId}/response` | Retrieve refund detail and submit seller response where supported. |
| Seller Balance | `GET /seller/balance` | Retrieve available balance, pending balance, holds, and recent balance events. |
| Payout History | `GET /seller/payouts` | Retrieve seller payout history and payout statuses. |

## 9) UX Notes

### Loading States

- Use skeleton cards for Home, Search, Orders, Seller Orders, and Notification Center.
- Use compact inline spinners for bid submission, offer submission, cart validation, checkout session creation, and fulfillment submission.
- Preserve layout stability during loading to avoid jumpy price, bid, or checkout total changes.

### Empty States

- Each empty state should explain why the screen is empty and what the user can do next.
- Marketplace empty states should suggest clearing filters or browsing ranked listings.
- Order empty states should guide buyers back to Home/Search.
- Seller empty states should distinguish between no sales yet, no active listings, no refund requests, and no payout history.

### Error States

- Use plain-language errors that describe the failed action and the safest next step.
- For high-stakes commerce actions, show whether the bid, offer, payment, refund, or fulfillment was submitted or not.
- Avoid ambiguous payment errors; always provide retry, return to cart, or support options.

### Retry Patterns

- Provide screen-level retry for feed, search, order, notification, seller dashboard, and balance failures.
- Provide action-level retry for bid, offer, checkout, refund, fulfillment, and settings updates.
- Disable duplicate submissions while an action is pending and restore the CTA after failure.

### Offline-Friendly Messages

- Detect offline state and show cached read-only data where safe.
- Make clear when prices, bids, cart totals, order states, and refund statuses may be stale.
- Block bid, offer, checkout, refund submission, and fulfillment submission while offline, with a clear reconnect message.

### Accessibility

- Support Dynamic Type / font scaling without clipping critical prices, bids, statuses, or CTAs.
- Use accessible labels for listing cards, gallery media, countdown timers, status badges, and bottom tabs.
- Do not rely on color alone for bid, offer, order, refund, or fulfillment states.
- Ensure tap targets meet platform minimums and that bottom fixed actions account for safe areas.
- Provide screen-reader-friendly payment, refund, and fulfillment confirmation messages.
