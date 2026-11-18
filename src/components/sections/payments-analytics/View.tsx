"use client";

import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useHydrated } from "@/hooks/useHydrated";
import { formatAmount } from "@/lib/format";
import { acceptanceRate, declineReasons, volumeByCurrency, volumeByMethod } from "@/lib/mock/analytics";
import { getAllPayments } from "@/lib/paymentsService";
import { Card, HBarList, PAGE_TITLE, Placeholder } from "../home/charts";

const DAY_MS = 24 * 3600 * 1000;
const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
] as const;

const usd = (cents: number) => formatAmount(cents, "usd");
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function PaymentsAnalyticsView() {
  const hydrated = useHydrated();
  const now = useMemo(() => (hydrated ? Date.now() : 0), [hydrated]);
  const [days, setDays] = useState<number>(30);

  const data = useMemo(() => {
    if (!hydrated) return null;
    const payments = getAllPayments(now).filter((p) => p.created >= now - days * DAY_MS);
    const acceptance = acceptanceRate(payments);
    const declines = declineReasons(payments);
    const totalDeclines = declines.reduce((s, d) => s + d.count, 0);
    return {
      acceptance,
      declines,
      totalDeclines,
      methods: volumeByMethod(payments),
      currencies: volumeByCurrency(payments),
      disputes: payments.filter((p) => p.status === "disputed").length,
      count: payments.length,
    };
  }, [hydrated, now, days]);

  return (
    <div className="pb-16">
      <div className="flex items-end justify-between">
        <h1 className={PAGE_TITLE}>Payments analytics</h1>
        <div role="radiogroup" aria-label="Date range" className="flex rounded-md shadow-[var(--shadow-button)]">
          {RANGES.map((r, i) => (
            <button
              key={r.days}
              type="button"
              role="radio"
              aria-checked={days === r.days}
              onClick={() => setDays(r.days)}
              className={cn(
                "h-7 px-2.5 text-[13px] font-medium",
                i === 0 && "rounded-l-md",
                i === RANGES.length - 1 && "rounded-r-md",
                i > 0 && "border-l border-border",
                days === r.days ? "bg-brand-soft text-brand-text" : "text-ink hover:bg-offset",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!data ? (
        <Placeholder />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Acceptance rate",
                value: pct(data.acceptance.rate),
                hint: `${data.acceptance.accepted} of ${data.acceptance.attempted} attempts`,
              },
              { label: "Payments", value: String(data.count), hint: "All statuses" },
              { label: "Declines", value: String(data.totalDeclines), hint: "Failed and blocked" },
              {
                label: "Dispute rate",
                value: pct(data.count ? data.disputes / data.count : 0),
                hint: `${data.disputes} disputes`,
              },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-border p-4">
                <p className="text-[13px] text-subdued">{kpi.label}</p>
                <p className="tabular mt-1 text-[20px] leading-7 font-semibold text-ink-strong">{kpi.value}</p>
                <p className="mt-1 text-[12px] text-subdued">{kpi.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Decline reasons">
              {data.declines.length ? (
                <HBarList
                  items={data.declines.map((d) => ({ ...d, hint: pct(d.count / data.totalDeclines) }))}
                  format={(v) => String(v)}
                />
              ) : (
                <p className="text-[14px] text-subdued">No declines in this period.</p>
              )}
            </Card>
            <Card title="Volume by payment method">
              <HBarList items={data.methods.map((m) => ({ ...m, hint: `${m.count} payments` }))} format={usd} />
            </Card>
            <Card title="Volume by currency" className="lg:col-span-2">
              <HBarList
                items={data.currencies.map((c) => ({ ...c, hint: `${c.count} payments` }))}
                format={(v) => `${usd(v)} USD`}
              />
              <p className="mt-3 text-[12px] text-subdued">Converted to USD with approximate exchange rates.</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
