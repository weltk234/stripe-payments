"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { formatAmount } from "@/lib/format";
import { getConnectedAccounts } from "@/lib/mock/catalog";
import { connectedAccountColumns } from "../connected-accounts/View";
import { DataTable, PageTitle, SectionHeading, StatTile, useNow } from "../product-catalog/ui";

/** Platform application fee rate used for the illustrative "fees collected" tile. */
const PLATFORM_FEE = 0.05;

export function ConnectView() {
  const { hydrated, now } = useNow();
  const accounts = useMemo(() => (hydrated ? getConnectedAccounts(now) : []), [hydrated, now]);

  const volume = accounts.reduce((sum, a) => sum + a.volume, 0);
  const enabled = accounts.filter((a) => a.status === "enabled").length;
  // Onboarding funnel: every account started, some submitted details, enabled ones finished.
  const funnel = [
    { label: "Account created", count: accounts.length },
    { label: "Details submitted", count: accounts.filter((a) => a.status !== "pending").length },
    { label: "Verified", count: enabled + Math.round(accounts.filter((a) => a.status === "restricted").length / 2) },
    { label: "Payouts enabled", count: accounts.filter((a) => a.payoutsEnabled).length },
  ];
  const max = Math.max(1, funnel[0].count);

  return (
    <div className="pb-6">
      <PageTitle>Connect</PageTitle>
      {hydrated ? (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile label="Connected accounts" value={accounts.length} hint={`${enabled} enabled`} />
            <StatTile
              label="Volume routed (30d)"
              value={formatAmount(volume, "usd")}
              hint="Across all connected accounts"
            />
            <StatTile
              label="Fees collected (30d)"
              value={formatAmount(Math.round(volume * PLATFORM_FEE), "usd")}
              hint={`${PLATFORM_FEE * 100}% application fee`}
            />
          </div>

          <SectionHeading>Onboarding funnel</SectionHeading>
          <ol className="mt-4 flex flex-col gap-3">
            {funnel.map((step, i) => (
              <li key={step.label} className="grid grid-cols-[180px_1fr_80px] items-center gap-4 text-[14px]">
                <span className="text-ink">
                  <span className="mr-2 text-subdued tabular">{i + 1}.</span>
                  {step.label}
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-offset-strong" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-brand"
                    style={{ width: `${(step.count / max) * 100}%` }}
                  />
                </span>
                <span className="tabular text-right text-ink-strong">
                  {step.count} <span className="text-subdued">({Math.round((step.count / max) * 100)}%)</span>
                </span>
              </li>
            ))}
          </ol>

          <SectionHeading
            action={
              <Link
                href="/connected-accounts"
                className="text-[14px] font-medium text-brand-text hover:text-brand-hover"
              >
                View all
              </Link>
            }
          >
            Recently connected
          </SectionHeading>
          <DataTable
            className="mt-2"
            columns={connectedAccountColumns(now)}
            rows={accounts.slice(0, 6)}
            rowKey={(a) => a.id}
          />
        </>
      ) : (
        <TableSkeleton rows={8} />
      )}
    </div>
  );
}
