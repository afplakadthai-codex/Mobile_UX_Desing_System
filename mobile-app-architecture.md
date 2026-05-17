# Bettavaro Mobile App Architecture

Bettavaro is a premium multi-seller betta fish marketplace for iOS and Android. This document defines the proposed production architecture for the future mobile app while preserving the current planning boundary: documentation only, no backend code, no API changes, and no app source code yet.

Related planning inputs:

- `README.md` — mobile design system and UX foundations.
- `mobile-screen-map.md` — planned mobile screens and flows.
- `mobile-api-contract.md` — conceptual mobile API contract and client expectations.

## 1) Recommended Stack

### Primary Recommendation: React Native + Expo

Bettavaro should use **React Native + Expo** as the primary mobile stack.

### Why React Native + Expo Fits Bettavaro

- **Marketplace velocity:** Bettavaro needs many commerce screens: guest browsing, listing detail, auctions, offers, cart, checkout, buyer orders, seller orders, fulfillment, refunds, notifications, and seller balance/payouts later. React Native + Expo supports fast iteration across iOS and Android from one codebase.
- **Strong commerce app ecosystem:** React Native has mature libraries for navigation, server-state caching, forms, secure storage, notifications, deep links, analytics, crash reporting, and Stripe-adjacent browser checkout flows.
- **Design-system alignment:** Bettavaro already has a mobile design system with tokens, spacing, status language, and interaction rules. React Native maps cleanly to token-driven components and shared UI primitives.
- **Expo operational benefits:** Expo Application Services can simplify internal builds, closed beta builds, push notification setup, app signing, environment profiles, OTA updates for safe JavaScript-only fixes, and store releases.
- **Seller + buyer mode complexity:** React Native's navigation ecosystem can handle a buyer marketplace shell with seller-mode stacks and modal flows without forcing separate apps.
- **Hiring and maintenance:** React and TypeScript skills are widely available, and the same mental model can support future web/admin-adjacent surfaces if needed.

### Tradeoffs

- Native modules may require Expo config plugins or a custom dev client.
- Performance-sensitive image grids and auction countdowns must be implemented carefully to avoid unnecessary re-renders.
- App Store and Play Store payment rules must be reviewed for marketplace checkout behavior. **Decision required:** confirm whether all purchases are physical goods and whether external Stripe Checkout is permitted for every supported marketplace transaction.

## 2) App Layers

### UI Layer

Responsible for visual presentation and user interaction.

- Token-driven components based on the Bettavaro design system.
- Reusable primitives: buttons, cards, sheets, badges, status pills, inputs, skeletons, empty states, auction timers, price rows, order timelines, and seller action panels.
- Screen-specific composition only; business rules should live outside presentational components where possible.
- Accessibility support for dynamic type, screen readers, contrast, focus order, safe areas, and platform motion preferences.

### Navigation Layer

Responsible for route definitions, protected route gates, tab/stack/modal structure, and deep-link resolution.

- Guest marketplace stack.
- Authenticated buyer tabs/stacks.
- Seller mode stack reachable only for accounts with seller capabilities.
- Modal routes for offer entry, bid confirmation, cancel confirmations, refund actions, image preview, filter sheets, and auth prompts.
- Deep-link router for listings, orders, offers, auctions, notifications, checkout return, and seller tasks.

### State Layer

Responsible for app state ownership and boundaries.

- Server state through a dedicated query/cache library.
- Local UI state through component state or lightweight stores.
- Auth state through a dedicated session store backed by secure storage.
- Cart state from server-first APIs with local presentation helpers.
- Seller mode state separated from buyer navigation state.

### API Layer

Responsible for HTTP calls, request/response normalization, error mapping, retry policy, and request metadata.

- Single typed API client.
- Versioned base URL configuration.
- Standard bearer-token headers.
- Standard envelope parsing for `{ ok, data, meta }` and `{ ok, error, meta }`.
- Request IDs surfaced to logs and user support flows.

### Auth / Session Layer

Responsible for secure token persistence and session lifecycle.

- Secure token storage only.
- Login, logout, token expiry handling, session restore, and unauthorized handling.
- User profile and role/capability hydration after app start.
- Cache clearing for user-scoped data on logout/account switch.

### Cache / Storage Layer

Responsible for persistence boundaries.

- Secure storage for bearer tokens and sensitive auth metadata.
- Non-sensitive async storage for preferences, feature flags, seller-mode preference, last selected filters, and UI state.
- Query cache for low-risk server data with short stale windows.
- No persistent storage of raw payment results, bearer tokens outside secure storage, or sensitive seller/order data unless explicitly approved.

### Notification Layer

Responsible for device permissions, token registration, foreground behavior, background taps, badge counts, and notification routing.

- Permission prompts timed after user value is demonstrated.
- Device token registration after login and token refresh events. **Decision required:** confirm exact API endpoint and provider behavior.
- Notification categories for bids, auctions, offers, orders, fulfillment, refunds, account/security, seller tasks, and payout-related updates later.

### Deep Link Layer

Responsible for converting incoming URLs and notification payloads into safe app routes.

- Validate route type and IDs before navigation.
- Re-fetch server state after opening a link.
- Redirect unauthenticated users through login and continue to the target afterward when safe.
- Never include bearer tokens in deep links.

### Error / Logging Layer

Responsible for user-facing errors and developer observability.

- Standard user-safe copy for network failures, validation errors, stale commerce state, payment uncertainty, and permission issues.
- Developer telemetry for route, endpoint, status, error code, request ID, and app version.
- No sensitive payload logging.
- Crash reporting provider is a **decision required** item.

## 3) Folder Structure

Proposed future app source tree:

```text
bettavaro-mobile/
  app.config.ts
  package.json
  tsconfig.json
  src/
    app/
      AppRoot.tsx
      providers/
        AuthProvider.tsx
        QueryProvider.tsx
        NavigationProvider.tsx
        FeatureFlagProvider.tsx
      config/
        env.ts
        routes.ts
        featureFlags.ts
    assets/
      fonts/
      images/
      icons/
    design-system/
      tokens/
        colors.ts
        spacing.ts
        typography.ts
        radii.ts
        shadows.ts
      components/
        Button.tsx
        Card.tsx
        Badge.tsx
        StatusPill.tsx
        TextField.tsx
        EmptyState.tsx
        Skeleton.tsx
      patterns/
        PriceRow.tsx
        AuctionTimer.tsx
        ListingCard.tsx
        OrderTimeline.tsx
        SellerActionPanel.tsx
    navigation/
      RootNavigator.tsx
      GuestNavigator.tsx
      BuyerTabs.tsx
      BuyerOrdersNavigator.tsx
      SellerNavigator.tsx
      ModalNavigator.tsx
      linking.ts
      navigationGuards.ts
    features/
      auth/
        screens/
        api.ts
        authStore.ts
        session.ts
      marketplace/
        screens/
        components/
        api.ts
        queries.ts
      listings/
        screens/
        components/
        api.ts
        queries.ts
      auctions/
        screens/
        components/
        api.ts
        queries.ts
      offers/
        screens/
        components/
        api.ts
        queries.ts
      cart/
        screens/
        components/
        api.ts
        cartStore.ts
        queries.ts
      checkout/
        screens/
        api.ts
        checkoutFlow.ts
      orders/
        buyer/
          screens/
          components/
          api.ts
          queries.ts
        seller/
          screens/
          components/
          api.ts
          queries.ts
      fulfillment/
        screens/
        components/
        api.ts
      refunds/
        screens/
        components/
        api.ts
      notifications/
        screens/
        api.ts
        notificationService.ts
        notificationStore.ts
      seller/
        dashboard/
        balance/
        settings/
        sellerModeStore.ts
    services/
      api/
        client.ts
        errors.ts
        envelope.ts
        idempotency.ts
        retryPolicy.ts
      auth/
        secureTokenStorage.ts
        unauthorizedHandler.ts
      storage/
        asyncStorage.ts
        secureStorage.ts
      notifications/
        pushRegistration.ts
        notificationRouter.ts
      deeplinks/
        deepLinkParser.ts
        routeResolver.ts
      logging/
        logger.ts
        telemetry.ts
        crashReporting.ts
    state/
      queryKeys.ts
      globalStores.ts
    utils/
      money.ts
      dates.ts
      validation.ts
      platform.ts
      accessibility.ts
    types/
      api.ts
      auth.ts
      listing.ts
      order.ts
      seller.ts
      notification.ts
  test/
    fixtures/
    mocks/
    setup.ts
```

## 4) Navigation Architecture

### Root Navigation

Root routing should decide between:

1. App loading / session restore.
2. Guest marketplace experience.
3. Authenticated buyer experience.
4. Seller mode experience.
5. Modal overlays.
6. External checkout browser handoff and return handling.

### Guest Routes

Guest users may browse without authentication.

- Home / marketplace feed.
- Search and filters.
- Listing detail.
- Auction detail in read-only or limited-action mode.
- Seller public profile. **Decision required:** confirm public seller profile API support.
- Login.
- Sign up. **Decision required:** confirm whether account creation is in app, web-only, or later.
- Forgot password. **Decision required:** confirm password reset flow.

Guest users must be prompted to log in before:

- Bidding.
- Making an offer.
- Adding restricted items to cart if the API requires login.
- Starting checkout.
- Viewing orders.
- Viewing notifications.
- Entering seller mode.

### Authenticated Buyer Routes

Recommended buyer tabs:

- **Shop:** home, search, categories/filters, listing detail, seller profile.
- **Auctions:** active auctions, watched auctions, ending soon, bid history.
- **Cart:** cart, shipping review, checkout start.
- **Orders:** order list, order detail, shipment tracking, refund request/status.
- **Account:** profile, addresses, payment/help links, notification settings, seller mode entry.

### Seller Mode Routes

Seller mode should be a distinct navigation branch, not just hidden buyer screens.

- Seller dashboard.
- Seller listings.
- Create/edit listing placeholder route. **Decision required:** listing creation in mobile app or web-only at launch.
- Seller auctions.
- Seller offers.
- Seller orders.
- Fulfillment workflow.
- Refund requests.
- Seller notifications.
- Seller balance / payouts placeholder for later.
- Seller settings.

Server permissions must determine seller-mode access; client role checks are only UX gates.

### Modal Routes

Use modals or bottom sheets for focused, reversible actions:

- Login required prompt.
- Bid confirmation.
- Offer creation/counter/accept/decline confirmation.
- Add-to-cart confirmation.
- Quantity or shipping option selection if applicable.
- Checkout status return screen.
- Filter and sort sheet.
- Image gallery.
- Cancel order confirmation where supported.
- Refund request form.
- Seller fulfill order form.
- Tracking upload/edit. **Decision required:** confirm fulfillment fields.
- Error details/support request sheet.

### Checkout External Browser Flow

- App requests a checkout session from the server.
- Server returns `checkout_url` and tracking metadata.
- App opens the URL in a secure system browser experience, such as `ASWebAuthenticationSession`, `SFSafariViewController`, Chrome Custom Tabs, or Expo WebBrowser.
- Stripe redirects to a configured app return URL or web fallback.
- App handles the return link and immediately re-fetches order/payment status from Bettavaro's server.
- App never treats the browser redirect alone as proof of payment.

### Notification Deep-Link Routing

Notification payloads should contain a type and resource identifier, not sensitive data.

Examples:

- `listing:{id}` → listing detail.
- `auction:{id}` → auction detail.
- `offer:{id}` → offer detail or relevant listing offer panel.
- `buyer_order:{id}` → buyer order detail.
- `seller_order:{id}` → seller order detail in seller mode.
- `refund:{id}` → refund detail/status.
- `notification:{id}` → notification detail or inbox item.

The app must validate authentication, role, route availability, and server state before showing sensitive screens.

## 5) Authentication Architecture

### Bearer Token Storage

- Store bearer tokens only in secure platform storage.
- iOS: Keychain.
- Android: EncryptedSharedPreferences or Android Keystore-backed storage.
- Never store bearer tokens in AsyncStorage, logs, analytics events, deep links, screenshots, or crash report breadcrumbs.

### Secure Storage

Secure storage should contain only:

- Bearer token.
- Token expiry metadata when supplied.
- Minimal session metadata needed for restore.

Do not store raw passwords, raw card data, or full sensitive account/order payloads.

### Login

Login flow:

1. User submits credentials.
2. App calls the verified login endpoint.
3. App parses the standard response envelope.
4. App stores token in secure storage.
5. App stores non-sensitive user/session metadata in auth state.
6. App registers or refreshes push device token if permission and endpoint are available.
7. App invalidates guest-scoped caches that are affected by authenticated pricing, cart, orders, or user capabilities.

### Logout

Logout flow:

1. If a logout/revoke endpoint exists, call it best-effort. **Decision required:** verify logout endpoint and revocation behavior.
2. Delete secure token storage.
3. Clear user-scoped query caches.
4. Reset auth state, cart state, notification badge state, and seller mode state.
5. Return to guest navigation.

### Token Expiry

- If the API returns `expires_at`, schedule a soft expiry check and avoid starting high-risk actions with a known expired token.
- If no expiry metadata exists, rely on `401` handling.
- Refresh-token support is not assumed. **Decision required:** confirm whether refresh tokens exist or whether users must log in again.

### Unauthorized Handling

For `401` responses:

- Stop automatic retries unless the server explicitly supports refresh.
- Clear or quarantine invalid session state.
- Preserve the intended route when safe.
- Prompt login with user-safe copy.
- Clear sensitive user-scoped caches.

For `403` responses:

- Do not log out by default.
- Show permission/ownership copy.
- Re-fetch roles/capabilities if the action depends on seller access.

### Session Restore

On app launch:

1. Read token from secure storage.
2. If no token exists, enter guest mode.
3. If token exists, initialize API client with bearer header.
4. Fetch session/user profile endpoint. **Decision required:** verify endpoint path and response.
5. Restore buyer shell and seller capabilities from server data.
6. Register push device token if available.
7. Rehydrate only allowed non-sensitive local preferences.

## 6) API Client Architecture

### Base URL Config

- Base URL must be environment-specific.
- Use a versioned mobile API path when available, such as `/api/mobile/v1`. Final path is **to verify**.
- Never hardcode production-only URLs inside feature code.
- Keep environment config outside components.

### Request Headers

Default headers:

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <token> # only when authenticated
X-App-Platform: ios|android
X-App-Version: <version>
X-App-Build: <build>
X-Request-Id: <uuid>
```

Additional headers are **decision required**:

- `Idempotency-Key` for high-risk writes.
- Locale/currency headers.
- Device ID or installation ID for push/debug correlation.

### Response Envelope Parsing

The API client should normalize:

```json
{ "ok": true, "data": {}, "meta": {} }
```

and:

```json
{ "ok": false, "error": { "code": "...", "message": "..." }, "meta": {} }
```

Rules:

- Return typed `data` for success.
- Convert API errors into typed client errors.
- Preserve `meta.request_id` when present.
- Treat malformed envelopes as developer-visible API contract errors.

### Error Mapping

Map errors into stable client categories:

- `network_unavailable`.
- `timeout`.
- `unauthorized`.
- `forbidden`.
- `not_found`.
- `validation_error`.
- `state_conflict`.
- `rate_limited`.
- `server_error`.
- `payment_unknown`.
- `unknown`.

Common user copy should be client-owned and localized later.

### Retry Rules

Safe retry candidates:

- Idempotent `GET` requests.
- Network timeouts before a response is received.
- `429` or `5xx` only when retry hints/backoff allow it.

Do not automatically retry:

- Bids.
- Offer creation/acceptance/counter/decline.
- Cart mutation unless idempotency is confirmed.
- Checkout session creation unless idempotency is confirmed.
- Fulfillment updates.
- Refund actions.
- Seller payout/balance actions when introduced.

### High-Risk Action Rules

Before high-risk actions, refresh authoritative server state:

- Bid placement: re-fetch listing/auction state.
- Buy-now/add-to-cart/checkout: re-fetch listing and cart totals.
- Offer action: re-fetch listing and offer state.
- Seller fulfillment: re-fetch seller order state.
- Refund decision/request: re-fetch order/refund state.
- Payout-related actions later: re-fetch balance and account state.

High-risk UI should use confirmation screens, disabled duplicate-submit buttons, and clear loading state.

### Idempotency Strategy as to Verify

Idempotency support is **to verify** with the backend.

Recommended client strategy if supported:

- Generate a UUID idempotency key per user intent, not per retry attempt.
- Attach `Idempotency-Key` to high-risk writes.
- Persist pending idempotency keys only long enough to recover from app interruption.
- Reuse the same key when retrying the same action after a network failure.
- Never reuse a key for a different bid, offer, checkout session, fulfillment update, refund action, or payout action.

If unsupported, the app must avoid automatic retries and must re-fetch state after uncertain write outcomes.

## 7) State Management

### Server State

Use a server-state query library for:

- Listings and listing detail.
- Auctions and bid history.
- Offers.
- Cart.
- Checkout session initiation status.
- Buyer orders.
- Seller orders.
- Fulfillment tasks.
- Refunds.
- Notifications.
- Seller balance/payout data later.

Server state should have typed query keys and explicit invalidation after writes.

### Local UI State

Use component state or a lightweight store for:

- Sheet visibility.
- Form drafts.
- Filter selections before apply.
- Sort menus.
- Toast/snackbar queue.
- Temporary selected images.
- Checkout return processing state.

### Auth State

Auth state should include:

- Session status: loading, guest, authenticated, expired.
- Current user summary.
- Role/capability summary.
- Token availability, but never the token value in developer logs.

### Cart State

Cart should be server-authoritative.

- Local cart state may store presentation state and optimistic hints only when safe.
- Cart totals must be re-fetched before checkout.
- Stale cart conflicts must route users to a cart review screen.

### Notification Badge State

Notification badges should be derived from server unread counts plus local foreground events.

- Re-fetch unread count on app foreground.
- Re-fetch after notification tap.
- Re-fetch after marking notifications read.
- Avoid long-term trust in locally incremented counts.

### Seller Mode State

Seller mode state should include:

- Whether seller mode is active.
- Last seller route.
- Seller capability summary from server.
- Seller dashboard filter preferences.

Seller mode must reset on logout and must be disabled if the server no longer reports seller permissions.

## 8) Cache Strategy

### What Can Cache

Short-lived client caching is acceptable for:

- Guest marketplace feed.
- Search results.
- Listing cards.
- Listing detail for display continuity.
- Public seller profile data. **Decision required:** verify public seller profile support.
- Search filters.
- Static app configuration and feature flags.
- Notification inbox previews with quick revalidation.

### What Must Not Cache as Authoritative

Do not rely on cached data for:

- Authentication responses.
- Bearer tokens outside secure storage.
- Cart totals.
- Checkout/payment status.
- Buyer order status.
- Seller order status.
- Fulfillment status.
- Refund status.
- Seller balance/payout values.
- Auction eligibility, current price, or bid outcome.
- Offer eligibility or offer outcome.

### Stale Display Rules

- Stale listings may be displayed with pull-to-refresh and background revalidation.
- Stale listing detail must show a freshness indicator if critical commerce fields may have changed.
- Stale order data may be shown for continuity but must refresh on screen focus.
- Stale notification counts should refresh on app foreground.
- Stale cart/checkout data should block checkout until refreshed.

### Refresh Before High-Risk Actions

Always refresh before:

- Bidding.
- Making/countering/accepting/declining offers.
- Adding to cart when price/availability could change.
- Creating checkout sessions.
- Submitting fulfillment/tracking details.
- Requesting or responding to refunds.
- Any future payout/balance action.

## 9) Offline Strategy

### Read-Only Cached Screens

When offline, allow read-only display of previously cached:

- Marketplace feed.
- Search result snapshots.
- Listing detail snapshots.
- Buyer order list/detail snapshots.
- Seller order list/detail snapshots.
- Notification inbox snapshots.

Each screen must visibly indicate that data may be stale.

### Disabled Write Actions

Disable or block:

- Login.
- Bids.
- Offers.
- Add to cart.
- Cart quantity/removal updates.
- Checkout creation.
- Fulfillment updates.
- Refund requests/actions.
- Notification read mutations.
- Seller listing changes.
- Future payout actions.

### Offline Banners

Use a persistent but non-blocking offline banner:

- “You’re offline. Showing saved information.”
- On high-risk actions: “Reconnect to refresh availability and continue.”

### Retry After Reconnect

- Automatically re-fetch focused screen data after reconnect.
- Retry safe reads with backoff.
- Do not auto-submit high-risk writes after reconnect unless the backend confirms idempotency and the user intent is still valid.
- For uncertain writes, show a “Check status” action that re-fetches server state.

## 10) Stripe Checkout Architecture

### Server Creates Checkout Session

- App sends cart/order intent to Bettavaro server.
- Server validates inventory, seller ownership boundaries, shipping, taxes/fees, discounts, and final price.
- Server creates Stripe Checkout session.
- Server returns `checkout_url` and any required local tracking identifiers.

### App Opens `checkout_url`

- App opens the checkout URL in a secure external browser or system web auth session.
- App does not collect or transmit raw card data.
- App does not embed card entry unless a future Stripe-native flow is explicitly designed and approved.

### App Receives Return / Deep Link

- Stripe return URL routes back to the app or a web fallback.
- The app parses only non-sensitive return parameters.
- Return handling should show a processing state, not immediate success.

### App Re-fetches Server Order / Payment Result

After return:

1. Re-fetch checkout/session result from Bettavaro server.
2. Re-fetch buyer order if one was created.
3. Invalidate cart and order queries.
4. Show paid, pending, failed, canceled, or unknown state based only on server data.

### Never Trust Client-Side Payment Result Alone

The app must never treat these as authoritative:

- Stripe browser redirect status.
- Local URL parameters.
- App resume event.
- Cached checkout state.
- Client-side timers.

Only Bettavaro server status should determine order/payment outcome.

## 11) Push Notification Architecture

### Device Permission

- Ask for notification permission after meaningful engagement, such as watching an auction, placing a bid, creating an offer, or viewing order tracking.
- Provide pre-permission education where useful.
- Respect denial and allow users to change settings later.

### Device Token Registration as to Verify

Device token registration endpoint and payload are **to verify**.

Recommended behavior:

- Register token after login.
- Update token when the OS/provider rotates it.
- Associate token with user, platform, app version, build, locale, and environment.
- Unregister or disassociate token on logout when supported.
- Keep dev/staging/prod tokens isolated.

### Notification Categories

Recommended categories:

- Auction ending soon.
- Outbid.
- Bid won/lost.
- Offer received.
- Offer accepted/declined/countered/expired.
- Cart or checkout issue. **Decision required:** confirm whether marketing/cart reminders are allowed.
- Buyer order placed/paid/shipped/delivered/refund updated.
- Seller order received/needs fulfillment/late fulfillment.
- Refund request opened/updated.
- Account/security.
- Seller balance/payout later.

### Deep Link Targets

Notification deep links should target:

- Listing detail.
- Auction detail.
- Offer detail.
- Buyer order detail.
- Seller order detail.
- Refund detail.
- Notification inbox.
- Seller dashboard.

The app must re-fetch the target resource after navigation.

### Foreground / Background Behavior

Foreground:

- Show in-app banner/toast for actionable updates.
- Update unread badge count.
- Invalidate relevant queries.
- Avoid interrupting checkout unless payment/order state requires attention.

Background or killed state:

- Notification tap opens the app through the deep-link router.
- Auth guard runs before sensitive screens.
- Server re-fetch determines final display state.

## 12) Security Rules

- Never log bearer tokens.
- Never put bearer tokens in URLs.
- Store bearer tokens in secure storage only.
- Do not store raw passwords.
- Do not collect, transmit, or store raw card data.
- Use Stripe-hosted checkout or an approved Stripe-native flow only after review.
- Pricing, taxes, shipping, discounts, auction outcomes, offer outcomes, refunds, order state, and seller balances must be server-authoritative.
- Seller ownership and seller permissions must be enforced by the server.
- Client-side seller checks are UX hints only.
- Re-fetch before high-risk commerce actions.
- Do not log full request/response bodies for orders, checkout, refunds, auth, addresses, or seller balance data.
- Scrub PII from analytics and crash breadcrumbs.
- Avoid sensitive data in push notification text and payloads.
- Use HTTPS only.
- Payment and order screens should consider screenshot/privacy protections. **Decision required:** determine whether to enable Android `FLAG_SECURE`, iOS screen privacy overlays, or selective privacy masking.
- Do not include secrets in app binaries beyond public publishable keys and environment identifiers.

## 13) Error Handling & Observability

### User-Facing Error Copy

Use consistent, calm, commerce-aware copy:

- Network: “We couldn’t connect. Check your connection and try again.”
- Stale listing: “This listing changed. Review the latest details before continuing.”
- Auction conflict: “The auction state changed. Refreshing the latest bid details.”
- Offer conflict: “This offer is no longer available. Review the latest offer status.”
- Cart conflict: “Some cart details changed. Review your cart before checkout.”
- Checkout unknown: “We’re checking your payment status. Please don’t place another order yet.”
- Unauthorized: “Please sign in again to continue.”
- Forbidden: “This action isn’t available for your account.”
- Server error: “Something went wrong on our side. Try again in a moment.”

### Developer Telemetry

Capture:

- App version and build.
- Platform and OS version.
- Environment.
- Route name.
- Endpoint path pattern, not full sensitive URL.
- HTTP status.
- Error code.
- Request ID.
- Query/mutation key.
- Network state.
- Seller mode active/inactive, without sensitive seller data.

### `request_id` Usage

- Generate an `X-Request-Id` for every API request if the server does not provide one.
- Preserve server-provided `meta.request_id` where available.
- Show request ID in support/debug details for failed high-risk actions.
- Include request ID in developer logs and crash breadcrumbs without sensitive payloads.

### Crash Reporting as Decision Required

Crash reporting provider is **decision required**.

Options to evaluate:

- Sentry.
- Firebase Crashlytics.
- Expo Application Services diagnostics plus a dedicated crash provider.

Selection criteria:

- React Native support.
- Source map upload support.
- PII scrubbing controls.
- Environment separation.
- Release tracking.
- Breadcrumb redaction.

### API Logging Boundaries

Allowed:

- Endpoint path pattern.
- HTTP method.
- Status code.
- Error code.
- Request ID.
- Duration.
- Retry count.

Not allowed:

- Bearer token.
- Password.
- Raw card data.
- Full address payloads.
- Full order/refund bodies.
- Sensitive notification payloads.
- Seller payout/balance payload details.

## 14) Environment Config

### Development

- Local or development API base URL.
- Stripe test mode only.
- Verbose developer logging with sensitive-field redaction.
- Feature flags may expose unfinished flows to developers.
- Push notifications may use development credentials only.

### Staging

- Staging API base URL.
- Stripe test mode only unless explicitly approved for pre-production validation.
- Production-like logging and monitoring.
- Internal QA accounts and seller fixtures.
- Store build profile for TestFlight/internal app sharing.

### Production

- Production API base URL.
- Stripe live mode configured server-side.
- Minimal logging with strict redaction.
- Production push credentials.
- Store-approved app signing and release channels.

### API Base URL

- Controlled through Expo config and build profiles.
- Read once through typed environment config.
- Never assembled ad hoc in screens.
- Must be visible in debug settings for non-production builds.

### Stripe Mode Awareness

- The app should display environment indicators in development/staging only.
- The app should not decide Stripe mode directly; server checkout session configuration is authoritative.
- App config should prevent staging builds from accidentally pointing at production checkout unless explicitly approved.

### Feature Flags

Feature flags should support:

- Seller mode launch gating.
- Auctions availability.
- Offers availability.
- Refund workflow rollout.
- Push notification categories.
- Seller balance/payout placeholder visibility.
- In-app listing creation if launched later.

Feature flags should not replace server authorization.

## 15) Release Strategy

### Internal Test

Goal: validate core app stability with staff/test accounts.

Scope:

- Guest browsing.
- Login/logout/session restore.
- Listing detail.
- Cart review.
- Stripe test checkout.
- Buyer orders.
- Seller order visibility.
- Fulfillment happy path.
- Notification token registration in dev/staging.

### Closed Beta

Goal: validate marketplace workflows with invited buyers and sellers.

Scope:

- Realistic listing volume.
- Auctions and offers in controlled cohorts.
- Checkout with Stripe test or approved limited live testing.
- Refund workflow validation.
- Seller fulfillment operations.
- Push notification relevance and deep links.

### Production Beta

Goal: limited production rollout with real users and monitoring.

Scope:

- Gradual release by platform/store controls where available.
- Feature flags for auctions/offers/seller features if risk requires.
- Production Stripe mode.
- Support escalation paths with request IDs.
- Daily monitoring for checkout, order, and seller fulfillment errors.

### App Store Release

Requirements before broad release:

- App Store and Play Store metadata.
- Privacy labels/data safety disclosures.
- Stripe/payment compliance review for physical goods marketplace.
- Push notification permission copy review.
- Accessibility pass.
- Crash-free and checkout success thresholds.
- Support and refund policy links.

### Rollback Plan

- Use feature flags to disable high-risk features without a binary release.
- Use OTA updates only for safe JavaScript/config fixes that comply with store rules.
- Keep previous stable binary available for phased release rollback where store tooling supports it.
- Server may block risky app versions if a severe checkout/security issue is found. **Decision required:** define minimum supported app version policy.
- Maintain incident runbooks for payment uncertainty, checkout outage, notification misrouting, and seller fulfillment errors.

## 16) Open Decisions

Major decisions required before app coding starts:

1. Confirm React Native + Expo as the approved stack.
2. Confirm exact mobile API base path and environment URLs.
3. Confirm whether account registration and password reset are native app flows or web-only.
4. Confirm login, logout/revoke, session/profile, and token expiry/refresh behavior.
5. Confirm whether refresh tokens exist.
6. Confirm device token registration endpoint, provider, payload, and unregister behavior.
7. Confirm push notification provider and category payload schema.
8. Confirm deep-link URL scheme, universal link/app link domains, and web fallback behavior.
9. Confirm App Store / Play Store compliance for external Stripe Checkout for all supported physical-goods marketplace purchases.
10. Confirm Stripe Checkout return URL format and checkout status endpoint.
11. Confirm idempotency support for bids, offers, cart mutations, checkout creation, fulfillment, refunds, and future payout actions.
12. Confirm retry hints/rate-limit behavior from the API.
13. Confirm public seller profile support.
14. Confirm whether seller listing creation/editing is in mobile app at launch or later.
15. Confirm seller fulfillment fields, tracking carrier rules, and shipment validation.
16. Confirm refund workflow roles, states, evidence upload support, and API fields.
17. Confirm seller balance/payout timing, read-only visibility, and security requirements for later release.
18. Confirm crash reporting provider and PII redaction policy.
19. Confirm analytics/telemetry provider and event taxonomy.
20. Confirm screenshot/privacy policy for payment, order, address, refund, and seller balance screens.
21. Confirm minimum supported OS versions for iOS and Android.
22. Confirm accessibility acceptance criteria and testing approach.
23. Confirm feature flag provider and release-channel strategy.
24. Confirm minimum supported app version and forced-upgrade policy.
25. Confirm customer support surfaces, support links, and request ID display rules.
