import { describe, expect, it } from "vitest";
import {
  buildPredicate,
  compareBy,
  DEFAULT_QUERY,
  EMPTY_FILTERS,
  matchesSearch,
  parseQuery,
  serializeQuery,
  type PaymentsQuery,
} from "./filters";
import { generatePayments } from "./mock/generate";
import type { Payment } from "./types";
import { toUsdEstimate } from "./format";

const NOW = Date.UTC(2026, 10, 18, 20, 0);
const payments = generatePayments({ now: NOW });

describe("URL round-trip", () => {
  it("parses what it serializes", () => {
    const query: PaymentsQuery = {
      filters: {
        date: { preset: "custom", from: "2026-11-01", to: "2026-11-10" },
        amount: { op: "between", min: 10, max: 50 },
        currency: ["usd", "brl"],
        status: ["succeeded", "failed"],
        method: ["card", "wallet"],
        q: "gmail",
      },
      sort: [
        { key: "amount", desc: false },
        { key: "created", desc: true },
      ],
      page: 3,
      pageSize: 50,
    };
    expect(parseQuery(serializeQuery(query))).toEqual(query);
  });

  it("omits defaults so the base URL stays clean", () => {
    expect(serializeQuery(DEFAULT_QUERY).toString()).toBe("");
  });

  it("ignores invalid values", () => {
    const q = parseQuery(new URLSearchParams("status=succeeded,nope&size=7&page=-2&amount=gt:abc&sort=foo"));
    expect(q.filters.status).toEqual(["succeeded"]);
    expect(q.pageSize).toBe(25);
    expect(q.page).toBe(1);
    expect(q.filters.amount).toBeNull();
    expect(q.sort).toEqual(DEFAULT_QUERY.sort);
  });
});

describe("filtering", () => {
  const run = (patch: Partial<typeof EMPTY_FILTERS>) =>
    payments.filter(buildPredicate({ ...EMPTY_FILTERS, ...patch }, NOW));

  it("filters by multiple statuses", () => {
    const rows = run({ status: ["failed", "refunded"] });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((p) => p.status === "failed" || p.status === "refunded")).toBe(true);
  });

  it("filters by payment method type", () => {
    const rows = run({ method: ["ach"] });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((p) => p.method.type === "ach")).toBe(true);
  });

  it("filters by amount in major units", () => {
    const rows = run({ amount: { op: "gt", value: 100 } });
    expect(rows.every((p) => p.amount / (p.currency === "jpy" ? 1 : 100) > 100)).toBe(true);
  });

  it("filters by date presets", () => {
    const rows = run({ date: { preset: "7d" } });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((p) => p.created >= NOW - 7 * 86400_000)).toBe(true);
    expect(run({ date: { preset: "30d" } }).length).toBeGreaterThan(rows.length);
  });

  it("searches by id, email or last 4", () => {
    const sample = payments[42];
    expect(matchesSearch(sample.id.slice(0, 12), sample)).toBe(true);
    expect(matchesSearch(sample.customer.email.toUpperCase(), sample)).toBe(true);
    expect(matchesSearch(sample.method.last4, sample)).toBe(true);
    expect(run({ q: sample.id })).toEqual([sample]);
  });
});

describe("sorting", () => {
  it("sorts by multiple columns", () => {
    const sorted = [...payments].sort(
      compareBy([
        { key: "status", desc: false },
        { key: "amount", desc: true },
      ]),
    );
    for (let i = 1; i < sorted.length; i++) {
      const [a, b] = [sorted[i - 1], sorted[i]] as [Payment, Payment];
      if (a.status === b.status) {
        expect(toUsdEstimate(a.amount, a.currency)).toBeGreaterThanOrEqual(toUsdEstimate(b.amount, b.currency));
      } else {
        expect(a.status < b.status).toBe(true);
      }
    }
  });
});

describe("mock data", () => {
  it("is deterministic and realistic", () => {
    expect(generatePayments({ now: NOW })).toEqual(payments);
    expect(payments.length).toBeGreaterThanOrEqual(300);
    expect(new Set(payments.map((p) => p.id)).size).toBe(payments.length);
    expect(new Set(payments.map((p) => p.currency)).size).toBeGreaterThan(3);
    expect(new Set(payments.map((p) => p.status)).size).toBe(8);
  });
});
