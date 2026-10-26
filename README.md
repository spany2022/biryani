# Noor — Hyderabadi Dum House

A cinematic, story-driven restaurant site for Hyderabadi dum biryani — with a real
ordering flow behind it: menu, cart, server-side pricing, checkout, order tracking,
catering and table requests, and an admin dashboard.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger,
Lenis and a little Framer Motion (menu filtering). No 3D/WebGL — a 2.5D approach
(layered photography, masks, steam, light) keeps it fast on phones.

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
npm run build && npm start
```

## Demo mode — read this first

`data/ordering.ts → mode: "demo"`. In demo mode:

- Orders, catering enquiries and table requests are saved to `.data/store.json` and show up
  in `/admin`. **No payment is taken and nothing reaches a kitchen.** Every screen says so.
- Payment is "pay on delivery / at the counter" only. `onlinePayments` is `null`, and the
  checkout says online payment isn't set up.

## Before launch — replace placeholders

Nothing factual about the business has been invented. Unconfirmed values are `null` and the UI
shows "To be announced" or hides the action.

| What | Where | Notes |
| --- | --- | --- |
| Brand name ("Noor" is a placeholder), Urdu name, address, phone, email, hours, socials, Google profile, map link | `data/business.ts` | Hidden or "To be announced" while `null` |
| Services actually offered (delivery, pickup, reservations, family packs, catering…) | `business.services` | Turning one off removes its UI and API path |
| Menu, prices, portions, badges, availability | `/admin` (seeded from `data/menu.ts`) | **Sample data.** Badges like "Bestseller" must be accurate |
| Tax rate, delivery fee, free-delivery threshold, minimum order, delivery pincodes, promo codes | `data/ordering.ts` | Sample values (GST 5%, sample Hyderabad pincodes, `DEMO10`). Confirm with the restaurant |
| Reviews and rating | `data/reviews.ts` | Verified reviews only, with permission. Empty → honest placeholder |
| Story and method copy | `data/story.ts` | Describes the traditional dum method generally. Confirm anything presented as the restaurant's own practice |
| Photography | `public/images/` | **Unsplash stock placeholders.** Replace them with photos of the real dishes and dining room (same filenames), and update the alt text |
| Production domain | `NEXT_PUBLIC_SITE_URL` | Canonical URL, Open Graph |

## Ordering architecture

- **Prices are computed only on the server** (`lib/pricing.ts`). The client sends item IDs,
  portion IDs and quantities; `/api/quote` and `/api/orders` re-price from the menu store, apply
  the promo, delivery fee and tax, and check availability, minimum order and delivery pincode.
- `/api/orders` validates the customer details and refuses an order that isn't `orderable`.
  It returns an order ID plus a secret token. The tracking page `/order/[id]?t=…` polls for status.
- **Admin** (`/admin`): password from `ADMIN_PASSWORD`, signed HTTP-only session cookie. Update
  order status, edit dishes (name, description, category, portions and prices, veg, spice, badges,
  availability, photo, alt text), add or remove dishes, and work through enquiries. Menu changes
  appear on the site immediately.
- **Data store** (`lib/store.ts`): a JSON file. Fine for the demo and a single small server. It is
  **not** suitable for serverless hosting (read-only/ephemeral disks) or multiple instances.
  Swap these functions for a real database (Postgres, SQLite, Supabase…) before taking real orders.
  No other module touches the data directly.

### To go live

1. Real database in `lib/store.ts`.
2. Kitchen notification (email/WhatsApp/POS webhook) when an order is created.
3. If online payment is wanted: a payment provider (e.g. Razorpay) with server-side order creation
   and webhook verification. Mark the order paid only from the verified webhook.
4. Set `ordering.mode = "live"` and confirm every value in `data/ordering.ts`.
5. Rate-limit the public POST endpoints at the edge/proxy.

## Structure

```
app/                     layout (fonts, cart provider), home, checkout, order/[id], admin, api/*
components/sections/     Hero, Story (5 pinned scenes), Signature (horizontal shelf), DumArt (timeline),
                         RoyalMenu, Dining (+ lightbox, ReservationForm), WhyUs, Reviews, Feasts, Closing
components/cart/         CartProvider (localStorage), CartDrawer, AddToCart
components/checkout/     Checkout, OrderStatus
components/admin/        AdminLogin, AdminApp
components/ui/           Button (magnetic), SplitHeading, Steam, DishDialog, DishMeta, Field, CursorFollower
data/                    business, ordering, menu (seed), story, reviews
lib/                     pricing, store, auth, validation, gsap, scroll, types
```

## Motion and accessibility

- All GSAP work runs inside `gsap.matchMedia()`. With `prefers-reduced-motion: reduce`, Lenis,
  parallax, pinning, the cursor follower and magnetic buttons are off. The story becomes a stacked
  editorial sequence and the signature shelf becomes a grid.
- The pinned story is `aria-hidden`. Screen readers get the same five scenes as a plain list.
- The signature shelf pins only on large screens. Keyboard focus inside it scrolls the page to the
  focused card. Phones get a touch-friendly grid.
- Dialogs (cart, dish details, lightbox, mobile nav) use native `<dialog>`: focus trap, Escape and
  focus restore. Filters use `aria-pressed` and a polite live region. Cart additions are announced.
- Veg / non-veg marks follow the standard Indian symbols and have text labels.
