import { describe, expect, it } from "vitest";
import { escapeCsv, paymentsToCsv } from "./csv";
import { generatePayments } from "./mock/generate";

describe("csv", () => {
  it("escapes quotes, commas and formula prefixes", () => {
    expect(escapeCsv('a "b", c')).toBe('"a ""b"", c"');
    expect(escapeCsv("=HYPERLINK()")).toBe("'=HYPERLINK()");
    expect(escapeCsv(-5)).toBe("-5");
  });

  it("writes a header plus one line per payment", () => {
    const rows = generatePayments({ count: 3, now: Date.UTC(2026, 10, 18) });
    const lines = paymentsToCsv(rows).split("\r\n");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toMatch(/^id,Amount,Currency,Status/);
    expect(lines[1]).toContain(rows[0].id);
  });
});
