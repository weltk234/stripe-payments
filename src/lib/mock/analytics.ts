import { toUsdEstimate } from "@/lib/format";
import { createRng } from "@/lib/mock/generate";
import type { Payment, PaymentMethodType } from "@/lib/types";
import { ACCOUNT } from "@/lib/account";

const DAY_MS = 24 * 3600 * 1000;

/** USD cents, using the approximate FX rates in format.ts. */
export const usdCents = (p: Pick<Payment, "amount" | "currency">) =>
  Math.round(toUsdEstimate(p.amount, p.currency) * 100);

export function startOfLocalDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const isCaptured = (p: Payment) => p.status === "succeeded" || p.status === "refunded" || p.status === "disputed";

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

/** Cumulative gross volume (USD cents) per hour for the day starting at `dayStart`. */
export function cumulativeHourly(payments: readonly Payment[], dayStart: number, untilHour = 24): number[] {
  const buckets = new Array<number>(24).fill(0);
  for (const p of payments) {
    if (!isCaptured(p) || p.created < dayStart || p.created >= dayStart + DAY_MS) continue;
    buckets[new Date(p.created).getHours()] += usdCents(p);
  }
  const out: number[] = [];
  let sum = 0;
  for (let h = 0; h < untilHour; h++) out.push((sum += buckets[h]));
  return out;
}

export interface DailyPoint {
  day: number;
  gross: number;
  net: number;
  succeeded: number;
  newCustomers: number;
}

/** One point per local day, oldest first, ending today. */
export function dailySeries(payments: readonly Payment[], now: number, days: number): DailyPoint[] {
  const today = startOfLocalDay(now);
  const first = today - (days - 1) * DAY_MS;
  const points: DailyPoint[] = Array.from({ length: days }, (_, i) => ({
    day: first + i * DAY_MS,
    gross: 0,
    net: 0,
    succeeded: 0,
    newCustomers: 0,
  }));
  const seen = new Set<string>();
  // Oldest first so "new customer" means first payment ever seen.
  for (const p of [...payments].sort((a, b) => a.created - b.created)) {
    const isNew = !seen.has(p.customer.email);
    seen.add(p.customer.email);
    if (p.created < first) continue;
    const idx = Math.floor((startOfLocalDay(p.created) - first) / DAY_MS);
    const point = points[idx];
    if (!point) continue;
    if (isNew) point.newCustomers += 1;
    if (isCaptured(p)) {
      const cents = usdCents(p);
      point.gross += cents;
      point.net += p.status === "refunded" ? -Math.round(cents * 0.029) - 30 : cents - Math.round(cents * 0.029) - 30;
      if (p.status === "succeeded") point.succeeded += 1;
    }
  }
  return points;
}

export const percentChange = (current: number, previous: number) =>
  previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / Math.abs(previous)) * 100;

/* ------------------------------------------------------------------ */
/* Payments analytics                                                  */
/* ------------------------------------------------------------------ */

export interface Breakdown {
  key: string;
  label: string;
  value: number;
  count: number;
}

export function acceptanceRate(payments: readonly Payment[]) {
  const attempted = payments.filter((p) => p.status !== "pending" && p.status !== "canceled");
  const accepted = attempted.filter((p) => isCaptured(p) || p.status === "uncaptured");
  return {
    attempted: attempted.length,
    accepted: accepted.length,
    rate: attempted.length ? accepted.length / attempted.length : 0,
  };
}

export function declineReasons(payments: readonly Payment[]): Breakdown[] {
  const map = new Map<string, number>();
  for (const p of payments) {
    if (p.status === "failed")
      map.set(p.declineReason ?? "Generic decline", (map.get(p.declineReason ?? "Generic decline") ?? 0) + 1);
    if (p.status === "blocked") map.set("Blocked by Radar", (map.get("Blocked by Radar") ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ key: label, label, value: count, count }))
    .sort((a, b) => b.value - a.value);
}

const METHOD_LABEL: Record<PaymentMethodType, string> = { card: "Card", ach: "ACH", wallet: "Wallet" };

export function volumeByMethod(payments: readonly Payment[]): Breakdown[] {
  const map = new Map<PaymentMethodType, { value: number; count: number }>();
  for (const p of payments) {
    if (!isCaptured(p)) continue;
    const e = map.get(p.method.type) ?? { value: 0, count: 0 };
    e.value += usdCents(p);
    e.count += 1;
    map.set(p.method.type, e);
  }
  return [...map.entries()]
    .map(([key, e]) => ({ key, label: METHOD_LABEL[key], ...e }))
    .sort((a, b) => b.value - a.value);
}

export function volumeByCurrency(payments: readonly Payment[]): (Breakdown & { native: number })[] {
  const map = new Map<string, { value: number; count: number; native: number }>();
  for (const p of payments) {
    if (!isCaptured(p)) continue;
    const e = map.get(p.currency) ?? { value: 0, count: 0, native: 0 };
    e.value += usdCents(p);
    e.native += p.amount;
    e.count += 1;
    map.set(p.currency, e);
  }
  return [...map.entries()]
    .map(([key, e]) => ({ key, label: key.toUpperCase(), ...e }))
    .sort((a, b) => b.value - a.value);
}

/* ------------------------------------------------------------------ */
/* Disputes                                                            */
/* ------------------------------------------------------------------ */

export const DISPUTE_STATUSES = ["needs_response", "under_review", "won", "lost"] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

const DISPUTE_REASONS = [
  "Fraudulent",
  "Product not received",
  "Subscription canceled",
  "Duplicate",
  "Unrecognized",
] as const;

export interface Dispute {
  id: string;
  payment: Payment;
  reason: string;
  status: DisputeStatus;
  disputedAt: number;
  evidenceDueBy: number;
}

export function buildDisputes(payments: readonly Payment[]): Dispute[] {
  const rng = createRng(4242);
  return payments
    .filter((p) => p.status === "disputed")
    .map((p) => {
      const disputedAt = p.events.find((e) => e.type === "disputed")?.at ?? p.created + DAY_MS;
      const status = rng.weighted<DisputeStatus>({ needs_response: 4, under_review: 3, won: 2, lost: 1 });
      return {
        id: `dp_1${p.id.slice(4, 18)}`,
        payment: p,
        reason: rng.pick(DISPUTE_REASONS),
        status,
        disputedAt,
        evidenceDueBy: disputedAt + rng.int(7, 21) * DAY_MS,
      };
    })
    .sort((a, b) => b.disputedAt - a.disputedAt);
}

/* ------------------------------------------------------------------ */
/* Radar                                                               */
/* ------------------------------------------------------------------ */

export interface RadarRule {
  id: string;
  action: "Block" | "Review" | "Allow";
  rule: string;
  description: string;
  enabled: boolean;
}

export const RADAR_RULES: RadarRule[] = [
  {
    id: "r1",
    action: "Block",
    rule: "Block if :risk_level: = 'highest'",
    description: "Default Stripe rule",
    enabled: true,
  },
  {
    id: "r2",
    action: "Block",
    rule: "Block if :cvc_check: = 'fail'",
    description: "Default Stripe rule",
    enabled: true,
  },
  {
    id: "r3",
    action: "Block",
    rule: "Block if :address_zip_check: = 'fail'",
    description: "Recommended",
    enabled: false,
  },
  {
    id: "r4",
    action: "Review",
    rule: "Review if :risk_level: = 'elevated'",
    description: "Default Stripe rule",
    enabled: true,
  },
  { id: "r5", action: "Review", rule: "Review if :amount_in_usd: > 500", description: "Custom rule", enabled: true },
  {
    id: "r6",
    action: "Allow",
    rule: `Allow if :email_domain: = '${ACCOUNT.domain}'`,
    description: "Custom rule",
    enabled: false,
  },
];

/* ------------------------------------------------------------------ */
/* Revenue recognition                                                 */
/* ------------------------------------------------------------------ */

export interface MonthlyRevenue {
  month: number;
  label: string;
  billed: number;
  recognized: number;
  deferred: number;
  refunded: number;
}

const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

/** Subscription revenue billed per month, recognized over 30 days (part spills into next month). */
export function monthlyRevenue(payments: readonly Payment[]): MonthlyRevenue[] {
  const map = new Map<number, MonthlyRevenue>();
  const get = (ts: number) => {
    const d = new Date(ts);
    const key = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    let m = map.get(key);
    if (!m) {
      m = { month: key, label: monthLabel.format(key), billed: 0, recognized: 0, deferred: 0, refunded: 0 };
      map.set(key, m);
    }
    return m;
  };
  for (const p of payments) {
    if (!isCaptured(p)) continue;
    const cents = usdCents(p);
    const billedIn = get(p.created);
    billedIn.billed += cents;
    if (p.status === "refunded") billedIn.refunded += cents;
    const d = new Date(p.created);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    const share = Math.min(1, (monthEnd - p.created) / (30 * DAY_MS));
    const thisMonth = Math.round(cents * share);
    billedIn.recognized += thisMonth;
    billedIn.deferred += cents - thisMonth;
    if (cents - thisMonth > 0) get(monthEnd).recognized += cents - thisMonth;
  }
  return [...map.values()].sort((a, b) => a.month - b.month);
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export interface ReportType {
  id: string;
  name: string;
  description: string;
  rows: (payments: readonly Payment[]) => (string | number)[][];
}

const fmtUsd = (cents: number) => (cents / 100).toFixed(2);

export const REPORT_TYPES: ReportType[] = [
  {
    id: "balance_summary",
    name: "Balance summary",
    description: "Starting and ending balance, with activity grouped by type.",
    rows: (ps) => {
      const gross = ps.filter(isCaptured).reduce((s, p) => s + usdCents(p), 0);
      const refunds = ps.filter((p) => p.status === "refunded").reduce((s, p) => s + usdCents(p), 0);
      const fees = Math.round(gross * 0.029) + ps.filter(isCaptured).length * 30;
      return [
        ["category", "amount_usd"],
        ["charges", fmtUsd(gross)],
        ["refunds", fmtUsd(-refunds)],
        ["fees", fmtUsd(-fees)],
        ["net_activity", fmtUsd(gross - refunds - fees)],
      ];
    },
  },
  {
    id: "payout_reconciliation",
    name: "Payout reconciliation",
    description: "Match the transactions included in each payout with your bank deposits.",
    rows: (ps) => {
      const byDay = new Map<string, number>();
      for (const p of ps.filter(isCaptured)) {
        const day = new Date(startOfLocalDay(p.created) + 2 * DAY_MS).toISOString().slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + usdCents(p));
      }
      return [
        ["expected_arrival_date", "gross_usd", "fee_usd", "net_usd"],
        ...[...byDay].map(([d, c]) => [d, fmtUsd(c), fmtUsd(Math.round(c * 0.029)), fmtUsd(c - Math.round(c * 0.029))]),
      ];
    },
  },
  {
    id: "itemized_payments",
    name: "Itemized payments",
    description: "Every payment in the period with status, amount and payment method.",
    rows: (ps) => [
      ["id", "created_utc", "amount", "currency", "status", "customer_email"],
      ...ps.map((p) => [p.id, new Date(p.created).toISOString(), p.amount, p.currency, p.status, p.customer.email]),
    ],
  },
  {
    id: "decline_summary",
    name: "Decline summary",
    description: "Failed and blocked payments grouped by decline reason.",
    rows: (ps) => [["reason", "count"], ...declineReasons(ps).map((d) => [d.label, d.count])],
  },
  {
    id: "volume_by_currency",
    name: "Volume by currency",
    description: "Captured volume in each presentment currency.",
    rows: (ps) => [
      ["currency", "count", "volume_usd_estimate"],
      ...volumeByCurrency(ps).map((c) => [c.label, c.count, fmtUsd(c.value)]),
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Sigma                                                               */
/* ------------------------------------------------------------------ */

export interface SigmaTemplate {
  id: string;
  name: string;
  sql: string;
  run: (payments: readonly Payment[]) => { columns: string[]; rows: (string | number)[][] };
}

export const SIGMA_TEMPLATES: SigmaTemplate[] = [
  {
    id: "volume_by_currency",
    name: "Volume by currency",
    sql: "select\n  currency,\n  count(*) as payments,\n  sum(amount) / 100.0 as volume\nfrom charges\nwhere captured = true\ngroup by 1\norder by 3 desc",
    run: (ps) => ({
      columns: ["currency", "payments", "volume"],
      rows: volumeByCurrency(ps).map((c) => [
        c.key,
        c.count,
        (c.native / (c.key === "jpy" ? 1 : 100)).toFixed(c.key === "jpy" ? 0 : 2),
      ]),
    }),
  },
  {
    id: "status_breakdown",
    name: "Payments by status",
    sql: "select\n  status,\n  count(*) as payments\nfrom payment_intents\ngroup by 1\norder by 2 desc",
    run: (ps) => {
      const map = new Map<string, number>();
      for (const p of ps) map.set(p.status, (map.get(p.status) ?? 0) + 1);
      return { columns: ["status", "payments"], rows: [...map].sort((a, b) => b[1] - a[1]) };
    },
  },
  {
    id: "top_customers",
    name: "Top customers by spend",
    sql: "select\n  customer_email,\n  count(*) as payments,\n  sum(amount_usd) / 100.0 as spend_usd\nfrom charges\nwhere status = 'succeeded'\ngroup by 1\norder by 3 desc\nlimit 10",
    run: (ps) => {
      const map = new Map<string, { n: number; c: number }>();
      for (const p of ps) {
        if (p.status !== "succeeded") continue;
        const e = map.get(p.customer.email) ?? { n: 0, c: 0 };
        e.n += 1;
        e.c += usdCents(p);
        map.set(p.customer.email, e);
      }
      return {
        columns: ["customer_email", "payments", "spend_usd"],
        rows: [...map]
          .sort((a, b) => b[1].c - a[1].c)
          .slice(0, 10)
          .map(([email, e]) => [email, e.n, fmtUsd(e.c)]),
      };
    },
  },
  {
    id: "declines",
    name: "Decline reasons",
    sql: "select\n  outcome_reason,\n  count(*) as declines\nfrom charges\nwhere status = 'failed'\ngroup by 1\norder by 2 desc",
    run: (ps) => ({ columns: ["outcome_reason", "declines"], rows: declineReasons(ps).map((d) => [d.label, d.count]) }),
  },
];
