"use client";

import { useMemo } from "react";
import { DateCell } from "@/components/payments/cells/DateCell";
import { PaymentsHeader } from "@/components/payments/PaymentsHeader";
import { SubTabs } from "@/components/payments/SubTabs";
import { formatAmount, formatCurrencyCode } from "@/lib/format";
import { getCollectedFees, type CollectedFee } from "@/lib/mock/treasury";
import { Dash, DataTable, MoneyCell, StatTile, ToneBadge, useNow, type DataColumn } from "../payouts/shared";

export function CollectedFeesView() {
  const now = useNow();
  const fees = useMemo(() => (now === null ? null : getCollectedFees(now)), [now]);

  const columns: DataColumn<CollectedFee>[] = [
    {
      id: "amount",
      header: "Amount",
      width: 140,
      align: "right",
      cell: (f) => (
        <MoneyCell
          amount={formatAmount(f.amount, f.currency)}
          code={formatCurrencyCode(f.currency)}
          muted={f.refunded}
        />
      ),
    },
    {
      id: "status",
      header: "",
      width: 100,
      cell: (f) => (f.refunded ? <ToneBadge tone="neutral">Refunded</ToneBadge> : null),
    },
    {
      id: "charge",
      header: "Charge amount",
      width: 140,
      align: "right",
      cell: (f) => <span className="tabular">{formatAmount(f.chargeAmount, f.currency)}</span>,
    },
    {
      id: "rate",
      header: "Fee rate",
      width: 90,
      align: "right",
      cell: (f) => <span className="tabular text-subdued">{((f.amount / f.chargeAmount) * 100).toFixed(1)}%</span>,
    },
    {
      id: "account",
      header: "Connected account",
      width: 280,
      cell: (f) => (
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-ink-strong">{f.account.name}</span>
          <span className="truncate font-mono text-[13px] text-subdued">{f.account.id}</span>
        </span>
      ),
    },
    {
      id: "chargeId",
      header: "Charge",
      width: 170,
      cell: (f) =>
        f.chargeId ? <span className="truncate font-mono text-[13px] text-subdued">{f.chargeId}</span> : <Dash />,
    },
    { id: "created", header: "Date", width: 150, cell: (f) => <DateCell ts={f.created} now={now ?? 0} /> },
  ];

  const total30d =
    fees && now !== null
      ? fees.filter((f) => !f.refunded && f.created >= now - 30 * 24 * 3600_000).reduce((s, f) => s + f.amount, 0)
      : 0;

  return (
    <div className="pb-6">
      <PaymentsHeader />
      <SubTabs />
      {fees && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatTile label="Collected, last 30 days" value={formatAmount(total30d, "usd")} hint="USD" />
          <StatTile label="Application fees" value={fees.length} hint="Last 90 days" />
          <StatTile
            label="Connected accounts"
            value={new Set(fees.map((f) => f.account.id)).size}
            hint="Paying application fees"
          />
        </div>
      )}
      <DataTable
        label="Collected fees"
        columns={columns}
        rows={fees}
        getRowId={(f) => f.id}
        emptyText="No collected fees yet."
      />
    </div>
  );
}
