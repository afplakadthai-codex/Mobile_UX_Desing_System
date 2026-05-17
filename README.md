# Bettavaro Mobile Design System

Bettavaro is a premium mobile marketplace for collector-grade betta fish. This design system defines reusable UX and UI foundations for iOS and Android experiences across listings, auctions, fixed-price sales, offers, checkout, orders, fulfillment, refunds, notifications, and seller operations.

## 1. Design Principles

- **Luxury aquatic marketplace:** Use deep emerald surfaces, controlled soft-gold accents, elegant typography, and spacious layouts to create a refined collector experience.
- **Collector-grade confidence:** Prioritize provenance, seller trust, health details, shipping clarity, and transparent timelines.
- **Commerce-first clarity:** Make price, auction state, offer state, shipping status, and next actions immediately understandable.
- **Mobile-native efficiency:** Design for thumb reach, safe areas, haptics, dynamic type, dark-mode readiness, and platform-standard motion.
- **Modern, not childish:** Avoid cartoon fish motifs, neon blues, novelty icons, and overdecorated gradients.

## 2. Color Tokens

### Brand Palette

| Token | Hex | Usage |
| --- | --- | --- |
| `color.brand.emerald.950` | `#06251D` | App chrome, luxury headers, dark hero backgrounds |
| `color.brand.emerald.900` | `#0B3328` | Primary navigation, selected tab backgrounds |
| `color.brand.emerald.800` | `#104334` | Primary buttons, active controls |
| `color.brand.emerald.700` | `#155642` | Pressed primary states, premium badges |
| `color.brand.emerald.600` | `#1E6B52` | Links on light surfaces, success emphasis |
| `color.brand.emerald.100` | `#DCEDE7` | Subtle selected backgrounds |
| `color.brand.emerald.50` | `#F2F8F5` | Page tint, empty-state panels |
| `color.accent.gold.600` | `#B9903D` | Gold CTAs, auction highlights, premium dividers |
| `color.accent.gold.500` | `#D3AD5C` | Icons, small emphasis, selected stars |
| `color.accent.gold.200` | `#F0DEB7` | Badge fills, elevated highlights |
| `color.accent.gold.50` | `#FCF7EA` | Gentle offer and promotion backgrounds |

### Neutral Palette

| Token | Hex | Usage |
| --- | --- | --- |
| `color.neutral.0` | `#FFFFFF` | Primary surfaces and cards |
| `color.neutral.50` | `#F8FAF9` | App background |
| `color.neutral.100` | `#EEF2F0` | Secondary surface, skeleton fills |
| `color.neutral.200` | `#DDE4E1` | Borders, separators |
| `color.neutral.300` | `#C8D2CE` | Disabled outlines |
| `color.neutral.500` | `#77837E` | Secondary text |
| `color.neutral.700` | `#3B4641` | Body text |
| `color.neutral.900` | `#17211D` | Headings, high-emphasis text |
| `color.neutral.950` | `#0C1210` | Modal scrims, near-black text |

### Semantic Palette

| Token | Hex | Usage |
| --- | --- | --- |
| `color.status.success` | `#1F8A5B` | Paid, fulfilled, refund approved |
| `color.status.warning` | `#C98017` | Auction ending, offer pending, shipment attention |
| `color.status.error` | `#B13A31` | Payment failed, refund denied, form errors |
| `color.status.info` | `#2F6F95` | Tracking updates, system notifications |
| `color.status.bid` | `#7B5CFF` | Active bid state, outbid alerts |
| `color.status.offer` | `#A66A24` | Offer negotiation state |

### Accessibility Rules

- Body text on light surfaces must use `color.neutral.700` or darker.
- Primary CTA text on emerald buttons uses `color.neutral.0`.
- Gold is an accent, not a long-form text color; pair with dark emerald text for readability.
- Status colors must be paired with labels or icons and never be the only state indicator.

## 3. Typography Scale

Use iOS SF Pro and Android Roboto by default. For premium marketing moments, use a restrained serif accent such as Playfair Display only for optional hero headings, never for dense commerce UI.

| Token | Size | Line Height | Weight | Usage |
| --- | ---: | ---: | --- | --- |
| `type.display.lg` | 34 | 42 | 700 | Onboarding hero, marketplace campaign header |
| `type.display.md` | 28 | 36 | 700 | Listing detail title, seller dashboard header |
| `type.title.lg` | 24 | 32 | 700 | Section landing titles |
| `type.title.md` | 20 | 28 | 700 | Card headers, checkout step titles |
| `type.title.sm` | 18 | 24 | 650 | Product names, order summaries |
| `type.body.lg` | 17 | 26 | 400 | Long-form listing notes, policies |
| `type.body.md` | 15 | 22 | 400 | Default body copy |
| `type.body.sm` | 13 | 18 | 400 | Supporting metadata, timestamps |
| `type.label.lg` | 15 | 20 | 650 | Buttons, input labels |
| `type.label.md` | 13 | 18 | 650 | Badges, tab labels, chips |
| `type.label.sm` | 11 | 14 | 700 | Auction counters, compact statuses |
| `type.numeric.md` | 17 | 24 | 700 | Prices, bids, totals |

### Typography Rules

- Use tabular numerals for prices, countdowns, order IDs, and bid counts.
- Limit product listing names to two lines on cards and three lines on detail pages before truncation.
- Preserve dynamic type support by allowing cards to grow vertically rather than shrinking text.

## 4. Spacing Scale

| Token | Value | Usage |
| --- | ---: | --- |
| `space.0` | 0 | Flush alignment |
| `space.1` | 4 | Tight icon/text spacing |
| `space.2` | 8 | Compact chip padding, list gaps |
| `space.3` | 12 | Card internal gaps, form helper spacing |
| `space.4` | 16 | Standard screen padding, button horizontal padding |
| `space.5` | 20 | Section spacing |
| `space.6` | 24 | Large component separation |
| `space.8` | 32 | Hero and empty-state spacing |
| `space.10` | 40 | Page-level vertical rhythm |
| `space.12` | 48 | Major onboarding or dashboard blocks |

### Layout Rules

- Standard mobile page padding is `space.4` on phones and `space.6` on large phones/foldables.
- Bottom fixed actions must include safe-area padding plus `space.3`.
- Dense seller dashboards may use `space.3` internal spacing but keep `space.4` page margins.

## 5. Border Radius System

| Token | Value | Usage |
| --- | ---: | --- |
| `radius.none` | 0 | Full-bleed media edges when intentional |
| `radius.xs` | 4 | Progress indicators, small badges |
| `radius.sm` | 8 | Inputs, small chips |
| `radius.md` | 12 | Buttons, compact cards |
| `radius.lg` | 16 | Product cards, order cards |
| `radius.xl` | 24 | Hero panels, bottom sheets |
| `radius.full` | 999 | Pills, avatars, floating action buttons |

Use consistent corner radii inside a component. For example, a product card with `radius.lg` should use image corners of `radius.md` when the image is inset, or the same `radius.lg` when the image is flush.

## 6. Shadow and Elevation System

| Token | Shadow | Usage |
| --- | --- | --- |
| `elevation.none` | none | Flat lists, separators-only layouts |
| `elevation.1` | `0 1px 2px rgba(12,18,16,0.06)` | Inputs, subtle cards |
| `elevation.2` | `0 4px 12px rgba(12,18,16,0.08)` | Product cards, sticky summaries |
| `elevation.3` | `0 8px 24px rgba(12,18,16,0.12)` | Bottom sheets, floating checkout CTA |
| `elevation.4` | `0 16px 40px rgba(12,18,16,0.18)` | Modals, auction bid confirmation |

### Elevation Rules

- Prefer borders over heavy shadows for marketplace density.
- Use elevated gold-accent cards sparingly for active auctions, checkout totals, and seller revenue summaries.
- On dark emerald surfaces, use translucent white borders instead of dark shadows.

## 7. Button Styles

### Primary Button

- **Use for:** Buy now, place bid, submit offer, checkout, confirm shipment, issue refund.
- **Background:** `color.brand.emerald.800`.
- **Text:** `color.neutral.0`, `type.label.lg`.
- **Radius:** `radius.md`.
- **Height:** 52 px default, 44 px compact.
- **Pressed:** `color.brand.emerald.700` with slight scale to 98%.
- **Disabled:** `color.neutral.200` background and `color.neutral.500` text.

### Gold Premium Button

- **Use for:** High-value auction bidding, premium seller upgrade, promoted listing.
- **Background:** `color.accent.gold.600`.
- **Text:** `color.brand.emerald.950`.
- **Rule:** Use only one gold button per screen.

### Secondary Button

- **Use for:** Message seller, save, track package, view policy.
- **Background:** `color.neutral.0`.
- **Border:** 1 px `color.neutral.200`.
- **Text:** `color.brand.emerald.800`.

### Tertiary Text Button

- **Use for:** Cancel, edit, view all, remove item.
- **Background:** transparent.
- **Text:** `color.brand.emerald.700` or `color.status.error` for destructive actions.
- **Minimum tap target:** 44 x 44 px.

### Split Commerce Actions

For listing detail screens, use a sticky bottom action area:

1. Primary action: `Buy now`, `Place bid`, or `Accept offer`.
2. Secondary action: `Make offer`, `Add to cart`, or `Message seller`.
3. Supporting microcopy: shipping price, buyer protection, or auction close time.

## 8. Card Styles

### Base Marketplace Card

- **Surface:** `color.neutral.0`.
- **Border:** 1 px `color.neutral.200`.
- **Radius:** `radius.lg`.
- **Elevation:** `elevation.1` default, `elevation.2` on press or featured state.
- **Padding:** `space.3` compact or `space.4` standard.
- **Content order:** media, title, price/bid, seller trust, status/action.

### Premium Feature Card

- **Surface:** subtle emerald gradient from `color.brand.emerald.950` to `color.brand.emerald.800`.
- **Accent:** 1 px translucent gold border.
- **Text:** white heading with gold metadata.
- **Use for:** featured auction, seasonal collection, seller analytics hero.

### Order Card

- **Surface:** `color.neutral.0`.
- **Top row:** order status badge, order date, order ID.
- **Body:** thumbnail, listing title, buyer/seller counterpart, quantity, total.
- **Footer actions:** track, message, refund, mark fulfilled depending on role and state.

## 9. Badge and Status Styles

| Badge | Visual Style | Supported States |
| --- | --- | --- |
| Auction | Purple-tinted pill with countdown icon | Live, ending soon, reserve met, outbid, won, lost |
| Fixed Price | Emerald-tinted pill | Available, in cart, purchased |
| Offer | Gold-tinted pill | Offer pending, countered, accepted, declined, expired |
| Order | Semantic pill | Paid, processing, shipped, delivered, completed, cancelled |
| Refund | Error/warning/success pill | Requested, under review, approved, issued, denied |
| Seller Trust | Emerald outline pill | Verified seller, top breeder, health guarantee |
| Notification | Dot or compact pill | New, unread, urgent, action required |

Badge construction:

- Height: 24 px standard, 20 px compact.
- Radius: `radius.full`.
- Padding: 8 px horizontal, 4 px vertical.
- Text: `type.label.sm` or `type.label.md`.
- Include an icon for urgent, warning, refund, and outbid states.

## 10. Form Input Styles

### Text Input

- **Height:** 52 px default.
- **Radius:** `radius.sm`.
- **Border:** 1 px `color.neutral.200`.
- **Background:** `color.neutral.0`.
- **Label:** `type.label.md`, `color.neutral.700`.
- **Placeholder:** `color.neutral.500`.
- **Focus:** 2 px emerald focus ring with 1 px white inner offset.
- **Error:** `color.status.error` border plus helper text below.

### Marketplace Form Patterns

- Price inputs use a currency prefix and tabular numerals.
- Auction duration inputs use segmented controls for common values.
- Offer forms show current price, offer amount, seller response window, and buyer commitment note.
- Checkout address inputs support autocomplete, validation, and a compact shipping restriction notice for live fish.
- Refund forms include reason selector, photo attachment tile, explanatory text area, and policy reminder.

### Selectors and Chips

- Filter chips use `radius.full`, emerald selected state, and neutral unselected outline.
- Size, color, tail type, gender, age, shipping region, auction ending soon, and verified seller are primary marketplace filters.

## 11. Loading, Empty, and Error States

### Loading

- Use skeleton cards that mirror product card structure.
- Image skeleton uses `color.neutral.100`; text rows use `color.neutral.200`.
- Auction countdown and price placeholders should preserve layout width to avoid jump.
- Pull-to-refresh uses platform-native behavior with emerald spinner.

### Empty States

- **Marketplace search empty:** refined line illustration, title `No rare bettas found`, helper text, and `Clear filters` action.
- **Cart empty:** title `Your collection cart is empty`, helper text, and `Browse listings` action.
- **Seller orders empty:** title `No seller orders yet`, helper text about new orders appearing after purchase.
- **Notifications empty:** title `All caught up`, helper text about bids, offers, order updates, and refunds.

### Error States

- Inline errors appear next to the failed component whenever possible.
- Full-screen errors use a calm emerald panel, clear title, short explanation, and one primary retry action.
- Checkout errors must preserve cart contents and explain whether payment, address, inventory, or shipping validation failed.
- Auction bid errors must distinguish network failure, bid too low, auction ended, and payment verification required.

## 12. Bottom Navigation Pattern

Use a five-tab bottom navigation with clear marketplace roles and notification affordances.

| Tab | Icon Direction | Label | Primary Destinations |
| --- | --- | --- | --- |
| Home | Elegant house or waterline | Home | Featured listings, auctions, curated collections |
| Search | Magnifier | Search | Filters, saved searches, category browsing |
| Sell | Rounded plus in emerald/gold | Sell | Create listing, seller dashboard, drafts |
| Orders | Receipt or package | Orders | Buyer orders, seller orders, fulfillment, refunds |
| Inbox | Bell/message hybrid | Inbox | Messages, offers, bid alerts, notifications |

Rules:

- Height: 64 px plus safe area.
- Active tab: emerald icon and label, optional gold top indicator.
- Inactive tab: `color.neutral.500`.
- Use unread dots for notifications and offer counters.
- The central Sell tab may use a raised circular button only if it does not obscure labels or safe areas.

## 13. Product Listing Card

### Purpose

Compact reusable card for marketplace feeds, search results, seller inventory, saved listings, cart recommendations, and auction discovery.

### Anatomy

1. **Image area:** 4:3 or 1:1 image with rounded top corners, optional carousel dots for multiple photos.
2. **Top media overlay:** auction countdown, featured badge, or saved heart.
3. **Title:** fish name, tail type, and color strain, maximum two lines.
4. **Seller row:** seller avatar, breeder name, verified badge, location or shipping region.
5. **Commerce row:** fixed price, current bid, or offer range.
6. **Metadata row:** gender, age, shipping method, health guarantee.
7. **Action row:** save, quick offer, add to cart, or bid depending on listing type.

### State Variants

- **Fixed price:** show `Buy now` price and optional `Add to cart` compact button.
- **Auction:** show current bid, bid count, countdown, reserve status, and `Bid` action.
- **Offers enabled:** show price plus `Offers welcome` badge.
- **Sold:** desaturate image, show `Sold` badge, disable commerce action.
- **In cart:** show cart badge and `View cart` action.

## 14. Listing Detail Layout

### Screen Structure

1. **Photo gallery:** full-width image carousel with safe-area-aware top controls for back, share, and save.
2. **Listing header:** title, status badge, seller verification, location, and report action.
3. **Price module:** fixed price, auction current bid, offer range, reserve status, bid count, and countdown.
4. **Primary commerce actions:** sticky bottom action area for buy, bid, offer, cart, or checkout continuation.
5. **Trust module:** seller rating, completed orders, response time, health guarantee, live-arrival policy.
6. **Fish details:** strain, tail type, gender, age, size, temperament notes, diet, water parameters.
7. **Shipping and fulfillment:** carrier, shipping window, heat/cold pack availability, live-arrival requirements.
8. **Description:** seller-provided notes with expandable long text.
9. **Policies:** returns, refunds, cancellation, auction payment deadline, offer expiration rules.
10. **Related listings:** more from seller and similar collector strains.

### Detail Behavior

- Auction listings pin countdown and minimum bid increment in the sticky action area.
- Fixed-price listings support `Buy now` and `Add to cart` when inventory allows.
- Offer-enabled listings show current offer state and next response deadline.
- If checkout is blocked by shipping region, disable purchase action and show a clear restriction message.

## 15. Order Timeline Component

### Purpose

A reusable fulfillment timeline for buyer orders, seller orders, checkout confirmation, refund review, and notification deep links.

### Anatomy

- **Header:** order status, order ID, total, counterpart name.
- **Progress rail:** vertical line with status nodes.
- **Node:** icon, title, timestamp, description, optional action.
- **Current node:** emerald filled node with bold title.
- **Completed node:** success checkmark.
- **Attention node:** warning or error icon with action button.

### Standard Fulfillment Steps

1. `Order placed` — payment authorized or captured.
2. `Seller confirmed` — seller accepts and prepares shipment.
3. `Packing live fish` — optional preparation details.
4. `Shipped` — carrier and tracking number available.
5. `In transit` — tracking events summarized.
6. `Delivered` — delivery timestamp and buyer confirmation.
7. `Completed` — protection window closed.

### Refund Timeline Steps

1. `Refund requested` — buyer or seller opened a case.
2. `Evidence submitted` — photos, notes, or tracking attached.
3. `Under review` — marketplace review in progress.
4. `Decision issued` — approved, partially approved, or denied.
5. `Refund completed` — payment returned or credit issued.

## 16. Seller Dashboard Card Pattern

### Dashboard Principles

Seller tools should feel calm, authoritative, and operationally efficient. Avoid visual clutter while surfacing urgent actions: new orders, expiring offers, auction close times, refund cases, and fulfillment deadlines.

### Card Types

#### Revenue Summary Card

- Premium emerald surface with subtle gold accent.
- Shows gross sales, pending payouts, active listings, and month-over-month delta.
- Includes compact link to payout details.

#### Action Queue Card

- White card with status chips and prioritized rows.
- Rows include `Ship by`, `Respond to offer`, `Confirm order`, `Review refund`, and `Auction ending`.
- Urgent rows use warning icon and deadline text.

#### Inventory Health Card

- Shows active, draft, sold, paused, and low-photo-quality listings.
- Includes quick actions for `Promote`, `Edit`, `Relist`, and `Duplicate`.

#### Seller Order Card

- Shows buyer name, order status, shipping deadline, item thumbnail, total, and next seller action.
- Supports fulfillment actions: print label, add tracking, mark shipped, message buyer, issue refund.

#### Auction Performance Card

- Shows watched listings, current bid, bid count, time remaining, reserve status, and conversion hints.
- Uses gold accent only for high-value or ending-soon auctions.

## 17. Marketplace Flow Support

### Auctions

- Always show countdown, current bid, bid count, minimum next bid, reserve status, and payment deadline.
- Outbid notifications should deep link directly to the bid module.
- Ending-soon states use warning color plus motion or haptic feedback sparingly.

### Fixed Price

- Make `Buy now` the dominant action.
- Support cart entry points from listing cards, detail pages, and saved listings.
- If only one item is available, clearly transition to sold or unavailable after purchase.

### Offers

- Show offer eligibility, seller response window, buyer commitment language, counteroffer state, and expiration.
- Use a threaded negotiation view for buyer and seller clarity.

### Cart and Checkout

- Cart rows show thumbnail, seller, listing type, price, shipping estimate, and live-fish shipping notices.
- Checkout groups items by seller when shipping rules differ.
- Order summary must show subtotal, shipping, taxes/fees, credits, and total.

### Buyer and Seller Orders

- Use separate filters for buying and selling roles under the Orders tab.
- Preserve consistent order status language across both views.
- Seller orders emphasize next action and deadline; buyer orders emphasize tracking and protection.

### Refunds

- Refund states must be visible in order cards, detail screens, notifications, and timeline nodes.
- Pair every refund status with expected next step and estimated review timing.

### Notifications

- Notification rows include type icon, short title, related listing/order, timestamp, and required action.
- Priority notification types: outbid, auction won, offer received, offer accepted, payment needed, shipment update, refund update, seller order deadline.

## 18. Motion, Haptics, and Interaction

- Use 150-250 ms transitions for cards, tabs, sheets, and commerce state changes.
- Use light haptics for save, add to cart, successful bid, and sent offer.
- Use warning haptics only for bid errors, checkout failure, or urgent seller deadline.
- Respect reduced-motion settings by removing parallax, shimmer, and nonessential animation.

## 19. Accessibility and Platform Requirements

- Minimum tap target is 44 x 44 px.
- Support screen readers with explicit labels such as `Current bid, 120 dollars, 6 bids, auction ends in 2 hours`.
- Do not rely on color alone for auction, refund, or order statuses.
- Support dynamic type, high contrast, reduced motion, and platform dark mode.
- Keep sticky bottom actions above iOS home indicator and Android gesture navigation.

## 20. Implementation Notes for Designers

- Treat tokens as source-of-truth variables for native iOS, native Android, and cross-platform UI libraries.
- Components should be reusable across buyer and seller contexts with role-specific action slots.
- Favor native platform controls for date pickers, address autocomplete, payment sheets, and file/photo attachments.
- This specification is UX/UI-only and intentionally does not define backend contracts, API behavior, or data schemas.
