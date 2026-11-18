import type { Currency, PaymentMethod, PaymentStatus } from "@/lib/types";

/** Currencies with no minor unit in Stripe's API. */
const ZERO_DECIMAL: ReadonlySet<Currency> = new Set(["jpy"]);

/** Symbols as the Stripe Dashboard renders them (note the space after R$). */
const CURRENCY_SYMBOL: Record<Currency, string> = {
  usd: "$",
  cad: "$",
  eur: "€",
  gbp: "£",
  brl: "R$ ",
  jpy: "¥",
};

export const minorUnitFactor = (currency: Currency) => (ZERO_DECIMAL.has(currency) ? 1 : 100);

/**
 * Approximate USD value of one major unit, only used to order mixed-currency
 * amounts sensibly when sorting (¥12,000 should not outrank $599).
 */
const USD_RATE: Record<Currency, number> = { usd: 1, cad: 0.72, eur: 1.08, gbp: 1.27, brl: 0.18, jpy: 0.0066 };

export const toMajorUnits = (amount: number, currency: Currency) => amount / minorUnitFactor(currency);
export const toUsdEstimate = (amount: number, currency: Currency) =>
  toMajorUnits(amount, currency) * USD_RATE[currency];

export const toMinorUnits = (major: number, currency: Currency) => Math.round(major * minorUnitFactor(currency));

const numberFormatters = new Map<number, Intl.NumberFormat>();
function numberFormat(digits: number) {
  let f = numberFormatters.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    numberFormatters.set(digits, f);
  }
  return f;
}

/** `988, "usd"` → `$9.88`; `9999, "brl"` → `R$ 99.99`; `1200, "jpy"` → `¥1,200`. */
export function formatAmount(amount: number, currency: Currency): string {
  const digits = ZERO_DECIMAL.has(currency) ? 0 : 2;
  const value = numberFormat(digits).format(toMajorUnits(Math.abs(amount), currency));
  return `${amount < 0 ? "-" : ""}${CURRENCY_SYMBOL[currency]}${value}`;
}

export const formatCurrencyCode = (currency: Currency) => currency.toUpperCase();

const sameYearFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const otherYearFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const fullFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
});

/** `Aug 16, 5:03 PM` (adds the year when it isn't the current one). */
export function formatDate(ts: number, now: number = Date.now()): string {
  const sameYear = new Date(ts).getFullYear() === new Date(now).getFullYear();
  return (sameYear ? sameYearFormat : otherYearFormat).format(ts);
}

export const formatFullDate = (ts: number) => fullFormat.format(ts);

const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** `3 hours ago`, `yesterday`, `2 months ago`. */
export function formatRelative(ts: number, now: number = Date.now()): string {
  const diffSec = Math.round((ts - now) / 1000);
  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diffSec) >= seconds || unit === "second") {
      return rtf.format(Math.round(diffSec / seconds), unit);
    }
  }
  return rtf.format(0, "second");
}

export const STATUS_LABEL: Record<PaymentStatus, string> = {
  succeeded: "Succeeded",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  canceled: "Canceled",
  blocked: "Blocked",
  disputed: "Disputed",
  uncaptured: "Uncaptured",
};

const BRAND_LABEL = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", discover: "Discover" };
const WALLET_LABEL = { apple_pay: "Apple Pay", google_pay: "Google Pay", link: "Link" };

export function describeMethod(method: PaymentMethod): string {
  switch (method.type) {
    case "card":
      return `${BRAND_LABEL[method.brand]} •••• ${method.last4}`;
    case "ach":
      return `${method.bankName} •••• ${method.last4}`;
    case "wallet":
      return `${WALLET_LABEL[method.wallet]} · ${BRAND_LABEL[method.brand]} •••• ${method.last4}`;
  }
}

/** `pi_3NxAbCdEfGhIjKlMnOp` → `pi_3NxAb…MnOp`. */
export function shortenId(id: string, head = 8, tail = 4): string {
  return id.length <= head + tail + 1 ? id : `${id.slice(0, head)}…${id.slice(-tail)}`;
}
