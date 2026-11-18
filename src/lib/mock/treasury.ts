import { toUsdEstimate } from "@/lib/format";
import { createRng } from "@/lib/mock/generate";
import { getAllPayments } from "@/lib/paymentsService";
import type { Currency, Payment } from "@/lib/types";

const DAY_MS = 24 * 3600 * 1000;
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

type Rng = ReturnType<typeof createRng>;
const randomId = (rng: Rng, prefix: string, length = 24) =>
  prefix + Array.from({ length }, () => BASE62[Math.floor(rng.next() * BASE62.length)]).join("");

/** Stripe's standard card pricing: 2.9% + 30¢ (minor units). */
export const stripeFee = (amount: number) => Math.round(amount * 0.029) + 30;

/** USD minor units for a payment, using the approximate rates in format.ts. */
const usdMinor = (p: Pick<Payment, "amount" | "currency">) => Math.round(toUsdEstimate(p.amount, p.currency) * 100);

/* ------------------------------------------------------------------ */
/* Payouts                                                             */
/* ------------------------------------------------------------------ */

export type PayoutStatus = "paid" | "in_transit" | "pending" | "failed" | "canceled";

export interface Payout {
  id: string;
  amount: number;
  currency: Currency;
  status: PayoutStatus;
  bankName: string;
  last4: string;
  method: "Standard" | "Instant";
  initiated: number;
  arrival: number;
  description: string;
}

/** Payouts every 2 days, each sweeping the net USD volume settled since the previous one. */
export function getPayouts(now: number = Date.now()): Payout[] {
  const rng = createRng(7301);
  const payments = getAllPayments(now);
  const payouts: Payout[] = [];
  const startOfToday = new Date(now).setHours(9, 0, 0, 0);

  for (let i = 0; i < 45; i++) {
    const initiated = startOfToday - i * 2 * DAY_MS + rng.int(0, 120) * 60_000;
    if (initiated > now) continue;
    const windowStart = initiated - 2 * DAY_MS;
    const net = payments
      .filter(
        (p) => p.status === "succeeded" && p.created >= windowStart - 2 * DAY_MS && p.created < initiated - 2 * DAY_MS,
      )
      .reduce((sum, p) => sum + usdMinor(p) - stripeFee(usdMinor(p)), 0);
    const amount = Math.max(net, rng.int(1500, 9000));
    const instant = rng.next() < 0.1;
    const arrival = initiated + (instant ? 30 * 60_000 : 2 * DAY_MS);
    let status: PayoutStatus = "paid";
    if (arrival > now) status = i === 0 ? "pending" : "in_transit";
    else if (rng.next() < 0.04) status = rng.next() < 0.5 ? "failed" : "canceled";

    payouts.push({
      id: randomId(rng, "po_1"),
      amount,
      currency: "usd",
      status,
      bankName: "STRIPE TEST BANK",
      last4: "6789",
      method: instant ? "Instant" : "Standard",
      initiated,
      arrival,
      description: "STRIPE PAYOUT",
    });
  }
  return payouts;
}

/* ------------------------------------------------------------------ */
/* Top-ups                                                             */
/* ------------------------------------------------------------------ */

export type TopUpStatus = "succeeded" | "pending" | "failed" | "canceled";

export interface TopUp {
  id: string;
  amount: number;
  currency: Currency;
  status: TopUpStatus;
  bankName: string;
  last4: string;
  description: string;
  created: number;
  expectedAvailability: number;
}

const TOP_UP_DESCRIPTIONS = [
  "Top-up for refunds",
  "Top-up for payouts",
  "Balance buffer",
  "Top-up for Connect transfers",
];

export function getTopUps(now: number = Date.now()): TopUp[] {
  const rng = createRng(7302);
  const topUps: TopUp[] = [];
  let cursor = now - rng.int(1, 30) * 3600_000;
  for (let i = 0; i < 18; i++) {
    const created = cursor;
    const expectedAvailability = created + 5 * DAY_MS;
    const status: TopUpStatus =
      expectedAvailability > now ? "pending" : rng.weighted({ succeeded: 88, failed: 7, canceled: 5 });
    topUps.push({
      id: randomId(rng, "tu_1"),
      amount: rng.pick([50000, 100000, 250000, 500000, 1000000, 2500000]),
      currency: "usd",
      status,
      bankName: "STRIPE TEST BANK",
      last4: "6789",
      description: rng.pick(TOP_UP_DESCRIPTIONS),
      created,
      expectedAvailability,
    });
    cursor -= rng.int(2, 9) * DAY_MS + rng.int(0, 600) * 60_000;
  }
  return topUps;
}

/* ------------------------------------------------------------------ */
/* Connected accounts: transfers and collected fees                    */
/* ------------------------------------------------------------------ */

const CONNECTED_ACCOUNTS = [
  "Lumen Studio",
  "Northwind Coffee",
  "Pixel & Pine",
  "Atlas Fitness",
  "Bluebird Tutors",
  "Casa Verde",
  "Orbit Labs",
  "Harbor Yoga",
] as const;

export interface ConnectedAccountRef {
  id: string;
  name: string;
}

function connectedAccounts(): ConnectedAccountRef[] {
  const rng = createRng(7303);
  return CONNECTED_ACCOUNTS.map((name) => ({ id: randomId(rng, "acct_1", 16), name }));
}

export type TransferStatus = "paid" | "pending" | "reversed" | "partially_reversed";

export interface Transfer {
  id: string;
  amount: number;
  currency: Currency;
  status: TransferStatus;
  destination: ConnectedAccountRef;
  description: string;
  created: number;
}

export function getTransfers(now: number = Date.now()): Transfer[] {
  const rng = createRng(7304);
  const accounts = connectedAccounts();
  const transfers: Transfer[] = [];
  let cursor = now - rng.int(10, 240) * 60_000;
  for (let i = 0; i < 90; i++) {
    const created = cursor;
    const status: TransferStatus =
      now - created < 3600_000 ? "pending" : rng.weighted({ paid: 90, reversed: 6, partially_reversed: 4 });
    transfers.push({
      id: randomId(rng, "tr_1"),
      amount: rng.int(8, 900) * 100 + rng.pick([0, 50, 99]),
      currency: "usd",
      status,
      destination: rng.pick(accounts),
      description: rng.pick(["Weekly earnings", "Order payout", "Marketplace sale", "Commission split"]),
      created,
    });
    cursor -= rng.int(2, 40) * 3600_000;
  }
  return transfers;
}

export interface CollectedFee {
  id: string;
  amount: number;
  /** Charge the fee was taken from, in minor units. */
  chargeAmount: number;
  currency: Currency;
  account: ConnectedAccountRef;
  chargeId: string;
  refunded: boolean;
  created: number;
}

export function getCollectedFees(now: number = Date.now()): CollectedFee[] {
  const rng = createRng(7305);
  const accounts = connectedAccounts();
  const fees: CollectedFee[] = [];
  let cursor = now - rng.int(5, 120) * 60_000;
  for (let i = 0; i < 120; i++) {
    const chargeAmount = rng.int(10, 600) * 100 + rng.pick([0, 99, 50]);
    const rate = rng.pick([0.05, 0.08, 0.1, 0.12]);
    fees.push({
      id: randomId(rng, "fee_1"),
      amount: Math.round(chargeAmount * rate),
      chargeAmount,
      currency: "usd",
      account: rng.pick(accounts),
      chargeId: randomId(rng, "py_1"),
      refunded: rng.next() < 0.05,
      created: cursor,
    });
    cursor -= rng.int(1, 24) * 3600_000;
  }
  return fees;
}

/* ------------------------------------------------------------------ */
/* Balance transactions (All activity)                                 */
/* ------------------------------------------------------------------ */

export type BalanceTxnType = "charge" | "refund" | "dispute" | "payout" | "topup" | "transfer";

export interface BalanceTransaction {
  id: string;
  type: BalanceTxnType;
  amount: number;
  fee: number;
  net: number;
  currency: Currency;
  description: string;
  /** Related object, e.g. the payment ID to link to. */
  source: string;
  created: number;
  /** Funds become available after this time. */
  availableOn: number;
}

export function getBalanceTransactions(now: number = Date.now()): BalanceTransaction[] {
  const rng = createRng(7306);
  const txns: BalanceTransaction[] = [];
  const push = (t: Omit<BalanceTransaction, "id" | "net">) =>
    txns.push({ ...t, id: randomId(rng, "txn_1"), net: t.amount - t.fee });

  for (const p of getAllPayments(now)) {
    if (p.status !== "succeeded" && p.status !== "refunded" && p.status !== "disputed") continue;
    push({
      type: "charge",
      amount: p.amount,
      fee: stripeFee(p.amount),
      currency: p.currency,
      description: `Payment from ${p.customer.email}`,
      source: p.id,
      created: p.created,
      availableOn: p.created + 2 * DAY_MS,
    });
    if (p.status === "refunded" && p.refundedAt) {
      push({
        type: "refund",
        amount: -p.amount,
        fee: 0,
        currency: p.currency,
        description: `Refund for ${p.customer.email}`,
        source: p.id,
        created: p.refundedAt,
        availableOn: p.refundedAt,
      });
    }
    if (p.status === "disputed") {
      const at = p.events.find((e) => e.type === "disputed")?.at ?? p.created + DAY_MS;
      if (at <= now) {
        push({
          type: "dispute",
          amount: -p.amount,
          fee: 1500,
          currency: p.currency,
          description: "Chargeback withdrawal",
          source: p.id,
          created: at,
          availableOn: at,
        });
      }
    }
  }
  for (const po of getPayouts(now)) {
    if (po.status === "failed" || po.status === "canceled") continue;
    push({
      type: "payout",
      amount: -po.amount,
      fee: po.method === "Instant" ? Math.round(po.amount * 0.01) : 0,
      currency: po.currency,
      description: `${po.method} payout to ${po.bankName} •••• ${po.last4}`,
      source: po.id,
      created: po.initiated,
      availableOn: po.initiated,
    });
  }
  for (const tu of getTopUps(now)) {
    if (tu.status !== "succeeded") continue;
    push({
      type: "topup",
      amount: tu.amount,
      fee: 0,
      currency: tu.currency,
      description: tu.description,
      source: tu.id,
      created: tu.created,
      availableOn: tu.expectedAvailability,
    });
  }
  for (const tr of getTransfers(now)) {
    if (tr.status === "reversed") continue;
    push({
      type: "transfer",
      amount: -tr.amount,
      fee: 0,
      currency: tr.currency,
      description: `Transfer to ${tr.destination.name}`,
      source: tr.id,
      created: tr.created,
      availableOn: tr.created,
    });
  }
  return txns.sort((a, b) => b.created - a.created);
}

/* ------------------------------------------------------------------ */
/* Balance summary                                                     */
/* ------------------------------------------------------------------ */

export interface BalanceSummary {
  /** USD minor units. */
  available: number;
  pending: number;
  inTransitToBank: number;
  /** Net volume per day for the last 30 days, oldest first (USD minor units). */
  daily: { day: number; net: number }[];
}

export function getBalanceSummary(now: number = Date.now()): BalanceSummary {
  const txns = getBalanceTransactions(now);
  const toUsd = (t: BalanceTransaction) => Math.round(toUsdEstimate(t.net, t.currency) * 100);
  const lastPayout = txns.find((t) => t.type === "payout");
  const since = lastPayout?.created ?? now - 2 * DAY_MS;

  let available = 0;
  let pending = 0;
  // Sales activity only: pending until it settles, then available until the next payout sweeps it.
  for (const t of txns) {
    if (t.type !== "charge" && t.type !== "refund" && t.type !== "dispute") continue;
    if (t.availableOn > now) pending += toUsd(t);
    else if (t.availableOn > since) available += toUsd(t);
  }

  const inTransitToBank = getPayouts(now)
    .filter((p) => p.status === "in_transit" || p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const daily = Array.from({ length: 30 }, (_, i) => ({ day: startOfToday - (29 - i) * DAY_MS, net: 0 }));
  for (const t of txns) {
    if (t.type !== "charge" && t.type !== "refund" && t.type !== "dispute") continue;
    const idx = Math.floor((t.created - daily[0].day) / DAY_MS);
    if (idx >= 0 && idx < 30) daily[idx].net += toUsd(t);
  }

  return { available: Math.max(available, 0), pending: Math.max(pending, 0), inTransitToBank, daily };
}
