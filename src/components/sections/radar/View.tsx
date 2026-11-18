"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import { AmountCell, CurrencyCell } from "@/components/payments/cells/AmountCell";
import { DateCell } from "@/components/payments/cells/DateCell";
import { StatusBadge } from "@/components/payments/cells/StatusBadge";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { RADAR_RULES, type RadarRule } from "@/lib/mock/analytics";
import { getAllPayments } from "@/lib/paymentsService";
import { Card, PAGE_TITLE, TD, TH, TR } from "../home/charts";

const ACTION_STYLE: Record<RadarRule["action"], string> = {
  Block: "bg-danger-bg text-danger-text border-danger-border",
  Review: "bg-warning-bg text-warning-text border-warning-border",
  Allow: "bg-success-bg text-success-text border-success-border",
};

function riskTone(score: number) {
  if (score >= 75) return "text-danger-text";
  if (score >= 65) return "text-warning-text";
  return "text-success-text";
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-4 w-7 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand" : "bg-border-strong",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-3 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-3",
        )}
      />
    </button>
  );
}

export function RadarView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const now = useMemo(() => (hydrated ? Date.now() : 0), [hydrated]);
  const [rules, setRules] = useState(RADAR_RULES);

  const data = useMemo(() => {
    if (!hydrated) return null;
    const payments = getAllPayments(now);
    const blocked = payments.filter((p) => p.status === "blocked");
    const reviews = payments
      .filter((p) => p.riskScore >= 60 && p.status !== "blocked")
      .sort((a, b) => b.riskScore - a.riskScore);
    const highRisk = payments.filter((p) => p.riskScore >= 65).length;
    return { blocked, reviews: reviews.slice(0, 15), reviewCount: reviews.length, highRisk, total: payments.length };
  }, [hydrated, now]);

  return (
    <div className="pb-16">
      <h1 className={PAGE_TITLE}>Radar</h1>
      <p className="mt-2 text-[14px] text-subdued">
        Fraud protection powered by machine learning, plus your own rules.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Blocked payments", value: data?.blocked.length },
          { label: "Payments in review", value: data?.reviewCount },
          { label: "Elevated or highest risk", value: data?.highRisk },
          { label: "Payments screened", value: data?.total },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border p-4">
            <p className="text-[13px] text-subdued">{kpi.label}</p>
            <p className="tabular mt-1 text-[20px] leading-7 font-semibold text-ink-strong">{kpi.value ?? "—"}</p>
          </div>
        ))}
      </div>

      <Card title="Rules" className="mt-6">
        <ul className="-mx-4 divide-y divide-border border-t border-border">
          {rules.map((rule) => (
            <li key={rule.id} className={cn("flex items-center gap-3 px-4 py-2.5", !rule.enabled && "opacity-60")}>
              <span
                className={cn(
                  "inline-flex h-[18px] w-[56px] items-center justify-center rounded-[4px] border text-[12px] font-medium",
                  ACTION_STYLE[rule.action],
                )}
              >
                {rule.action}
              </span>
              <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{rule.rule}</code>
              <span className="text-[13px] text-subdued">{rule.description}</span>
              <Toggle
                checked={rule.enabled}
                label={`${rule.enabled ? "Disable" : "Enable"} rule: ${rule.rule}`}
                onChange={(enabled) => setRules((rs) => rs.map((r) => (r.id === rule.id ? { ...r, enabled } : r)))}
              />
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mt-8 text-[16px] leading-6 font-bold text-ink-strong">Review queue</h2>
      {!data ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="mt-[11px] overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-[14px] leading-5" style={{ minWidth: 900 }}>
            <colgroup>
              <col style={{ width: 96 }} />
              <col style={{ width: 48 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 110 }} />
              <col />
              <col style={{ width: 150 }} />
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
                  Risk score
                </th>
                <th scope="col" className={`${TH} text-left`}>
                  Customer
                </th>
                <th scope="col" className={`${TH} text-left`}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {data.reviews.map((p) => (
                <tr
                  key={p.id}
                  className={cn(TR, "cursor-pointer")}
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest("a,button")) router.push(`/payments/${p.id}`);
                  }}
                >
                  <td className={`${TD} text-right`}>
                    <Link href={`/payments/${p.id}`}>
                      <AmountCell amount={p.amount} currency={p.currency} />
                    </Link>
                  </td>
                  <td className={TD}>
                    <CurrencyCell currency={p.currency} />
                  </td>
                  <td className={TD}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className={cn(TD, "tabular font-semibold", riskTone(p.riskScore))}>{p.riskScore}</td>
                  <td className={`${TD} truncate`}>{p.customer.email}</td>
                  <td className={TD}>
                    <DateCell ts={p.created} now={now} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
