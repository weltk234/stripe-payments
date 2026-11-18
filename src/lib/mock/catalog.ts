import { createRng } from "@/lib/mock/generate";
import { getCustomers } from "@/lib/paymentsService";
import type { Currency } from "@/lib/types";
import { ACCOUNT } from "@/lib/account";

const DAY = 24 * 3600 * 1000;
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

type Rng = ReturnType<typeof createRng>;
const randomId = (rng: Rng, prefix: string, length = 14) =>
  prefix + Array.from({ length }, () => BASE62[rng.int(0, BASE62.length - 1)]).join("");

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export type Interval = "month" | "year";

export interface Product {
  id: string;
  name: string;
  description: string;
  color: string;
  /** Minor units. */
  price: number;
  currency: Currency;
  interval: Interval | null;
  active: boolean;
  created: number;
  updated: number;
}

const PRODUCT_DEFS: Omit<Product, "id" | "created" | "updated">[] = [
  {
    name: "Starter",
    description: "For individuals getting started",
    color: "#7dd3fc",
    price: 988,
    currency: "usd",
    interval: "month",
    active: true,
  },
  {
    name: "Pro",
    description: "Advanced features for growing teams",
    color: "#a78bfa",
    price: 2198,
    currency: "usd",
    interval: "month",
    active: true,
  },
  {
    name: "Business",
    description: "Priority support and SSO",
    color: "#f9a8d4",
    price: 4900,
    currency: "usd",
    interval: "month",
    active: true,
  },
  {
    name: "Team",
    description: "Seats for up to 10 people",
    color: "#86efac",
    price: 14900,
    currency: "usd",
    interval: "month",
    active: true,
  },
  {
    name: "Pro (annual)",
    description: "Pro billed yearly",
    color: "#c4b5fd",
    price: 21900,
    currency: "usd",
    interval: "year",
    active: true,
  },
  {
    name: "Business (annual)",
    description: "Business billed yearly",
    color: "#fbcfe8",
    price: 49000,
    currency: "usd",
    interval: "year",
    active: true,
  },
  {
    name: "Starter UK",
    description: "Starter plan priced in GBP",
    color: "#bae6fd",
    price: 899,
    currency: "gbp",
    interval: "month",
    active: true,
  },
  {
    name: "Starter Brasil",
    description: "Starter plan priced in BRL",
    color: "#fde68a",
    price: 4990,
    currency: "brl",
    interval: "month",
    active: true,
  },
  {
    name: "Onboarding session",
    description: "One-off 1:1 onboarding call",
    color: "#fdba74",
    price: 29900,
    currency: "usd",
    interval: null,
    active: true,
  },
  {
    name: "Legacy Basic",
    description: "Retired plan kept for existing customers",
    color: "#d1d5db",
    price: 499,
    currency: "usd",
    interval: "month",
    active: false,
  },
];

export function getProducts(now: number): Product[] {
  const rng = createRng(1101);
  return PRODUCT_DEFS.map((def) => {
    const created = now - rng.int(120, 700) * DAY;
    return {
      ...def,
      id: randomId(rng, "prod_"),
      created,
      updated: Math.min(now - DAY, created + rng.int(1, 100) * DAY),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Subscriptions & invoices                                            */
/* ------------------------------------------------------------------ */

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";

export interface Subscription {
  id: string;
  customerEmail: string;
  customerName: string;
  status: SubscriptionStatus;
  plan: string;
  amount: number;
  currency: Currency;
  interval: Interval;
  periodStart: number;
  periodEnd: number;
  created: number;
}

export function getSubscriptions(now: number): Subscription[] {
  const rng = createRng(2202);
  const plans = getProducts(now).filter((p) => p.active && p.interval);
  return getCustomers(now)
    .slice(0, 120)
    .map((c) => {
      const plan = rng.pick(plans);
      const interval = plan.interval as Interval;
      const length = interval === "month" ? 30 * DAY : 365 * DAY;
      const periodStart = now - rng.int(1, interval === "month" ? 29 : 300) * DAY;
      return {
        id: randomId(rng, "sub_1"),
        customerEmail: c.email,
        customerName: c.name,
        status: rng.weighted<SubscriptionStatus>({ active: 72, trialing: 9, past_due: 8, canceled: 11 }),
        plan: plan.name,
        amount: plan.price,
        currency: plan.currency,
        interval,
        periodStart,
        periodEnd: periodStart + length,
        created: Math.min(c.firstPaymentAt, periodStart),
      };
    });
}

export type InvoiceStatus = "paid" | "open" | "void" | "uncollectible";

export interface Invoice {
  id: string;
  number: string;
  customerEmail: string;
  amountDue: number;
  currency: Currency;
  status: InvoiceStatus;
  dueDate: number;
  created: number;
}

export function getInvoices(now: number): Invoice[] {
  const rng = createRng(3303);
  const subs = getSubscriptions(now);
  const invoices: Invoice[] = [];
  let cursor = now - rng.int(1, 6) * 3600 * 1000;
  for (let i = 0; i < 160; i++) {
    const sub = rng.pick(subs);
    const created = cursor;
    const status =
      created > now - 10 * DAY
        ? rng.weighted<InvoiceStatus>({ open: 45, paid: 55, void: 0, uncollectible: 0 })
        : rng.weighted<InvoiceStatus>({ paid: 84, open: 4, void: 6, uncollectible: 6 });
    invoices.push({
      id: randomId(rng, "in_1"),
      number: "",
      customerEmail: sub.customerEmail,
      amountDue: sub.amount,
      currency: sub.currency,
      status,
      dueDate: created + 30 * DAY,
      created,
    });
    cursor -= rng.int(2, 18) * 3600 * 1000;
  }
  // Numbers increase with time, newest first in the list.
  invoices.forEach(
    (inv, i) => (inv.number = `${ACCOUNT.invoicePrefix}-${String(invoices.length - i).padStart(4, "0")}`),
  );
  return invoices;
}

/* ------------------------------------------------------------------ */
/* Payment links                                                       */
/* ------------------------------------------------------------------ */

export interface PaymentLink {
  id: string;
  url: string;
  product: string;
  price: number;
  currency: Currency;
  interval: Interval | null;
  active: boolean;
  created: number;
}

export function getPaymentLinks(now: number): PaymentLink[] {
  const rng = createRng(4404);
  const products = getProducts(now);
  return Array.from({ length: 14 }, (_, i) => {
    const product = products[i % products.length];
    return {
      id: randomId(rng, "plink_1"),
      url: `buy.stripe.com/${randomId(rng, "", 14).toLowerCase()}`,
      product: product.name,
      price: product.price,
      currency: product.currency,
      interval: product.interval,
      active: product.active && rng.next() > 0.15,
      created: now - rng.int(2, 200) * DAY - rng.int(0, 86400) * 1000,
    };
  }).sort((a, b) => b.created - a.created);
}

/* ------------------------------------------------------------------ */
/* Connect                                                             */
/* ------------------------------------------------------------------ */

export type ConnectedStatus = "enabled" | "restricted" | "pending";

export interface ConnectedAccount {
  id: string;
  businessName: string;
  country: string;
  flag: string;
  status: ConnectedStatus;
  payoutsEnabled: boolean;
  /** USD cents routed in the last 30 days. */
  volume: number;
  created: number;
}

const BUSINESS_PREFIX = [
  "Blue",
  "Northwind",
  "Juniper",
  "Sol",
  "Atlas",
  "Pixel",
  "Harbor",
  "Maple",
  "Cobalt",
  "Lumen",
  "Orchard",
  "Vela",
];
const BUSINESS_SUFFIX = [
  "Studio",
  "Labs",
  "Coffee",
  "Fitness",
  "Design Co.",
  "Tutoring",
  "Bakery",
  "Analytics",
  "Supply",
  "Media",
];
const COUNTRIES = [
  { country: "United States", flag: "🇺🇸" },
  { country: "Brazil", flag: "🇧🇷" },
  { country: "United Kingdom", flag: "🇬🇧" },
  { country: "Germany", flag: "🇩🇪" },
  { country: "Canada", flag: "🇨🇦" },
  { country: "Japan", flag: "🇯🇵" },
] as const;

export function getConnectedAccounts(now: number): ConnectedAccount[] {
  const rng = createRng(5505);
  return Array.from({ length: 36 }, () => {
    const status = rng.weighted<ConnectedStatus>({ enabled: 70, restricted: 12, pending: 18 });
    const { country, flag } = rng.pick(COUNTRIES);
    return {
      id: randomId(rng, "acct_1", 15),
      businessName: `${rng.pick(BUSINESS_PREFIX)} ${rng.pick(BUSINESS_SUFFIX)}`,
      country,
      flag,
      status,
      payoutsEnabled: status === "enabled",
      volume: status === "pending" ? 0 : rng.int(5_000, 4_500_000),
      created: now - rng.int(1, 400) * DAY - rng.int(0, 86400) * 1000,
    };
  }).sort((a, b) => b.created - a.created);
}

/* ------------------------------------------------------------------ */
/* Tax                                                                 */
/* ------------------------------------------------------------------ */

export interface TaxRegistration {
  id: string;
  jurisdiction: string;
  flag: string;
  type: string;
  status: "active" | "scheduled" | "expired";
  /** USD cents collected in the last 30 days. */
  collected: number;
  activeFrom: number;
}

export function getTaxRegistrations(now: number): TaxRegistration[] {
  const rng = createRng(6606);
  const defs = [
    { jurisdiction: "California, US", flag: "🇺🇸", type: "Sales tax" },
    { jurisdiction: "New York, US", flag: "🇺🇸", type: "Sales tax" },
    { jurisdiction: "Texas, US", flag: "🇺🇸", type: "Sales tax" },
    { jurisdiction: "United Kingdom", flag: "🇬🇧", type: "VAT" },
    { jurisdiction: "European Union (OSS)", flag: "🇪🇺", type: "VAT" },
    { jurisdiction: "Canada", flag: "🇨🇦", type: "GST/HST" },
    { jurisdiction: "Brazil", flag: "🇧🇷", type: "ISS" },
    { jurisdiction: "Japan", flag: "🇯🇵", type: "JCT" },
  ];
  return defs.map((d, i) => {
    const status = i === 7 ? "scheduled" : i === 6 ? "expired" : "active";
    return {
      id: randomId(rng, "taxreg_1"),
      ...d,
      status,
      collected: status === "active" ? rng.int(4_000, 380_000) : 0,
      activeFrom: status === "scheduled" ? now + rng.int(5, 40) * DAY : now - rng.int(60, 600) * DAY,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Issuing                                                             */
/* ------------------------------------------------------------------ */

export interface IssuedCard {
  id: string;
  cardholder: string;
  last4: string;
  type: "virtual" | "physical";
  status: "active" | "inactive" | "canceled";
  /** Monthly spending limit in USD cents. */
  limit: number;
  spent: number;
  created: number;
}

const CARDHOLDERS = [
  "Marketing team",
  "Engineering team",
  "Office supplies",
  "Travel",
  "Cloud infrastructure",
  "Design tools",
  "Customer success",
  "Events",
  "Recruiting",
  "Finance ops",
  "Sales team",
  "Contractors",
];

export function getIssuedCards(now: number): IssuedCard[] {
  const rng = createRng(7707);
  return CARDHOLDERS.map((cardholder) => {
    const limit = rng.pick([50_000, 100_000, 250_000, 500_000, 1_000_000]);
    const status = rng.weighted({ active: 78, inactive: 12, canceled: 10 });
    return {
      id: randomId(rng, "ic_1"),
      cardholder,
      last4: String(rng.int(0, 9999)).padStart(4, "0"),
      type: rng.next() < 0.7 ? "virtual" : "physical",
      status,
      limit,
      spent: status === "active" ? Math.round(limit * rng.next() * 0.95) : 0,
      created: now - rng.int(10, 500) * DAY,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Climate                                                             */
/* ------------------------------------------------------------------ */

export interface ClimateProject {
  name: string;
  pathway: string;
  location: string;
  description: string;
  color: string;
  /** Share of contributions, 0–1. */
  share: number;
}

export const CLIMATE_PROJECTS: ClimateProject[] = [
  {
    name: "Direct air capture",
    pathway: "Direct air capture",
    location: "Iceland",
    description: "Pulls CO₂ from ambient air and stores it permanently in basalt.",
    color: "#0ea5e9",
    share: 0.35,
  },
  {
    name: "Enhanced weathering",
    pathway: "Mineralization",
    location: "Brazil",
    description: "Spreads crushed silicate rock on farmland to lock away carbon.",
    color: "#22c55e",
    share: 0.25,
  },
  {
    name: "Bio-oil sequestration",
    pathway: "Biomass storage",
    location: "United States",
    description: "Converts waste biomass to bio-oil and injects it deep underground.",
    color: "#f59e0b",
    share: 0.22,
  },
  {
    name: "Ocean alkalinity",
    pathway: "Ocean",
    location: "Canada",
    description: "Increases the ocean's natural capacity to store carbon.",
    color: "#6366f1",
    share: 0.18,
  },
];

/* ------------------------------------------------------------------ */
/* Developers                                                          */
/* ------------------------------------------------------------------ */

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: number;
  status: "enabled" | "disabled";
  errorRate: number;
  created: number;
}

export interface ApiRequestLog {
  id: string;
  method: "GET" | "POST" | "DELETE";
  path: string;
  status: number;
  at: number;
}

export function getDeveloperData(now: number) {
  const rng = createRng(8808);
  const keys = {
    publishable: randomId(rng, "pk_test_51", 40),
    secret: randomId(rng, "sk_test_51", 40),
  };
  const webhooks: WebhookEndpoint[] = [
    { url: `https://api.${ACCOUNT.domain}/webhooks/stripe`, events: 12, status: "enabled" as const },
    { url: `https://billing.${ACCOUNT.domain}/stripe/events`, events: 5, status: "enabled" as const },
    { url: `https://staging.${ACCOUNT.domain}/hooks/stripe`, events: 24, status: "disabled" as const },
  ].map((w) => ({
    ...w,
    id: randomId(rng, "we_1"),
    errorRate: w.status === "enabled" ? rng.int(0, 30) / 10 : 0,
    created: now - rng.int(30, 400) * DAY,
  }));

  const endpoints: { method: ApiRequestLog["method"]; path: string }[] = [
    { method: "POST", path: "/v1/payment_intents" },
    { method: "GET", path: "/v1/payment_intents/:id" },
    { method: "POST", path: "/v1/customers" },
    { method: "GET", path: "/v1/customers/:id" },
    { method: "POST", path: "/v1/subscriptions" },
    { method: "POST", path: "/v1/refunds" },
    { method: "GET", path: "/v1/invoices" },
    { method: "DELETE", path: "/v1/subscriptions/:id" },
  ];
  let cursor = now - rng.int(5, 90) * 1000;
  const logs: ApiRequestLog[] = Array.from({ length: 40 }, () => {
    const ep = rng.pick(endpoints);
    const status = Number(rng.weighted({ "200": 86, "400": 6, "402": 5, "404": 2, "500": 1 }));
    const log = {
      id: randomId(rng, "req_"),
      method: ep.method,
      path: ep.path.replace(
        ":id",
        randomId(
          rng,
          ep.path.includes("customers") ? "cus_" : ep.path.includes("subscriptions") ? "sub_1" : "pi_3",
          10,
        ),
      ),
      status,
      at: cursor,
    };
    cursor -= rng.int(10, 900) * 1000;
    return log;
  });
  return { keys, webhooks, logs };
}
