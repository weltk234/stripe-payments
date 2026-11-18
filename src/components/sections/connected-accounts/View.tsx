"use client";

import { useMemo, useState } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { DateCell } from "@/components/payments/cells/DateCell";
import { CopyId } from "@/components/payments/cells/CopyId";
import { cn } from "@/components/ui/cn";
import { formatAmount } from "@/lib/format";
import { getConnectedAccounts, type ConnectedAccount, type ConnectedStatus } from "@/lib/mock/catalog";
import { DataTable, Dash, PageTitle, Pill, useNow, type Column, type Tone } from "../product-catalog/ui";

export const ACCOUNT_STATUS: Record<ConnectedStatus, { label: string; tone: Tone }> = {
  enabled: { label: "Enabled", tone: "success" },
  restricted: { label: "Restricted", tone: "danger" },
  pending: { label: "Pending", tone: "warning" },
};

const FILTERS: { id: ConnectedStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "enabled", label: "Enabled" },
  { id: "restricted", label: "Restricted" },
  { id: "pending", label: "Pending" },
];

export function connectedAccountColumns(now: number): Column<ConnectedAccount>[] {
  return [
    {
      header: "Account",
      width: 230,
      cell: (a) => <span className="truncate font-medium text-ink-strong">{a.businessName}</span>,
    },
    { header: "ID", width: 210, cell: (a) => <CopyId id={a.id} /> },
    {
      header: "Country",
      width: 170,
      cell: (a) => (
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden>{a.flag}</span>
          <span className="truncate">{a.country}</span>
        </span>
      ),
    },
    {
      header: "Status",
      width: 110,
      cell: (a) => <Pill tone={ACCOUNT_STATUS[a.status].tone}>{ACCOUNT_STATUS[a.status].label}</Pill>,
    },
    {
      header: "Payouts",
      width: 100,
      cell: (a) =>
        a.payoutsEnabled ? (
          <span className="text-success-text">Enabled</span>
        ) : (
          <span className="text-subdued">Paused</span>
        ),
    },
    {
      header: "Volume (30d)",
      width: 130,
      align: "right",
      cell: (a) => (a.volume ? <span className="tabular">{formatAmount(a.volume, "usd")}</span> : <Dash />),
    },
    { header: "Created", width: 150, cell: (a) => <DateCell ts={a.created} now={now} /> },
  ];
}

export function ConnectedAccountsView() {
  const { hydrated, now } = useNow();
  const accounts = useMemo(() => (hydrated ? getConnectedAccounts(now) : []), [hydrated, now]);
  const [filter, setFilter] = useState<ConnectedStatus | "all">("all");
  const rows = filter === "all" ? accounts : accounts.filter((a) => a.status === filter);

  return (
    <div className="pb-6">
      <PageTitle>Connected accounts</PageTitle>
      <div role="tablist" aria-label="Filter accounts" className="mt-6 grid grid-cols-6 gap-2">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          const count = f.id === "all" ? accounts.length : accounts.filter((a) => a.status === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex h-11 items-center justify-between rounded-lg px-3 text-left text-[14px] leading-5",
                active
                  ? "font-medium text-brand-text shadow-[inset_0_0_0_1.5px_var(--color-brand)]"
                  : "text-ink shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:shadow-[inset_0_0_0_1px_#a3acba]",
              )}
            >
              {f.label}
              <span className="tabular text-subdued">{hydrated ? count : ""}</span>
            </button>
          );
        })}
      </div>
      {hydrated ? (
        <DataTable
          className="mt-4"
          columns={connectedAccountColumns(now)}
          rows={rows}
          rowKey={(a) => a.id}
          empty="No connected accounts"
        />
      ) : (
        <TableSkeleton />
      )}
    </div>
  );
}
