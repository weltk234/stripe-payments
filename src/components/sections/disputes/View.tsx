"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import { AmountCell, CurrencyCell } from "@/components/payments/cells/AmountCell";
import { DateCell } from "@/components/payments/cells/DateCell";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { buildDisputes, DISPUTE_STATUSES, type DisputeStatus } from "@/lib/mock/analytics";
import { getAllPayments } from "@/lib/paymentsService";
import { PAGE_TITLE, TD, TH, TR } from "../home/charts";

const STATUS: Record<DisputeStatus, { label: string; className: string }> = {
  needs_response: { label: "Needs response", className: "bg-warning-bg text-warning-text border-warning-border" },
  under_review: { label: "Under review", className: "bg-info-bg text-info-text border-info-border" },
  won: { label: "Won", className: "bg-success-bg text-success-text border-success-border" },
  lost: { label: "Lost", className: "bg-danger-bg text-danger-text border-danger-border" },
};

const FILTERS: { label: string; value: DisputeStatus | null }[] = [
  { label: "All", value: null },
  ...DISPUTE_STATUSES.map((s) => ({ label: STATUS[s].label, value: s })),
];

export function DisputesView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const now = useMemo(() => (hydrated ? Date.now() : 0), [hydrated]);
  const disputes = useMemo(() => (hydrated ? buildDisputes(getAllPayments(now)) : null), [hydrated, now]);
  const [filter, setFilter] = useState<DisputeStatus | null>(null);
  const rows = disputes?.filter((d) => !filter || d.status === filter) ?? [];

  return (
    <div className="pb-16">
      <h1 className={PAGE_TITLE}>Disputes</h1>

      <div role="tablist" aria-label="Filter by dispute status" className="mt-6 grid grid-cols-5 gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count = disputes ? disputes.filter((d) => !f.value || d.status === f.value).length : null;
          return (
            <button
              key={f.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex h-11 items-center justify-between rounded-lg px-3 text-[14px]",
                active
                  ? "font-medium text-brand-text shadow-[inset_0_0_0_1.5px_var(--color-brand)]"
                  : "text-ink shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:shadow-[inset_0_0_0_1px_#a3acba]",
              )}
            >
              {f.label}
              <span className="tabular text-subdued">{count ?? ""}</span>
            </button>
          );
        })}
      </div>

      {!disputes ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="mt-[18px] overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-[14px] leading-5" style={{ minWidth: 1000 }}>
            <colgroup>
              <col style={{ width: 96 }} />
              <col style={{ width: 48 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 190 }} />
              <col />
              <col style={{ width: 140 }} />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className={`${TH} text-right`}>
                  Amount
                </th>
                <th scope="col" className={TH}>
                  <span className="sr-only">Currency</span>
                </th>
                <th scope="col" className={`${TH} text-left`}>
                  Status
                </th>
                <th scope="col" className={`${TH} text-left`}>
                  Reason
                </th>
                <th scope="col" className={`${TH} text-left`}>
                  Customer
                </th>
                <th scope="col" className={`${TH} text-left`}>
                  Disputed on
                </th>
                <th scope="col" className={`${TH} text-left`}>
                  Evidence due by
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const overdue = d.status === "needs_response" && d.evidenceDueBy < now;
                return (
                  <tr
                    key={d.id}
                    className={cn(TR, "cursor-pointer")}
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest("a,button")) router.push(`/payments/${d.payment.id}`);
                    }}
                  >
                    <td className={`${TD} text-right`}>
                      <Link href={`/payments/${d.payment.id}`}>
                        <AmountCell amount={d.payment.amount} currency={d.payment.currency} />
                      </Link>
                    </td>
                    <td className={TD}>
                      <CurrencyCell currency={d.payment.currency} />
                    </td>
                    <td className={TD}>
                      <span
                        className={cn(
                          "inline-flex h-[18px] items-center rounded-[4px] border px-[5px] text-[12px] font-medium",
                          STATUS[d.status].className,
                        )}
                      >
                        {STATUS[d.status].label}
                      </span>
                    </td>
                    <td className={`${TD} truncate`}>{d.reason}</td>
                    <td className={`${TD} truncate`}>{d.payment.customer.email}</td>
                    <td className={TD}>
                      <DateCell ts={d.disputedAt} now={now} />
                    </td>
                    <td className={cn(TD, overdue && "text-danger-text")}>
                      {d.status === "needs_response" || d.status === "under_review" ? (
                        <DateCell ts={d.evidenceDueBy} now={now} />
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="py-16 text-center text-[14px] text-subdued">No disputes with this status.</p>
          )}
        </div>
      )}
    </div>
  );
}
