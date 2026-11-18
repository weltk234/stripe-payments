"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DateCell } from "@/components/payments/cells/DateCell";
import { PaymentsHeader } from "@/components/payments/PaymentsHeader";
import { SubTabs } from "@/components/payments/SubTabs";
import { formatAmount, formatCurrencyCode } from "@/lib/format";
import { getBalanceTransactions, type BalanceTransaction, type BalanceTxnType } from "@/lib/mock/treasury";
import { DataTable, MoneyCell, ToneBadge, useNow, type DataColumn, type Tone } from "../payouts/shared";

const TYPE: Record<BalanceTxnType, { label: string; tone: Tone }> = {
  charge: { label: "Charge", tone: "success" },
  refund: { label: "Refund", tone: "neutral" },
  dispute: { label: "Dispute", tone: "warning" },
  payout: { label: "Payout", tone: "info" },
  topup: { label: "Top-up", tone: "info" },
  transfer: { label: "Transfer", tone: "neutral" },
};

export function AllActivityView() {
  const now = useNow();
  const txns = useMemo(() => (now === null ? null : getBalanceTransactions(now)), [now]);

  const columns: DataColumn<BalanceTransaction>[] = [
    {
      id: "type",
      header: "Type",
      width: 110,
      cell: (t) => <ToneBadge tone={TYPE[t.type].tone}>{TYPE[t.type].label}</ToneBadge>,
    },
    {
      id: "amount",
      header: "Amount",
      width: 140,
      align: "right",
      cell: (t) => <MoneyCell amount={formatAmount(t.amount, t.currency)} code={formatCurrencyCode(t.currency)} />,
    },
    {
      id: "fee",
      header: "Fee",
      width: 100,
      align: "right",
      cell: (t) => <span className="tabular text-subdued">{t.fee ? `-${formatAmount(t.fee, t.currency)}` : "—"}</span>,
    },
    {
      id: "net",
      header: "Net",
      width: 120,
      align: "right",
      cell: (t) => <span className="tabular font-semibold text-ink-strong">{formatAmount(t.net, t.currency)}</span>,
    },
    {
      id: "description",
      header: "Description",
      width: 330,
      cell: (t) =>
        t.source.startsWith("pi_") ? (
          <Link href={`/payments/${t.source}`} className="truncate hover:text-brand-text">
            {t.description}
          </Link>
        ) : (
          <span className="truncate">{t.description}</span>
        ),
    },
    { id: "created", header: "Created", width: 150, cell: (t) => <DateCell ts={t.created} now={now ?? 0} /> },
    {
      id: "available",
      header: "Available on",
      width: 150,
      cell: (t) => <DateCell ts={t.availableOn} now={now ?? 0} />,
    },
  ];

  return (
    <div className="pb-6">
      <PaymentsHeader />
      <SubTabs />
      <DataTable
        label="All activity"
        columns={columns}
        rows={txns}
        getRowId={(t) => t.id}
        emptyText="No balance activity yet."
      />
    </div>
  );
}
