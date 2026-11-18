"use client";

import { useMemo } from "react";
import { DateCell } from "@/components/payments/cells/DateCell";
import { PaymentsHeader } from "@/components/payments/PaymentsHeader";
import { SubTabs } from "@/components/payments/SubTabs";
import { BankIcon } from "@/components/ui/icons/PaymentIcons";
import { formatAmount, formatCurrencyCode } from "@/lib/format";
import { getPayouts, type Payout, type PayoutStatus } from "@/lib/mock/treasury";
import { DataTable, MoneyCell, StatTile, ToneBadge, useNow, type DataColumn, type Tone } from "./shared";

const STATUS: Record<PayoutStatus, { label: string; tone: Tone }> = {
  paid: { label: "Paid", tone: "success" },
  in_transit: { label: "In transit", tone: "info" },
  pending: { label: "Pending", tone: "neutral" },
  failed: { label: "Failed", tone: "danger" },
  canceled: { label: "Canceled", tone: "neutral" },
};

export function PayoutsView() {
  const now = useNow();
  const payouts = useMemo(() => (now === null ? null : getPayouts(now)), [now]);

  const columns: DataColumn<Payout>[] = [
    {
      id: "amount",
      header: "Amount",
      width: 150,
      align: "right",
      cell: (p) => <MoneyCell amount={formatAmount(p.amount, p.currency)} code={formatCurrencyCode(p.currency)} />,
    },
    {
      id: "status",
      header: "Status",
      width: 120,
      cell: (p) => <ToneBadge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</ToneBadge>,
    },
    {
      id: "bank",
      header: "Bank",
      width: 230,
      cell: (p) => (
        <span className="flex items-center gap-2">
          <BankIcon />
          <span className="truncate">{p.bankName}</span>
          <span className="tabular text-subdued">•••• {p.last4}</span>
        </span>
      ),
    },
    { id: "method", header: "Method", width: 100, cell: (p) => p.method },
    { id: "description", header: "Description", width: 150, cell: (p) => p.description },
    { id: "initiated", header: "Initiated", width: 150, cell: (p) => <DateCell ts={p.initiated} now={now ?? 0} /> },
    { id: "arrival", header: "Est. arrival", width: 150, cell: (p) => <DateCell ts={p.arrival} now={now ?? 0} /> },
    {
      id: "id",
      header: "ID",
      width: 140,
      cell: (p) => <span className="truncate font-mono text-[13px] text-subdued">{p.id}</span>,
    },
  ];

  const upcoming = payouts?.find((p) => p.status === "pending" || p.status === "in_transit");
  const paid30d =
    payouts && now !== null
      ? payouts
          .filter((p) => p.status === "paid" && p.initiated >= now - 30 * 24 * 3600_000)
          .reduce((s, p) => s + p.amount, 0)
      : 0;

  return (
    <div className="pb-6">
      <PaymentsHeader />
      <SubTabs />
      {payouts && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatTile
            label="Next payout"
            value={upcoming ? formatAmount(upcoming.amount, "usd") : "—"}
            hint={upcoming ? `To STRIPE TEST BANK •••• 6789` : "No payout scheduled"}
          />
          <StatTile label="Paid out, last 30 days" value={formatAmount(paid30d, "usd")} hint="USD" />
          <StatTile label="Payout schedule" value="Every 2 days" hint="Standard, 2 business days" />
        </div>
      )}
      <DataTable label="Payouts" columns={columns} rows={payouts} getRowId={(p) => p.id} emptyText="No payouts yet." />
    </div>
  );
}
