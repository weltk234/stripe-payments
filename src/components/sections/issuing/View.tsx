"use client";

import { useMemo } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { DateCell } from "@/components/payments/cells/DateCell";
import { VisaIcon } from "@/components/ui/icons/PaymentIcons";
import { cn } from "@/components/ui/cn";
import { formatAmount } from "@/lib/format";
import { getIssuedCards, type IssuedCard } from "@/lib/mock/catalog";
import { DataTable, PageTitle, Pill, StatTile, useNow, type Column, type Tone } from "../product-catalog/ui";

const STATUS: Record<IssuedCard["status"], { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
  canceled: { label: "Canceled", tone: "danger" },
};

function SpendBar({ spent, limit }: { spent: number; limit: number }) {
  const pct = Math.min(100, (spent / limit) * 100);
  return (
    <span className="flex w-full items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-offset-strong" aria-hidden>
        <span
          className={cn("block h-full rounded-full", pct > 85 ? "bg-danger-text" : "bg-brand")}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="tabular w-[72px] text-right">{formatAmount(spent, "usd")}</span>
    </span>
  );
}

export function IssuingView() {
  const { hydrated, now } = useNow();
  const cards = useMemo(() => (hydrated ? getIssuedCards(now) : []), [hydrated, now]);
  const active = cards.filter((c) => c.status === "active");
  const spent = cards.reduce((sum, c) => sum + c.spent, 0);

  const columns: Column<IssuedCard>[] = [
    {
      header: "Cardholder",
      width: 210,
      cell: (c) => <span className="truncate font-medium text-ink-strong">{c.cardholder}</span>,
    },
    {
      header: "Card",
      width: 130,
      cell: (c) => (
        <span className="flex items-center gap-2">
          <VisaIcon />
          <span className="tabular">•••• {c.last4}</span>
        </span>
      ),
    },
    { header: "Type", width: 100, cell: (c) => (c.type === "virtual" ? "Virtual" : "Physical") },
    { header: "Status", width: 100, cell: (c) => <Pill tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Pill> },
    {
      header: "Spending limit",
      width: 140,
      align: "right",
      cell: (c) => <span className="tabular">{formatAmount(c.limit, "usd")} / mo</span>,
    },
    { header: "Spend this month", width: 220, cell: (c) => <SpendBar spent={c.spent} limit={c.limit} /> },
    { header: "Created", width: 140, cell: (c) => <DateCell ts={c.created} now={now} /> },
  ];

  return (
    <div className="pb-6">
      <PageTitle>Issuing</PageTitle>
      {hydrated ? (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile label="Active cards" value={active.length} hint={`${cards.length} issued in total`} />
            <StatTile label="Spend this month" value={formatAmount(spent, "usd")} />
            <StatTile
              label="Remaining limit"
              value={formatAmount(
                active.reduce((sum, c) => sum + c.limit - c.spent, 0),
                "usd",
              )}
              hint="Across active cards"
            />
          </div>
          <DataTable className="mt-6" columns={columns} rows={cards} rowKey={(c) => c.id} />
        </>
      ) : (
        <TableSkeleton rows={10} />
      )}
    </div>
  );
}
