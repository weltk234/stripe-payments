import type { CardBrand, Currency, Payment, PaymentEvent, PaymentMethod, PaymentStatus } from "@/lib/types";

/** mulberry32: tiny deterministic PRNG so server and client generate identical data. */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)];
  const weighted = <T extends string>(weights: Readonly<Record<T, number>>): T => {
    const entries = Object.entries(weights) as [T, number][];
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = next() * total;
    for (const [key, w] of entries) {
      roll -= w;
      if (roll <= 0) return key;
    }
    return entries[entries.length - 1][0];
  };
  return { next, int, pick, weighted };
}

type Rng = ReturnType<typeof createRng>;

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const randomId = (rng: Rng, prefix: string, length = 24) =>
  prefix + Array.from({ length }, () => rng.pick(BASE62.split(""))).join("");

const STATUS_WEIGHTS: Record<PaymentStatus, number> = {
  succeeded: 56,
  failed: 18,
  canceled: 6,
  refunded: 7,
  pending: 5,
  blocked: 3,
  disputed: 2,
  uncaptured: 3,
};

const CURRENCY_WEIGHTS: Record<Currency, number> = {
  usd: 70,
  gbp: 8,
  brl: 8,
  eur: 7,
  cad: 4,
  jpy: 3,
};

/** Realistic subscription-style price points, in minor units. */
const PRICE_POINTS: Record<Currency, readonly number[]> = {
  usd: [988, 2198, 1999, 1199, 1098, 899, 1318, 407, 2093, 1538, 4900, 9900, 2900, 14900, 59900],
  gbp: [1599, 3499, 899, 1299, 2499, 7900],
  brl: [9999, 18999, 4990, 2990, 29900, 79900],
  eur: [999, 1499, 2999, 4900, 12900],
  cad: [1299, 2499, 3999, 9900],
  jpy: [980, 1200, 2980, 4800, 12000],
};

const FIRST_NAMES = [
  "juan",
  "maria",
  "santiago",
  "samantha",
  "isadora",
  "ashley",
  "sophia",
  "adrian",
  "jaeneen",
  "frank",
  "tesheika",
  "castilho",
  "jemma",
  "grant",
  "robyn",
  "shuntae",
  "sebastian",
  "mitzi",
  "braylen",
  "yuphavann",
  "lucas",
  "olivia",
  "noah",
  "emma",
  "liam",
  "ava",
  "mateo",
  "chloe",
  "ethan",
  "camila",
  "daniel",
  "laura",
  "kenji",
  "amelie",
  "rafael",
  "nina",
] as const;
const LAST_NAMES = [
  "rohling",
  "birley",
  "marlea",
  "griffin",
  "bermudez",
  "pineda",
  "white",
  "smith",
  "garcia",
  "nguyen",
  "silva",
  "costa",
  "johnson",
  "brown",
  "martin",
  "tanaka",
  "dubois",
  "oliveira",
  "walker",
  "rossi",
  "moreau",
  "kim",
  "lopez",
  "fernandes",
] as const;
const EMAIL_DOMAINS = [
  "gmail.com",
  "gmail.com",
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "hotmail.co.uk",
  "uol.com.br",
  "proton.me",
] as const;

const DECLINE_REASONS = [
  "Transaction not allowed",
  "Do not honor",
  "Insufficient funds",
  "Generic decline",
  "Expired card",
  "Incorrect CVC",
] as const;

const BANKS = ["STRIPE TEST BANK", "Chase", "Wells Fargo", "Bank of America"] as const;
const PLANS = ["Starter", "Pro", "Business", "Team"] as const;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function makeCustomer(rng: Rng) {
  const first = rng.pick(FIRST_NAMES);
  const last = rng.pick(LAST_NAMES);
  const style = rng.int(0, 3);
  const local =
    style === 0
      ? `${first}.${last}`
      : style === 1
        ? `${first}${last}${rng.int(1, 99)}`
        : style === 2
          ? `${first[0]}${last}`
          : `${first}${rng.int(100, 9999)}`;
  return {
    name: `${capitalize(first)} ${capitalize(last)}`,
    email: `${local}@${rng.pick(EMAIL_DOMAINS)}`,
  };
}

function makeMethod(rng: Rng): PaymentMethod {
  const last4 = String(rng.int(0, 9999)).padStart(4, "0");
  const brand = rng.weighted<CardBrand>({ visa: 70, mastercard: 18, amex: 7, discover: 5 });
  const kind = rng.weighted({ card: 66, link: 14, apple_pay: 8, google_pay: 3, ach: 9 });
  if (kind === "card") return { type: "card", brand, last4 };
  if (kind === "ach") return { type: "ach", bankName: rng.pick(BANKS), last4 };
  return { type: "wallet", wallet: kind, brand, last4 };
}

function makeEvents(
  rng: Rng,
  id: string,
  status: PaymentStatus,
  created: number,
  refundedAt: number | null,
  declineReason: string | null,
): PaymentEvent[] {
  let seq = 0;
  const ev = (type: PaymentEvent["type"], at: number, description: string): PaymentEvent => ({
    id: `${id}_evt_${seq++}`,
    type,
    at,
    description,
  });
  const events: PaymentEvent[] = [ev("created", created, "Payment started")];
  const later = (s: number) => created + s * 1000;

  switch (status) {
    case "succeeded":
      events.push(ev("authorized", later(1), "Payment authorized"));
      events.push(ev("succeeded", later(2), "Payment succeeded"));
      break;
    case "refunded":
      events.push(ev("authorized", later(1), "Payment authorized"));
      events.push(ev("succeeded", later(2), "Payment succeeded"));
      events.push(ev("refunded", refundedAt ?? later(3600), "Payment refunded"));
      break;
    case "disputed":
      events.push(ev("succeeded", later(2), "Payment succeeded"));
      events.push(ev("disputed", later(rng.int(86400, 86400 * 5)), "Payment disputed by the cardholder"));
      break;
    case "failed":
      events.push(ev("failed", later(1), `Payment failed: ${declineReason ?? "Generic decline"}`));
      break;
    case "blocked":
      events.push(ev("blocked", later(1), "Payment blocked by Radar for high risk"));
      break;
    case "canceled":
      events.push(ev("canceled", later(rng.int(60, 3600)), "Payment canceled"));
      break;
    case "uncaptured":
      events.push(ev("authorized", later(1), "Payment authorized, awaiting capture"));
      break;
    case "pending":
      events.push(ev("pending", later(1), "Payment pending"));
      break;
  }
  return events.sort((a, b) => b.at - a.at);
}

export interface GenerateOptions {
  count?: number;
  seed?: number;
  /** Anchor time; the newest payment is created just before this. */
  now?: number;
}

export function generatePayments({ count = 640, seed = 20261120, now = Date.now() }: GenerateOptions = {}): Payment[] {
  const rng = createRng(seed);
  const payments: Payment[] = [];
  // Start a few minutes before `now` and walk back in time with random gaps (~3.4h mean),
  // which spreads ~640 rows over roughly 90 days.
  let cursor = now - rng.int(2, 20) * 60_000;

  for (let i = 0; i < count; i++) {
    const status = rng.weighted(STATUS_WEIGHTS);
    const currency = rng.weighted(CURRENCY_WEIGHTS);
    const amount = rng.pick(PRICE_POINTS[currency]);
    const created = cursor;
    const id = randomId(rng, "pi_3");
    const declineReason = status === "failed" ? rng.pick(DECLINE_REASONS) : null;
    const refundedAt = status === "refunded" ? Math.min(now - 60_000, created + rng.int(3600, 86400 * 7) * 1000) : null;
    const customer = makeCustomer(rng);

    payments.push({
      id,
      amount,
      currency,
      status,
      method: makeMethod(rng),
      description: rng.next() < 0.9 ? "Subscription update" : "Subscription creation",
      customer,
      created,
      refundedAt,
      declineReason,
      riskScore: status === "blocked" ? rng.int(76, 99) : rng.int(2, 64),
      metadata: {
        plan: rng.pick(PLANS),
        subscription_id: randomId(rng, "sub_1", 14),
        customer_id: randomId(rng, "cus_", 14),
        order_ref: `ORD-${rng.int(100000, 999999)}`,
      },
      events: makeEvents(rng, id, status, created, refundedAt, declineReason),
    });

    cursor -= Math.round(-Math.log(1 - rng.next()) * 205 * 60_000) + 30_000;
  }
  return payments;
}
