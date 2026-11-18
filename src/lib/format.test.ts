import { describe, expect, it } from "vitest";
import { formatAmount, formatDate, formatRelative, shortenId } from "./format";

describe("formatAmount", () => {
  it("formats minor units with the Dashboard's currency symbols", () => {
    expect(formatAmount(988, "usd")).toBe("$9.88");
    expect(formatAmount(1599, "gbp")).toBe("£15.99");
    expect(formatAmount(18999, "brl")).toBe("R$ 189.99");
    expect(formatAmount(123456, "eur")).toBe("€1,234.56");
  });

  it("treats JPY as a zero-decimal currency", () => {
    expect(formatAmount(1200, "jpy")).toBe("¥1,200");
  });

  it("keeps the sign for negative amounts", () => {
    expect(formatAmount(-500, "usd")).toBe("-$5.00");
  });
});

describe("dates", () => {
  const now = Date.UTC(2026, 10, 18, 20, 0);

  it("omits the year for the current year", () => {
    expect(formatDate(Date.UTC(2026, 7, 16, 17, 3), now)).toBe("Aug 16, 5:03 PM");
    expect(formatDate(Date.UTC(2025, 7, 16, 17, 3), now)).toBe("Aug 16, 2025, 5:03 PM");
  });

  it("formats relative time", () => {
    expect(formatRelative(now - 3 * 3600_000, now)).toBe("3 hours ago");
    expect(formatRelative(now - 24 * 3600_000, now)).toBe("yesterday");
    expect(formatRelative(now - 10_000, now)).toBe("10 seconds ago");
  });
});

describe("shortenId", () => {
  it("keeps the prefix and the tail", () => {
    expect(shortenId("pi_3NxAbCdEfGhIjKlMnOpQrSt")).toBe("pi_3NxAb…QrSt");
    expect(shortenId("pi_short")).toBe("pi_short");
  });
});
