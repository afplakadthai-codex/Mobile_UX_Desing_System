# Bettavaro Mobile API Contract

Production-oriented contract notes for the Bettavaro iOS and Android applications. The existing mobile API is expected to live under `/public_html/api/mobile/v1/` and be exposed publicly as `/api/mobile/v1/`.

This document is documentation-only. It does not define new backend behavior. Endpoint paths and field names marked **to verify** must be confirmed against the server files before mobile clients treat them as final.

## 1) API Base

### Base Path

- Public base path: `/api/mobile/v1/`
- Server source area: `/public_html/api/mobile/v1/`
- Response format: JSON for all mobile endpoints.
- Character encoding: UTF-8.
- Transport: HTTPS is required in production.

### Authentication

Authenticated requests use a bearer token:

```http
Authorization: Bearer <token>
```

Mobile clients must not send bearer tokens in query strings, logs, analytics payloads, crash reports, or shared deep links.

### Content-Type Rules

- `GET` requests normally do not include a request body.
- JSON write requests should send:

```http
Content-Type: application/json
Accept: application/json
```

- Multipart requests, if any are later supported for evidence uploads or media, are **to verify** and should explicitly document accepted fields, file limits, and MIME types.
- Responses should include:

```http
Content-Type: application/json; charset=utf-8
```

### Cache and No-Cache Expectations

Mobile clients may cache low-risk read data for display continuity, but the server remains authoritative for commerce actions.

- Listings and search results: short-lived client cache is acceptable for browsing, but clients must refresh before high-risk actions.
- Listing detail: re-fetch before bidding, adding to cart, buy-now checkout, or offer-related actions.
- Cart, checkout, orders, seller data, notifications, and authentication responses: treat as no-cache unless the server explicitly allows caching.
- Checkout and payment responses: never use cached values to determine payment or order state.
- If server cache headers differ from these expectations, follow the safer behavior until headers are verified.

## 2) Standard Response Envelope

All mobile endpoints should return a stable JSON envelope so native clients can parse responses consistently.

### Expected Success Envelope

```json
{
  "ok": true,
  "data": {},
  "meta": {}
}
```

- `ok`: `true` when the request completed successfully.
- `data`: endpoint-specific payload. May be an object, list wrapper, or empty object.
- `meta`: optional pagination, timing, version, request ID, or feature-flag information.

### Expected Error Envelope

```json
{
  "ok": false,
  "error": {
    "code": "...",
    "message": "..."
  },
  "meta": {}
}
```

- `ok`: `false` for any application-level error.
- `error.code`: stable machine-readable code for client branching.
- `error.message`: user-safe or developer-safe message, depending on endpoint. Mobile clients should prefer localized client copy for common errors.
- `meta`: optional diagnostics such as `request_id`, validation field details, or retry hints.

### HTTP Status Expectations

Status mapping is **to verify**, but mobile clients should be prepared for:

- `200` / `201`: success.
- `400`: invalid request or validation failure.
- `401`: missing, invalid, or expired token.
- `403`: authenticated user is not allowed to perform the action.
- `404`: listing, order, notification, or other resource not found.
- `409`: state conflict such as stale cart, ended auction, or duplicate action.
- `422`: semantic validation error such as bid too low.
- `429`: rate-limited request.
- `500`: unexpected server error.

## 3) Authentication

### Login Endpoint Concept

The login endpoint authenticates a buyer or seller account and returns a bearer token for subsequent mobile requests. Final path and request fields are **to verify**.

Expected concept:

```http
POST /api/mobile/v1/auth/login
```

Request fields **to verify**:

```json
{
  "email": "buyer@example.com",
  "password": "user-password"
}
```

Expected success data **to verify**:

```json
{
  "token": "bearer-token-value",
  "token_type": "Bearer",
  "expires_at": "2026-05-17T00:00:00Z",
  "user": {
    "id": 123,
    "name": "Customer Name",
    "email": "buyer@example.com",
    "roles": ["buyer"]
  }
}
```

### Bearer Token Storage

Mobile clients should store tokens only in platform-secure storage:

- iOS: Keychain.
- Android: EncryptedSharedPreferences or Android Keystore-backed storage.

Clients should clear tokens on logout, token revocation, account switch, app reset, or repeated authentication failure.

### Token Expiry

- Treat `expires_at` or equivalent expiry metadata as server-authoritative when present.
- If expiry metadata is absent, clients should handle `401` responses gracefully and route to re-authentication.
- Do not assume refresh-token support unless confirmed by server files.

### Authentication Errors

Expected auth error codes:

- `token_missing`: `Authorization` header is missing or malformed.
- `unauthorized`: token is invalid, user is not authenticated, credentials are wrong, or user cannot access the resource.
- `token_expired`: token is valid but expired.

### Logout / Revoke Token

Logout or token revocation endpoint is **to verify**.

Conceptual endpoint only:

```http
POST /api/mobile/v1/auth/logout
```

Until verified, mobile clients should perform local logout by deleting secure token storage and clearing user-scoped caches.

## 4) Listings

Listings power browsing, search, listing detail, cart entry, auctions, checkout entry, and notification deep links.

### Listings List Endpoint

Path is **to verify**.

Conceptual endpoint:

```http
GET /api/mobile/v1/listings
```

Common query parameters **to verify**:

- `q`: search text.
- `page`: page number or cursor page.
- `limit`: page size.
- `sort`: relevance, newest, price, ending soon, or ranking sort.
- `filters`: filter keys may be expanded by the search filters endpoint.

Expected response data **to verify**:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "has_more": true
  }
}
```

### Listing Detail Endpoint

Path is **to verify**.

Conceptual endpoint:

```http
GET /api/mobile/v1/listings/{id}
```

Slug-based lookup may exist and is **to verify**:

```http
GET /api/mobile/v1/listings/{slug}
```

### Search Filters Endpoint

Path is **to verify**.

Conceptual endpoint:

```http
GET /api/mobile/v1/search/filters
```

Expected filter categories **to verify**:

- Betta type / variety.
- Color.
- Sex.
- Price range.
- Auction status.
- Seller rating.
- Shipping region.
- Availability.
- Ending soon.
- Fixed price.
- Accepts offers.

### Expected Listing Fields

Field presence and naming are **to verify**. Mobile clients should tolerate missing optional fields.

```json
{
  "id": 123,
  "title": "Collector Betta Listing",
  "slug": "collector-betta-listing",
  "price": "125.00",
  "currency": "USD",
  "image_url": "https://example.com/image.jpg",
  "status": "active",
  "sale_status": "available",
  "seller": {
    "id": 44,
    "display_name": "Seller Name",
    "rating": 4.9,
    "review_count": 128
  },
  "auction": {
    "is_auction": true,
    "status": "live",
    "current_bid": "130.00",
    "minimum_next_bid": "135.00",
    "ends_at": "2026-05-17T00:00:00Z"
  },
  "reviews": {
    "average": 4.9,
    "count": 128
  },
  "ranking": {
    "score": 98,
    "label": "Top rated"
  }
}
```

## 5) Auction

Auction APIs must be treated as server-authoritative because price, minimum bid, auction status, and winner state can change rapidly.

### Auction Bid Endpoint

Path is **to verify**.

Conceptual endpoint:

```http
POST /api/mobile/v1/listings/{listing_id}/bid
```

Alternate endpoint naming is **to verify**:

```http
POST /api/mobile/v1/auctions/{auction_id}/bid
```

### Bid Request Fields

Fields are **to verify**.

```json
{
  "amount": "135.00",
  "currency": "USD"
}
```

Mobile rules:

- Require authenticated buyer token.
- Re-fetch listing detail immediately before presenting final bid confirmation.
- Disable duplicate submit while a bid request is in flight.
- On success, refresh listing detail and bid state from the server response or a follow-up fetch.

### Expected Auction Validation Errors

- `token_missing`: missing bearer token.
- `unauthorized`: token invalid or user cannot bid.
- `auction_not_live`: auction is not currently accepting bids.
- `bid_too_low`: amount is below the current minimum bid.
- `auction_ended`: auction end time has passed or server closed bidding.
- `listing_not_found`: referenced listing does not exist or is unavailable.

## 6) Cart

Cart APIs are for fixed-price and eligible accepted-offer purchases. Auction items should not be assumed cart-eligible unless verified.

### Cart View

Path is **to verify**.

```http
GET /api/mobile/v1/cart
```

### Cart Add

Path and request fields are **to verify**.

```http
POST /api/mobile/v1/cart/items
```

```json
{
  "listing_id": 123,
  "quantity": 1
}
```

### Cart Remove

Path is **to verify**.

```http
DELETE /api/mobile/v1/cart/items/{cart_item_id}
```

Alternate remove-by-listing behavior is **to verify**.

### Expected Cart Item Fields

Field names are **to verify**.

```json
{
  "id": 987,
  "listing_id": 123,
  "title": "Collector Betta Listing",
  "quantity": 1,
  "unit_price": "125.00",
  "currency": "USD",
  "image_url": "https://example.com/image.jpg",
  "seller": {
    "id": 44,
    "display_name": "Seller Name"
  },
  "availability": "available",
  "sale_status": "available",
  "line_total": "125.00"
}
```

Cart summary fields **to verify**:

- `subtotal`
- `shipping_total`
- `tax_total`
- `discount_total`
- `grand_total`
- `currency`
- `warnings`

## 7) Checkout

Checkout must always use server-calculated pricing and Stripe-generated payment sessions. Mobile clients must never calculate final payable totals independently.

### Checkout Start

Path is **to verify**.

```http
POST /api/mobile/v1/checkout/start
```

Expected purpose:

- Validate cart contents.
- Validate listing availability.
- Validate shipping eligibility.
- Return an order preview or checkout draft.

### Checkout Create Session

Path is **to verify**.

```http
POST /api/mobile/v1/checkout/create-session
```

Expected request fields **to verify**:

```json
{
  "cart_id": "current",
  "shipping_address_id": 555,
  "success_url": "bettavaro://checkout/success",
  "cancel_url": "bettavaro://checkout/cancel"
}
```

### Stripe Session Response

Expected response data **to verify**:

```json
{
  "checkout_url": "https://checkout.stripe.com/c/session-id",
  "session_id": "cs_test_or_live_value"
}
```

Mobile behavior:

- Open `checkout_url` using the approved in-app browser or platform browser flow.
- Do not collect or store raw card data in the app.
- Store `session_id` only as a short-lived checkout reference if needed.

### Payment Result Handling

Payment result handling is **to verify**.

Possible patterns to confirm:

- Stripe return deep link followed by server order lookup.
- Polling endpoint for checkout session or order status.
- Webhook-created order state exposed through buyer order detail.

Until verified, mobile clients should treat Stripe redirect success as provisional and fetch the resulting order from the server before showing final paid state.

## 8) Buyer Orders

Buyer order APIs expose authenticated buyer history, order detail, fulfillment status, and refund request actions.

### Buyer Orders

Path is **to verify**.

```http
GET /api/mobile/v1/buyer/orders
```

Alternate route name `buyer_orders` is known conceptually and needs path confirmation.

### Buyer Order Detail / My Order Detail

Path is **to verify**.

```http
GET /api/mobile/v1/buyer/orders/{order_id}
```

Alternate route name `my_order_detail` is known conceptually and needs path confirmation.

### Request Refund Endpoint

Path and request fields are **to verify**.

```http
POST /api/mobile/v1/buyer/orders/{order_id}/refund-request
```

```json
{
  "reason": "item_issue",
  "message": "Describe the issue for review."
}
```

Evidence upload support is **to verify**.

### Expected Order Fields

Field names are **to verify**.

```json
{
  "id": 1001,
  "order_number": "BV-1001",
  "status": "paid",
  "payment_status": "paid",
  "fulfillment_status": "unfulfilled",
  "refund_status": "none",
  "currency": "USD",
  "subtotal": "125.00",
  "shipping_total": "25.00",
  "tax_total": "0.00",
  "grand_total": "150.00",
  "created_at": "2026-05-17T00:00:00Z",
  "items": [],
  "seller": {
    "id": 44,
    "display_name": "Seller Name"
  }
}
```

### Fulfillment / Shipping Fields

Fields are **to verify**.

```json
{
  "shipping": {
    "carrier": "UPS",
    "tracking_number": "1Z...",
    "tracking_url": "https://carrier.example/track",
    "ship_by_date": "2026-05-20",
    "shipped_at": "2026-05-18T00:00:00Z",
    "delivered_at": null,
    "delivery_estimate": "2026-05-21"
  },
  "timeline": []
}
```

## 9) Seller

Seller APIs must return only seller-safe data and must enforce ownership server-side. The mobile client may hide seller screens for non-seller accounts, but the server must still authorize every seller request.

### Seller Dashboard

Path is **to verify**.

```http
GET /api/mobile/v1/seller/dashboard
```

Expected dashboard areas **to verify**:

- Revenue summary.
- Open orders.
- Pending fulfillment.
- Active listings.
- Auction activity.
- Refunds requiring attention.
- Notifications or alerts.

### Seller Listings

Path is **to verify**.

```http
GET /api/mobile/v1/seller/listings
```

Expected filters **to verify**:

- `status`
- `sale_status`
- `page`
- `limit`
- `sort`

### Seller Orders

Path is **to verify**.

```http
GET /api/mobile/v1/seller/orders
```

### Seller Order Detail

Path is **to verify**.

```http
GET /api/mobile/v1/seller/orders/{order_id}
```

### Seller Fulfillment Action

Path and request fields are **to verify**.

```http
POST /api/mobile/v1/seller/orders/{order_id}/fulfillment
```

```json
{
  "action": "mark_shipped",
  "carrier": "UPS",
  "tracking_number": "1Z...",
  "tracking_url": "https://carrier.example/track"
}
```

### Expected Seller-Safe Fields

Seller responses may include operational fields needed for fulfillment and listing management, but should avoid exposing unrelated buyer private data.

Expected seller-safe order fields **to verify**:

- `order_id`
- `order_number`
- `status`
- `payment_status`
- `fulfillment_status`
- `items`
- `buyer_display_name`
- `shipping_name`
- `shipping_address` only when needed for fulfillment.
- `shipping_phone` only if collected and needed for carrier workflow.
- `carrier`
- `tracking_number`
- `tracking_url`
- `ship_by_date`
- `created_at`

### Seller Ownership Rules

- Seller endpoints require a valid bearer token.
- The authenticated seller may only view or mutate listings and orders owned by that seller.
- Seller order detail must reject orders from other sellers with `not_found` or `forbidden`; exact code is **to verify**.
- Fulfillment actions must be idempotent or safely reject duplicate transitions.

## 10) Notifications

Notifications support buyer, seller, auction, order, refund, and system messages.

### Notifications List

Path is **to verify**.

```http
GET /api/mobile/v1/notifications
```

Common query parameters **to verify**:

- `page`
- `limit`
- `unread_only`
- `type`

### Mark Read

Path is **to verify**.

```http
POST /api/mobile/v1/notifications/{notification_id}/read
```

### Mark Unread

Path is **to verify**.

```http
POST /api/mobile/v1/notifications/{notification_id}/unread
```

### Unread Count

Path is **to verify**.

```http
GET /api/mobile/v1/notifications/unread-count
```

### Notification Fields

Field names are **to verify**.

```json
{
  "id": 701,
  "type": "order_update",
  "title": "Order update",
  "body": "Your order has shipped.",
  "is_read": false,
  "created_at": "2026-05-17T00:00:00Z",
  "read_at": null,
  "deep_link": "bettavaro://orders/1001",
  "resource": {
    "type": "order",
    "id": 1001
  }
}
```

## 11) Error Code Catalog

The catalog below lists expected mobile-facing error code groups. Exact server codes are **to verify** unless specifically known from current flow notes.

### Auth

- `token_missing`: bearer token is absent or malformed.
- `unauthorized`: credentials, token, role, or resource access is invalid.
- `token_expired`: bearer token has expired.
- `forbidden`: authenticated user lacks required permission; exact usage is **to verify**.
- `invalid_credentials`: login failed; exact usage is **to verify**.

### Validation

- `validation_failed`: request failed one or more validation rules.
- `missing_field`: required field was not provided.
- `invalid_field`: field value is malformed or unsupported.
- `invalid_amount`: amount is malformed, non-positive, or has invalid precision.
- `invalid_state`: requested action is not valid for the current resource state.

### Listing

- `listing_not_found`: listing does not exist or is not visible to the requester.
- `listing_unavailable`: listing cannot currently be purchased, bid on, or added to cart.
- `listing_sold`: listing has already sold.
- `listing_inactive`: listing is not active.

### Auction

- `auction_not_live`: auction is not currently live.
- `bid_too_low`: bid does not meet the minimum next bid.
- `auction_ended`: auction has ended.
- `auction_not_found`: auction could not be found; exact usage is **to verify**.
- `duplicate_bid`: duplicate or replayed bid request; exact usage is **to verify**.

### Cart

- `cart_not_found`: cart does not exist or is unavailable.
- `cart_item_not_found`: cart item could not be found.
- `cart_item_unavailable`: item can no longer remain in the cart.
- `cart_stale`: cart prices or availability changed and must be refreshed.
- `quantity_not_supported`: quantity is not allowed for the listing; exact usage is **to verify**.

### Checkout

- `checkout_failed`: checkout could not be started or completed.
- `checkout_stale`: server-calculated totals changed.
- `stripe_session_failed`: Stripe session could not be created.
- `payment_required`: payment is required before order completion.
- `payment_pending`: payment is not final yet.
- `payment_failed`: payment failed.
- `payment_canceled`: buyer canceled payment.

### Orders

- `order_not_found`: order does not exist or requester cannot access it.
- `order_access_denied`: requester is not allowed to view the order; exact usage is **to verify**.
- `order_not_paid`: order has not reached paid state.
- `fulfillment_not_available`: fulfillment action is not available for current state.

### Refunds

- `refund_not_eligible`: order or item is not eligible for refund request.
- `refund_already_requested`: a refund request already exists.
- `refund_window_closed`: refund request period has ended.
- `refund_request_not_found`: refund request could not be found.

### Seller

- `seller_required`: authenticated account must be a seller.
- `seller_not_found`: seller profile could not be found.
- `seller_ownership_required`: listing or order does not belong to seller.
- `fulfillment_action_invalid`: fulfillment transition is invalid.
- `tracking_required`: carrier tracking fields are required for the action.

### Notifications

- `notification_not_found`: notification does not exist or belongs to another user.
- `notification_update_failed`: read/unread status could not be updated.
- `unread_count_failed`: unread count could not be loaded.

### System

- `rate_limited`: too many requests.
- `maintenance`: API is temporarily unavailable.
- `server_error`: unexpected server error.
- `service_unavailable`: dependent service is unavailable.
- `not_implemented`: endpoint or behavior is not available; exact usage is **to verify**.

## 12) Mobile Client Rules

### Commerce Safety

- Never trust cached price, bid, shipping, tax, fee, or availability data for checkout.
- Re-fetch listing detail before bidding, adding to cart, buy-now, or checkout session creation.
- Re-fetch order detail before refund requests, fulfillment actions, or showing final payment success.
- Treat server response as authoritative for price, order state, auction state, and payment state.

### Duplicate Submit Protection

- Disable primary action buttons while write requests are in flight.
- Use local in-flight request guards for bid, cart add/remove, checkout create session, refund request, mark notification read/unread, and fulfillment actions.
- If the server supports idempotency keys, send a unique key for high-risk write actions. Idempotency support is **to verify**.

### Retry Strategy

- Retry safe `GET` requests on transient network failure using short exponential backoff.
- Do not automatically retry bids, checkout session creation, refund requests, or fulfillment mutations unless the server confirms idempotency support.
- For `429`, respect server retry metadata if present. Retry metadata is **to verify**.
- For `500` or network timeout during high-risk writes, show an indeterminate state and re-fetch the relevant resource before allowing another submit.

### Offline Behavior

- Permit offline display of previously cached listings, listing detail, orders, and notifications only when clearly marked as possibly stale.
- Disable bidding, cart mutation, checkout, refund requests, seller fulfillment, and read/unread notification mutations while offline.
- Queueing write actions offline is not recommended unless the server provides idempotency and conflict handling.

### Idempotency Expectations

Idempotency behavior is **to verify**.

Recommended mobile-safe expectation:

- Bids: no blind retry without resource refresh.
- Cart add/remove: may be retried only if server operation is idempotent or client can reconcile final cart state.
- Checkout session creation: use idempotency key if supported; otherwise avoid repeated automatic creation.
- Refund request: no automatic retry without checking order/refund state.
- Fulfillment action: no automatic retry without checking seller order detail.

### User Experience Rules

- Show field-level validation when the server provides validation details.
- Show friendly, localized messages for common errors while preserving server `error.code` for telemetry.
- Include a support-friendly request ID in error UI if `meta.request_id` is provided.
- Prefer pull-to-refresh or explicit retry buttons on read failures.

## 13) Open Questions / To Verify

Confirm the following items directly from `/public_html/api/mobile/v1/` server files before final mobile implementation:

1. Exact endpoint paths for login, logout, and any token refresh or revoke behavior.
2. Token format, expiry field name, refresh-token support, and server handling of expired tokens.
3. Exact HTTP status codes and response envelope consistency across all endpoints.
4. Exact path and query parameters for listings list.
5. Whether listing detail supports ID lookup, slug lookup, or both.
6. Exact search filters endpoint and the canonical filter key names.
7. Listing field names for `status`, `sale_status`, `seller`, `auction`, `reviews`, and `ranking`.
8. Exact auction bid endpoint path and whether it is listing-based or auction-based.
9. Bid amount type, currency rules, decimal precision, and minimum increment behavior.
10. Whether cart APIs support quantity greater than one for any listing type.
11. Exact cart add/remove endpoints and whether removal is by cart item ID or listing ID.
12. Exact checkout start and Stripe session creation endpoints.
13. Payment result flow after Stripe return: deep link lookup, polling endpoint, order lookup, or another pattern.
14. Buyer orders endpoint path and pagination model.
15. Buyer order detail route naming: `buyer_order_detail`, `my_order_detail`, or another path.
16. Refund request endpoint, allowed reasons, required fields, evidence upload support, and refund eligibility rules.
17. Seller dashboard metrics and field names.
18. Seller listing and seller order endpoint paths, filters, and pagination model.
19. Seller fulfillment action names, required tracking fields, and idempotency behavior.
20. Notification list endpoint, mark read/unread endpoint method, unread count endpoint, and deep-link payload format.
21. Canonical error code names for each system area.
22. Rate limit headers, retry metadata, and maintenance-mode response shape.
23. Whether server supports idempotency keys for bid, checkout, refund, cart, and fulfillment write endpoints.
24. Whether any endpoint requires multipart form data or non-JSON content types.
25. Any app-version, platform, locale, currency, or device headers expected by the server.
