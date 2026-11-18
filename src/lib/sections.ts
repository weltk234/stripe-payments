/** Dashboard sections outside Payments and Customers; each has a page in `components/sections`. */
export interface SectionDef {
  title: string;
}

export const TRANSACTION_TABS = [
  { label: "Payments", href: "/payments" },
  { label: "Payouts", href: "/payouts" },
  { label: "Top-ups", href: "/top-ups" },
  { label: "Collected fees", href: "/collected-fees" },
  { label: "Transfers", href: "/transfers" },
  { label: "All activity", href: "/all-activity" },
] as const;

export const SECTIONS = {
  home: {
    title: "Home",
  },
  balances: {
    title: "Balances",
  },
  "product-catalog": {
    title: "Product catalog",
  },
  payouts: {
    title: "Payouts",
  },
  "top-ups": {
    title: "Top-ups",
  },
  "collected-fees": {
    title: "Collected fees",
  },
  transfers: {
    title: "Transfers",
  },
  "all-activity": {
    title: "All activity",
  },
  "payments-analytics": {
    title: "Payments analytics",
  },
  reports: {
    title: "Reports",
  },
  sigma: {
    title: "Sigma",
  },
  radar: {
    title: "Radar",
  },
  connect: {
    title: "Connect",
  },
  "connected-accounts": {
    title: "Connected accounts",
  },
  disputes: {
    title: "Disputes",
  },
  "payment-links": {
    title: "Payment links",
  },
  subscriptions: {
    title: "Subscriptions",
  },
  invoices: {
    title: "Invoices",
  },
  "revenue-recognition": {
    title: "Revenue recognition",
  },
  tax: {
    title: "Tax",
  },
  issuing: {
    title: "Issuing",
  },
  climate: {
    title: "Climate",
  },
  developers: {
    title: "Developers",
  },
} satisfies Record<string, SectionDef>;

export type SectionSlug = keyof typeof SECTIONS;

export const isSectionSlug = (slug: string): slug is SectionSlug => Object.hasOwn(SECTIONS, slug);

/** Paths that keep "Transactions" highlighted in the sidebar. */
export const TRANSACTIONS_PATHS = TRANSACTION_TABS.map((t) => t.href);
