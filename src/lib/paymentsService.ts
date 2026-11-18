import { buildPredicate, compareBy, type PaymentsQuery } from "@/lib/filters";
import { toUsdEstimate } from "@/lib/format";
import { generatePayments } from "@/lib/mock/generate";
import type { Payment, PaymentStatus } from "@/lib/types";

const HOUR_MS = 3600 * 1000;

let cache: { anchor: number; payments: Payment[]; byId: Map<string, Payment> } | null = null;

/**
 * In-memory "API". Data is generated once per hour bucket from a fixed seed,
 * so IDs are stable across reloads while dates stay recent.
 */
export function getAllPayments(now: number = Date.now()): Payment[] {
  const anchor = Math.floor(now / HOUR_MS) * HOUR_MS + HOUR_MS;
  if (!cache || cache.anchor !== anchor) {
    const payments = generatePayments({ now: Math.min(anchor, now) });
    cache = { anchor, payments, byId: new Map(payments.map((p) => [p.id, p])) };
  }
  return cache.payments;
}

export function getPayment(id: string, now: number = Date.now()): Payment | undefined {
  getAllPayments(now);
  return cache?.byId.get(id);
}

export interface PaymentsResult {
  rows: Payment[];
  /** Every row matching the filters (sorted), used for CSV export. */
  matching: Payment[];
  total: number;
  pageCount: number;
  page: number;
  /** Counts per status with every filter applied except status (for the status cards). */
  statusCounts: Record<PaymentStatus | "all", number>;
}

export function queryPayments(query: PaymentsQuery, now: number = Date.now()): PaymentsResult {
  const all = getAllPayments(now);
  const matching = all.filter(buildPredicate(query.filters, now)).sort(compareBy(query.sort));

  const withoutStatus = all.filter(buildPredicate(query.filters, now, { ignore: ["status"] }));
  const statusCounts = { all: withoutStatus.length } as PaymentsResult["statusCounts"];
  for (const p of withoutStatus) statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;

  const pageCount = Math.max(1, Math.ceil(matching.length / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * query.pageSize;

  return {
    rows: matching.slice(start, start + query.pageSize),
    matching,
    total: matching.length,
    pageCount,
    page,
    statusCounts,
  };
}

export interface CustomerSummary {
  email: string;
  name: string;
  /** Method used on the most recent payment. */
  defaultMethod: Payment["method"];
  firstPaymentAt: number;
  lastPaymentAt: number;
  paymentCount: number;
  /** Succeeded volume, normalized to USD cents with approximate rates. */
  totalSpendUsd: number;
  refundCount: number;
}

/** Customers derived from payments, newest activity first. */
export function getCustomers(now: number = Date.now()): CustomerSummary[] {
  const byEmail = new Map<string, CustomerSummary>();
  // Payments are newest-first, so the first one seen per customer is the latest.
  for (const p of getAllPayments(now)) {
    let c = byEmail.get(p.customer.email);
    if (!c) {
      c = {
        email: p.customer.email,
        name: p.customer.name,
        defaultMethod: p.method,
        firstPaymentAt: p.created,
        lastPaymentAt: p.created,
        paymentCount: 0,
        totalSpendUsd: 0,
        refundCount: 0,
      };
      byEmail.set(p.customer.email, c);
    }
    c.paymentCount += 1;
    c.firstPaymentAt = Math.min(c.firstPaymentAt, p.created);
    if (p.status === "succeeded") c.totalSpendUsd += Math.round(toUsdEstimate(p.amount, p.currency) * 100);
    if (p.status === "refunded") c.refundCount += 1;
  }
  return [...byEmail.values()];
}
