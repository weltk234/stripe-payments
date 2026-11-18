"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StatusBadge } from "@/components/payments/cells/StatusBadge";
import { useHydrated } from "@/hooks/useHydrated";
import { formatAmount, formatCurrencyCode, formatDate } from "@/lib/format";
import { cumulativeHourly, dailySeries, percentChange, startOfLocalDay } from "@/lib/mock/analytics";
import { getAllPayments } from "@/lib/paymentsService";
import { Card, Change, LineChart, PAGE_TITLE, Placeholder, Sparkline } from "./charts";

const DAY_MS = 24 * 3600 * 1000;
const usd = (cents: number) => formatAmount(cents, "usd");
const int = new Intl.NumberFormat("en-US");

export function HomeView() {
  const hydrated = useHydrated();
  const now = useMemo(() => (hydrated ? Date.now() : 0), [hydrated]);
  const data = useMemo(() => {
    if (!hydrated) return null;
    const payments = getAllPayments(now);
    const today = startOfLocalDay(now);
    const hourNow = new Date(now).getHours() + 1;
    const todayCum = cumulativeHourly(payments, today, hourNow);
    const yesterdayCum = cumulativeHourly(payments, today - DAY_MS);
    const daily = dailySeries(payments, now, 14);
    const last7 = daily.slice(7);
    const prev7 = daily.slice(0, 7);
    const sum = (arr: typeof daily, k: "gross" | "net" | "succeeded" | "newCustomers") =>
      arr.reduce((s, d) => s + d[k], 0);
    const failed = payments.filter((p) => p.status === "failed" || p.status === "blocked").slice(0, 6);
    return { todayCum, yesterdayCum, last7, prev7, sum, failed, yesterdaySameTime: yesterdayCum[hourNow - 1] ?? 0 };
  }, [hydrated, now]);

  return (
    <div className="pb-16">
      <h1 className={PAGE_TITLE}>Home</h1>
      {!data ? (
        <Placeholder />
      ) : (
        <>
          <section className="mt-6 border-b border-border pb-6">
            <h2 className="text-[16px] leading-6 font-bold text-ink-strong">Today</h2>
            <div className="mt-3 flex gap-10">
              <div>
                <p className="text-[13px] text-subdued">Gross volume</p>
                <p className="tabular text-[20px] leading-7 font-semibold text-ink-strong">
                  {usd(data.todayCum.at(-1) ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-subdued">Yesterday</p>
                <p className="tabular text-[20px] leading-7 text-subdued">{usd(data.yesterdaySameTime)}</p>
              </div>
            </div>
            <div className="mt-4">
              <LineChart
                series={[data.todayCum, data.yesterdayCum]}
                points={24}
                ariaLabel="Gross volume today compared with yesterday"
              />
              <div className="mt-1 flex justify-between text-[12px] text-subdued">
                <span>12:00 AM</span>
                <span>
                  <span className="mr-3 inline-flex items-center gap-1">
                    <i className="inline-block h-0.5 w-3 bg-brand" /> Today
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <i className="inline-block h-0.5 w-3 bg-faint" /> Yesterday
                  </span>
                </span>
                <span>11:59 PM</span>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] leading-6 font-bold text-ink-strong">Your overview</h2>
              <span className="text-[13px] text-subdued">Last 7 days · compared to previous 7 days</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {(
                [
                  { key: "gross", label: "Gross volume", format: usd },
                  { key: "net", label: "Net volume", format: usd },
                  { key: "newCustomers", label: "New customers", format: (v: number) => int.format(v) },
                  { key: "succeeded", label: "Successful payments", format: (v: number) => int.format(v) },
                ] as const
              ).map(({ key, label, format }) => {
                const current = data.sum(data.last7, key);
                const previous = data.sum(data.prev7, key);
                return (
                  <div key={key} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-subdued">{label}</p>
                      <Change value={percentChange(current, previous)} />
                    </div>
                    <p className="tabular mt-1 text-[20px] leading-7 font-semibold text-ink-strong">
                      {format(current)}
                    </p>
                    <Sparkline values={data.last7.map((d) => d[key])} className="mt-2" />
                    <p className="mt-1 text-[12px] text-subdued">{format(previous)} previous period</p>
                  </div>
                );
              })}
            </div>
          </section>

          <Card
            title="Recent failed payments"
            className="mt-6"
            action={
              <Link
                href="/payments?status=failed,blocked"
                className="text-[13px] font-medium text-brand-text hover:text-brand-hover"
              >
                View all
              </Link>
            }
          >
            <ul className="-mx-2">
              {data.failed.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/payments/${p.id}`}
                    className="flex h-9 items-center gap-3 rounded-md px-2 text-[14px] hover:bg-offset"
                  >
                    <span className="tabular w-[96px] text-right font-semibold text-ink-strong">
                      {formatAmount(p.amount, p.currency)}
                    </span>
                    <span className="w-9 text-subdued">{formatCurrencyCode(p.currency)}</span>
                    <StatusBadge status={p.status} />
                    <span className="min-w-0 flex-1 truncate text-ink">{p.customer.email}</span>
                    <span className="truncate text-subdued">{p.declineReason ?? "Blocked by Radar"}</span>
                    <span className="tabular w-[130px] text-right text-subdued">{formatDate(p.created, now)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
