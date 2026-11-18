import { toMajorUnits, toUsdEstimate } from "@/lib/format";
import {
  CURRENCIES,
  PAYMENT_METHOD_TYPES,
  PAYMENT_STATUSES,
  type Currency,
  type Payment,
  type PaymentMethodType,
  type PaymentStatus,
} from "@/lib/types";

export const DATE_PRESETS = ["today", "7d", "30d", "custom"] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export type DateFilter =
  | { preset: Exclude<DatePreset, "custom"> }
  /** Inclusive local calendar dates, `YYYY-MM-DD`. Either side may be open. */
  | { preset: "custom"; from: string | null; to: string | null };

export const AMOUNT_OPS = ["eq", "between", "gt", "lt"] as const;
export type AmountOp = (typeof AMOUNT_OPS)[number];

/** Amount filters are expressed in major units (e.g. dollars) and apply across currencies. */
export type AmountFilter =
  | { op: "between"; min: number; max: number }
  | { op: Exclude<AmountOp, "between">; value: number };

export interface PaymentFilters {
  date: DateFilter | null;
  amount: AmountFilter | null;
  currency: Currency[];
  status: PaymentStatus[];
  method: PaymentMethodType[];
  q: string;
}

export const SORTABLE_KEYS = ["created", "amount", "status"] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export interface SortSpec {
  key: SortKey;
  desc: boolean;
}

export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface PaymentsQuery {
  filters: PaymentFilters;
  sort: SortSpec[];
  page: number;
  pageSize: PageSize;
}

export const EMPTY_FILTERS: PaymentFilters = {
  date: null,
  amount: null,
  currency: [],
  status: [],
  method: [],
  q: "",
};

export const DEFAULT_SORT: SortSpec[] = [{ key: "created", desc: true }];

export const DEFAULT_QUERY: PaymentsQuery = {
  filters: EMPTY_FILTERS,
  sort: DEFAULT_SORT,
  page: 1,
  pageSize: 25,
};

/* ------------------------------------------------------------------ */
/* Predicates                                                          */
/* ------------------------------------------------------------------ */

const DAY_MS = 24 * 3600 * 1000;

function startOfLocalDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function parseLocalDate(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
}

/** Resolves a date filter into an inclusive-from / exclusive-to epoch range. */
export function resolveDateRange(filter: DateFilter, now: number): { from: number; to: number } {
  switch (filter.preset) {
    case "today":
      return { from: startOfLocalDay(now), to: Infinity };
    case "7d":
      return { from: now - 7 * DAY_MS, to: Infinity };
    case "30d":
      return { from: now - 30 * DAY_MS, to: Infinity };
    case "custom": {
      const from = filter.from ? parseLocalDate(filter.from) : null;
      const to = filter.to ? parseLocalDate(filter.to) : null;
      return { from: from ?? -Infinity, to: to === null ? Infinity : to + DAY_MS };
    }
  }
}

export function matchesAmount(filter: AmountFilter, payment: Pick<Payment, "amount" | "currency">) {
  const major = toMajorUnits(payment.amount, payment.currency);
  switch (filter.op) {
    case "between":
      return major >= filter.min && major <= filter.max;
    case "eq":
      return Math.abs(major - filter.value) < 0.005;
    case "gt":
      return major > filter.value;
    case "lt":
      return major < filter.value;
  }
}

/** Text search across payment ID, customer email and card last 4. */
export function matchesSearch(q: string, payment: Payment) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (/^\d{1,4}$/.test(needle)) return payment.method.last4.includes(needle);
  return payment.id.toLowerCase().includes(needle) || payment.customer.email.toLowerCase().includes(needle);
}

export function buildPredicate(
  filters: PaymentFilters,
  now: number,
  options: { ignore?: (keyof PaymentFilters)[] } = {},
): (p: Payment) => boolean {
  const ignore = new Set(options.ignore);
  const range = filters.date && !ignore.has("date") ? resolveDateRange(filters.date, now) : null;
  const statuses = ignore.has("status") ? null : new Set(filters.status);
  const currencies = new Set(filters.currency);
  const methods = new Set(filters.method);

  return (p) =>
    (!range || (p.created >= range.from && p.created < range.to)) &&
    (!filters.amount || ignore.has("amount") || matchesAmount(filters.amount, p)) &&
    (!statuses || statuses.size === 0 || statuses.has(p.status)) &&
    (currencies.size === 0 || currencies.has(p.currency)) &&
    (methods.size === 0 || methods.has(p.method.type)) &&
    (ignore.has("q") || matchesSearch(filters.q, p));
}

/* ------------------------------------------------------------------ */
/* Sorting                                                             */
/* ------------------------------------------------------------------ */

const STATUS_ORDER: Record<PaymentStatus, number> = Object.fromEntries(
  [...PAYMENT_STATUSES].sort().map((s, i) => [s, i]),
) as Record<PaymentStatus, number>;

const SORT_ACCESSORS: Record<SortKey, (p: Payment) => number> = {
  created: (p) => p.created,
  amount: (p) => toUsdEstimate(p.amount, p.currency),
  status: (p) => STATUS_ORDER[p.status],
};

export function compareBy(sort: readonly SortSpec[]) {
  return (a: Payment, b: Payment) => {
    for (const { key, desc } of sort) {
      const diff = SORT_ACCESSORS[key](a) - SORT_ACCESSORS[key](b);
      if (diff !== 0) return desc ? -diff : diff;
    }
    return b.created - a.created;
  };
}

/* ------------------------------------------------------------------ */
/* URL (de)serialization                                               */
/* ------------------------------------------------------------------ */

type ParamsLike = { get(name: string): string | null };

const isOneOf =
  <T extends string>(values: readonly T[]) =>
  (v: string): v is T =>
    (values as readonly string[]).includes(v);

function parseList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").filter(isOneOf(allowed)))];
}

const toNumber = (v: string | undefined) => {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function parseDate(params: ParamsLike): DateFilter | null {
  const preset = params.get("date");
  if (!preset || !isOneOf(DATE_PRESETS)(preset)) return null;
  if (preset !== "custom") return { preset };
  const from = params.get("from");
  const to = params.get("to");
  const valid = (v: string | null) => (v && parseLocalDate(v) !== null ? v : null);
  if (!valid(from) && !valid(to)) return null;
  return { preset, from: valid(from), to: valid(to) };
}

/** `between:10-50`, `gt:100`, `eq:9.99`, `lt:5`. */
function parseAmount(raw: string | null): AmountFilter | null {
  if (!raw) return null;
  const [op, value = ""] = raw.split(":");
  if (op === "between") {
    const [min, max] = value.split("-").map(toNumber);
    return min !== null && min !== undefined && max !== null && max !== undefined
      ? { op, min: Math.min(min, max), max: Math.max(min, max) }
      : null;
  }
  if (op === "eq" || op === "gt" || op === "lt") {
    const n = toNumber(value);
    return n === null ? null : { op, value: n };
  }
  return null;
}

export function serializeAmount(filter: AmountFilter): string {
  return filter.op === "between" ? `between:${filter.min}-${filter.max}` : `${filter.op}:${filter.value}`;
}

function parseSort(raw: string | null): SortSpec[] {
  if (!raw) return DEFAULT_SORT;
  const specs: SortSpec[] = [];
  for (const token of raw.split(",")) {
    const desc = token.startsWith("-");
    const key = desc ? token.slice(1) : token;
    if (isOneOf(SORTABLE_KEYS)(key) && !specs.some((s) => s.key === key)) specs.push({ key, desc });
  }
  return specs.length ? specs : DEFAULT_SORT;
}

const serializeSort = (sort: SortSpec[]) => sort.map((s) => `${s.desc ? "-" : ""}${s.key}`).join(",");

export function parseQuery(params: ParamsLike): PaymentsQuery {
  const size = Number(params.get("size"));
  const page = Math.floor(Number(params.get("page")));
  return {
    filters: {
      date: parseDate(params),
      amount: parseAmount(params.get("amount")),
      currency: parseList(params.get("currency"), CURRENCIES),
      status: parseList(params.get("status"), PAYMENT_STATUSES),
      method: parseList(params.get("method"), PAYMENT_METHOD_TYPES),
      q: params.get("q") ?? "",
    },
    sort: parseSort(params.get("sort")),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: (PAGE_SIZES as readonly number[]).includes(size) ? (size as PageSize) : 25,
  };
}

/** Inverse of {@link parseQuery}; omits defaults so URLs stay short. */
export function serializeQuery(query: PaymentsQuery): URLSearchParams {
  const params = new URLSearchParams();
  const { filters } = query;
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.status.length) params.set("status", filters.status.join(","));
  if (filters.method.length) params.set("method", filters.method.join(","));
  if (filters.currency.length) params.set("currency", filters.currency.join(","));
  if (filters.amount) params.set("amount", serializeAmount(filters.amount));
  if (filters.date) {
    params.set("date", filters.date.preset);
    if (filters.date.preset === "custom") {
      if (filters.date.from) params.set("from", filters.date.from);
      if (filters.date.to) params.set("to", filters.date.to);
    }
  }
  const sort = serializeSort(query.sort);
  if (sort !== serializeSort(DEFAULT_SORT)) params.set("sort", sort);
  if (query.pageSize !== 25) params.set("size", String(query.pageSize));
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export const hasActiveFilters = (f: PaymentFilters) =>
  Boolean(f.date || f.amount || f.currency.length || f.status.length || f.method.length || f.q.trim());
