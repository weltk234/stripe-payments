"use client";

import { useMemo } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { formatAmount } from "@/lib/format";
import { monthlyRevenue } from "@/lib/mock/analytics";
import { getAllPayments } from "@/lib/paymentsService";
import { Card, ColumnChart, PAGE_TITLE, TD, TH, TR } from "../home/charts";

const usd = (cents: number) => formatAmount(cents, "usd");

export function RevenueRecognitionView() {
  const hydrated = useHydrated();
  const months = useMemo(() => (hydrated ? monthlyRevenue(getAllPayments()) : null), [hydrated]);
  const totals = months?.reduce(
    (t, m) => ({
      billed: t.billed + m.billed,
      recognized: t.recognized + m.recognized,
      refunded: t.refunded + m.refunded,
    }),
    { billed: 0, recognized: 0, refunded: 0 },
  );

  return (
    <div className="pb-16">
      <h1 className={PAGE_TITLE}>Revenue recognition</h1>
      <p className="mt-2 text-[14px] text-subdued">
        Subscription revenue recognized over each 30-day service period. Amounts in USD (approximate FX).
      </p>

      {!months || !totals ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <Card
            title="Recognized revenue by month"
            className="mt-6"
            action={
              <span className="flex items-center gap-3 text-[12px] text-subdued">
                <span className="inline-flex items-center gap-1">
                  <i className="inline-block size-2 rounded-sm bg-brand" /> Recognized
                </span>
                <span className="inline-flex items-center gap-1">
                  <i className="inline-block size-2 rounded-sm bg-[#c4c0ff]" /> Deferred
                </span>
              </span>
            }
          >
            <ColumnChart
              ariaLabel="Recognized and deferred revenue per month"
              format={usd}
              items={months.map((m) => ({
                key: String(m.month),
                label: m.label,
                value: m.recognized,
                secondary: m.deferred,
              }))}
            />
            <div className="mt-1 flex gap-3">
              {months.map((m) => (
                <span key={m.month} className="flex-1 truncate text-center text-[12px] text-subdued">
                  {m.label}
                </span>
              ))}
            </div>
          </Card>

          <table className="mt-6 w-full table-fixed border-collapse text-[14px] leading-5">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className={`${TH} text-left`}>
                  Month
                </th>
                <th scope="col" className={`${TH} text-right`}>
                  Billed
                </th>
                <th scope="col" className={`${TH} text-right`}>
                  Recognized
                </th>
                <th scope="col" className={`${TH} text-right`}>
                  Deferred to next month
                </th>
                <th scope="col" className={`${TH} text-right`}>
                  Refunded
                </th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className={TR}>
                  <td className={`${TD} font-medium text-ink-strong`}>{m.label}</td>
                  <td className={`${TD} tabular text-right`}>{usd(m.billed)}</td>
                  <td className={`${TD} tabular text-right font-semibold text-ink-strong`}>{usd(m.recognized)}</td>
                  <td className={`${TD} tabular text-right`}>{usd(m.deferred)}</td>
                  <td className={`${TD} tabular text-right`}>
                    {m.refunded ? `-${usd(m.refunded)}` : <span className="text-faint">—</span>}
                  </td>
                </tr>
              ))}
              <tr className="h-9">
                <td className={`${TD} font-semibold text-ink-strong`}>Total</td>
                <td className={`${TD} tabular text-right font-semibold`}>{usd(totals.billed)}</td>
                <td className={`${TD} tabular text-right font-semibold text-ink-strong`}>{usd(totals.recognized)}</td>
                <td className={TD} />
                <td className={`${TD} tabular text-right font-semibold`}>-{usd(totals.refunded)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
