"use client";

import { useMemo } from "react";
import { DateCell } from "@/components/payments/cells/DateCell";
import { PaymentsHeader } from "@/components/payments/PaymentsHeader";
import { SubTabs } from "@/components/payments/SubTabs";
import { BankIcon } from "@/components/ui/icons/PaymentIcons";
import { formatAmount, formatCurrencyCode } from "@/lib/format";
import { getTopUps, type TopUp, type TopUpStatus } from "@/lib/mock/treasury";
import { DataTable, MoneyCell, ToneBadge, useNow, type DataColumn, type Tone } from "../payouts/shared";

const STATUS: Record<TopUpStatus, { label: string; tone: Tone }> = {
  succeeded: { label: "Succeeded", tone: "success" },
  pending: { label: "Pending", tone: "neutral" },
  failed: { label: "Failed", tone: "danger" },
  canceled: { label: "Canceled", tone: "neutral" },
};

export function TopUpsView() {
  const now = useNow();
  const topUps = useMemo(() => (now === null ? null : getTopUps(now)), [now]);

  const columns: DataColumn<TopUp>[] = [
    {
      id: "amount",
      header: "Amount",
      width: 150,
      align: "right",
      cell: (t) => <MoneyCell amount={formatAmount(t.amount, t.currency)} code={formatCurrencyCode(t.currency)} />,
    },
    {
      id: "status",
      header: "Status",
      width: 120,
      cell: (t) => <ToneBadge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</ToneBadge>,
    },
    {
      id: "source",
      header: "Source",
      width: 230,
      cell: (t) => (
        <span className="flex items-center gap-2">
          <BankIcon />
          <span className="truncate">{t.bankName}</span>
          <span className="tabular text-subdued">•••• {t.last4}</span>
        </span>
      ),
    },
    {
      id: "description",
      header: "Description",
      width: 220,
      cell: (t) => <span className="truncate">{t.description}</span>,
    },
    { id: "created", header: "Created", width: 150, cell: (t) => <DateCell ts={t.created} now={now ?? 0} /> },
    {
      id: "available",
      header: "Expected availability",
      width: 170,
      cell: (t) => <DateCell ts={t.expectedAvailability} now={now ?? 0} />,
    },
  ];

  return (
    <div className="pb-6">
      <PaymentsHeader />
      <SubTabs />
      <DataTable label="Top-ups" columns={columns} rows={topUps} getRowId={(t) => t.id} emptyText="No top-ups yet." />
    </div>
  );
}
