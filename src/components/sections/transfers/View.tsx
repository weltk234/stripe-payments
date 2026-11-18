"use client";

import { useMemo } from "react";
import { DateCell } from "@/components/payments/cells/DateCell";
import { PaymentsHeader } from "@/components/payments/PaymentsHeader";
import { SubTabs } from "@/components/payments/SubTabs";
import { formatAmount, formatCurrencyCode } from "@/lib/format";
import { getTransfers, type Transfer, type TransferStatus } from "@/lib/mock/treasury";
import { DataTable, MoneyCell, ToneBadge, useNow, type DataColumn, type Tone } from "../payouts/shared";

const STATUS: Record<TransferStatus, { label: string; tone: Tone }> = {
  paid: { label: "Paid", tone: "success" },
  pending: { label: "Pending", tone: "neutral" },
  reversed: { label: "Reversed", tone: "neutral" },
  partially_reversed: { label: "Partially reversed", tone: "warning" },
};

export function TransfersView() {
  const now = useNow();
  const transfers = useMemo(() => (now === null ? null : getTransfers(now)), [now]);

  const columns: DataColumn<Transfer>[] = [
    {
      id: "amount",
      header: "Amount",
      width: 140,
      align: "right",
      cell: (t) => <MoneyCell amount={formatAmount(t.amount, t.currency)} code={formatCurrencyCode(t.currency)} />,
    },
    {
      id: "status",
      header: "Status",
      width: 150,
      cell: (t) => <ToneBadge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</ToneBadge>,
    },
    {
      id: "destination",
      header: "Destination",
      width: 300,
      cell: (t) => (
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-ink-strong">{t.destination.name}</span>
          <span className="truncate font-mono text-[13px] text-subdued">{t.destination.id}</span>
        </span>
      ),
    },
    {
      id: "description",
      header: "Description",
      width: 180,
      cell: (t) => <span className="truncate">{t.description}</span>,
    },
    { id: "created", header: "Date", width: 150, cell: (t) => <DateCell ts={t.created} now={now ?? 0} /> },
    {
      id: "id",
      header: "ID",
      width: 150,
      cell: (t) => <span className="truncate font-mono text-[13px] text-subdued">{t.id}</span>,
    },
  ];

  return (
    <div className="pb-6">
      <PaymentsHeader />
      <SubTabs />
      <DataTable
        label="Transfers"
        columns={columns}
        rows={transfers}
        getRowId={(t) => t.id}
        emptyText="No transfers yet."
      />
    </div>
  );
}
