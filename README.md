# Stripe Payments screen

A rebuild of the Stripe Dashboard's **Transactions → Payments** screen in Next.js (App Router) and TypeScript.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /payments
npm test           # Vitest unit tests (formatting, filters, URL state, sorting, CSV)
npm run typecheck
npm run lint
npm run build
```

## What's included

**Payments table (required)**

- Columns: Amount and currency, status badge, payment method (brand mark plus `•••• 4242`), description, customer, date, refunded date, decline reason, and **Payment ID** (shortened, with copy to clipboard).
- Hovering a date shows a tooltip with the relative time ("3 hours ago") and the full timestamp.
- Sorting by **Amount, Date and Status**. A click sorts by that column and a second click reverses it. **Shift+click adds a secondary sort** (multi-column); the header shows the sort order.
- Client-side pagination with **25 / 50 / 100** rows per page.
- Filters:
  - **Date and time**: Today, Last 7 days, Last 30 days, Custom range.
  - **Amount**: equal to, between, greater than, less than.
  - **Currency**, **Status** and **Payment method** (Card / ACH / Wallet): multi-select.
  - **Text search** by payment ID, email or last 4. It's in the top bar (press `/`) and also under "More filters".
- The status cards (All, Succeeded, Refunded, …) are quick filters on the same `status` state.
- Mock data: 640 payments from a seeded generator. They span about 90 days, in 6 currencies (including zero-decimal JPY and `R$` BRL), with all 8 statuses and card, Link, Apple Pay, Google Pay and ACH payment methods.

**Nice-to-haves**

- Left sidebar and top bar, with an account menu on the "cramly.ai" switcher.
- Payment details page (`/payments/[id]`) with a timeline, fee breakdown, payment method, metadata and customer.
- **All table state lives in the URL** (`?status=failed,refunded&amount=gt:20&date=30d&sort=-amount,-created&size=50&page=2`). Links can be shared and reloads keep the view.
- **CSV export** of every row that matches the current filters and sort, not just the visible page.
- "Edit columns" lets you hide or show columns; the choice is saved in `localStorage`.

**Every other Dashboard page, with mock data.** Every sidebar item and Transactions tab opens a working page built from the same seeded data:

- **Transactions tabs:** Payouts, Top-ups, Collected fees, Transfers and All activity. All activity lists the balance transactions behind each payment.
- **Overview:** Home (today vs yesterday chart, KPI tiles, recent failures), Balances, and Customers (aggregated from payments; a click opens that customer's payments).
- **Analysis and risk:** Payments analytics, Reports (CSV downloads), Sigma (query templates), Radar (rules and review queue), Disputes, and Revenue recognition.
- **Products:** Product catalog, Subscriptions, Invoices, Payment links, Connect, Connected accounts, Tax, Issuing, Climate, and Developers (test-mode API keys, webhooks and request logs).

Charts are hand-written inline SVG, so the app adds no chart dependency.

## How it's organized

```
src/
  app/                      routes: /payments, /payments/[id], not-found
  components/
    shell/                  Sidebar, TopBar
    sections/               one folder per Dashboard section + registry.ts (slug -> page)
    customers/              Customers page
    payments/               page sections, table, columns, filters/, cells/, details/
    ui/                     Radix wrappers (Popover, Tooltip, Menu, Checkbox), Button, icons
  hooks/                    usePaymentsQuery (URL <-> state), useHydrated
  lib/
    types.ts                domain model (PaymentMethod is a discriminated union)
    mock/generate.ts        seeded PRNG payments generator (+ treasury, analytics, catalog)
    sections.ts             section slugs, titles and Transactions tabs
    filters.ts              filter/sort types, predicates, URL parse/serialize
    paymentsService.ts      in-memory "API": query(filters, sort, page) -> rows, total, counts
    format.ts               money, dates and relative time (Intl), labels
    csv.ts                  RFC 4180 CSV with formula-injection guard
```

### Decisions and trade-offs

- **Tailwind v4, Radix primitives and TanStack Table.** Radix provides accessible popovers, menus and tooltips without imposing any look. Tailwind tokens in `globals.css` hold Stripe's colors, shadows and sizes. TanStack Table runs in manual mode because the service already does the sorting and paging.
- **The URL is the single source of truth** for filters, sort and paging. `parseQuery` and `serializeQuery` are pure functions with unit tests, and `serializeQuery` leaves out defaults, so `/payments` stays clean.
- **Amounts are stored in minor units**, as in Stripe. Amount filters compare in each payment's own currency, the way Stripe does. Amount sorting uses an approximate USD value so ¥12,000 doesn't rank above $599.
- **Hydration safety.** Dates depend on the clock and the viewer's time zone, so the table renders after hydration, with a skeleton until then. This avoids server/client mismatches.
- **Payment ID column placement.** It sits after the reference's columns, so the default view at 1440px matches the reference screenshot. The ID can also be copied from the row's `···` menu and from the details page.
- **Fonts.** Stripe uses the proprietary Söhne font, so this uses the system font stack as the closest freely available match.

## Visual reference

Measured from the provided screenshot, scaled to a 1440px-wide viewport: sidebar width, column offsets (within about 3px), row height, and the spacing of cards, pills and banner.

## Built with AI agents

This project was built with Claude Code, with me making the decisions and reviewing the result. In summary:

- **One main agent** planned the work, built the Payments screen itself (the required part) and did all the verification and integration.
- **Three agents ran in parallel** for the extra Dashboard sections. Each owned its own folders, so their work never overlapped.
- **Two skills** were used: `typescript-advanced-types` for the typed table metadata, filter unions and the section registry, and `web-design-guidelines` for an accessibility and UX audit.
- **Every change was verified** with the type checker, lint and unit tests, plus a real Chrome browser that clicks through the features and takes screenshots to compare against the reference.

[docs/ai-workflow.md](docs/ai-workflow.md) has the full write-up: which agents did what, how they were coordinated, and what I'd recommend for working with AI agents.
