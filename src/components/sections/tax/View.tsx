"use client";

import { useMemo } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { formatAmount, formatDate } from "@/lib/format";
import { getTaxRegistrations, type TaxRegistration } from "@/lib/mock/catalog";
import {
  DataTable,
  Dash,
  PageTitle,
  Pill,
  SectionHeading,
  StatTile,
  useNow,
  type Column,
  type Tone,
} from "../product-catalog/ui";

const STATUS: Record<TaxRegistration["status"], { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  scheduled: { label: "Scheduled", tone: "info" },
  expired: { label: "Expired", tone: "neutral" },
};

export function TaxView() {
  const { hydrated, now } = useNow();
  const registrations = useMemo(() => (hydrated ? getTaxRegistrations(now) : []), [hydrated, now]);
  const collected = registrations.reduce((sum, r) => sum + r.collected, 0);
  const active = registrations.filter((r) => r.status === "active");
  const top = [...active].sort((a, b) => b.collected - a.collected)[0];

  const columns: Column<TaxRegistration>[] = [
    {
      header: "Jurisdiction",
      width: 240,
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden>{r.flag}</span>
          <span className="truncate font-medium text-ink-strong">{r.jurisdiction}</span>
        </span>
      ),
    },
    { header: "Type", width: 140, cell: (r) => r.type },
    { header: "Status", width: 120, cell: (r) => <Pill tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Pill> },
    {
      header: "Collected (30d)",
      width: 150,
      align: "right",
      cell: (r) => (r.collected ? <span className="tabular">{formatAmount(r.collected, "usd")}</span> : <Dash />),
    },
    {
      header: "Active from",
      width: 170,
      cell: (r) => <span className="tabular">{formatDate(r.activeFrom, now)}</span>,
    },
  ];

  return (
    <div className="pb-6">
      <PageTitle>Tax</PageTitle>
      {hydrated ? (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile label="Tax collected (30d)" value={formatAmount(collected, "usd")} hint="Converted to USD" />
            <StatTile label="Active registrations" value={active.length} hint={`of ${registrations.length} total`} />
            <StatTile
              label="Top jurisdiction"
              value={top ? top.jurisdiction : "—"}
              hint={top ? `${formatAmount(top.collected, "usd")} collected` : undefined}
            />
          </div>
          <SectionHeading>Registrations</SectionHeading>
          <DataTable className="mt-2" columns={columns} rows={registrations} rowKey={(r) => r.id} />
        </>
      ) : (
        <TableSkeleton rows={8} />
      )}
    </div>
  );
}
