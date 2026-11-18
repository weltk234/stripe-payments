"use client";

import { useMemo, useState } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { TablePagination } from "@/components/payments/TablePagination";
import { DateCell } from "@/components/payments/cells/DateCell";
import { formatAmount, formatCurrencyCode } from "@/lib/format";
import type { PageSize } from "@/lib/filters";
import { getSubscriptions, type Subscription, type SubscriptionStatus } from "@/lib/mock/catalog";
import { DataTable, PageTitle, Pill, StatTile, useNow, type Column, type Tone } from "../product-catalog/ui";

const STATUS: Record<SubscriptionStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  trialing: { label: "Trialing", tone: "info" },
  past_due: { label: "Past due", tone: "warning" },
  canceled: { label: "Canceled", tone: "neutral" },
};

const periodFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function SubscriptionsView() {
  const { hydrated, now } = useNow();
  const subs = useMemo(() => (hydrated ? getSubscriptions(now) : []), [hydrated, now]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const pageCount = Math.max(1, Math.ceil(subs.length / pageSize));
  const rows = subs.slice((page - 1) * pageSize, page * pageSize);

  const live = subs.filter((s) => s.status === "active" || s.status === "past_due");
  const mrr = live.reduce(
    (sum, s) => sum + (s.currency === "usd" ? (s.interval === "month" ? s.amount : Math.round(s.amount / 12)) : 0),
    0,
  );

  const columns: Column<Subscription>[] = [
    {
      header: "Customer",
      width: 260,
      cell: (s) => <span className="truncate font-medium text-ink-strong">{s.customerEmail}</span>,
    },
    {
      header: "Status",
      width: 110,
      cell: (s) => <Pill tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Pill>,
    },
    { header: "Product", width: 160, cell: (s) => <span className="truncate">{s.plan}</span> },
    {
      header: "Amount",
      width: 160,
      align: "right",
      cell: (s) => (
        <span className="tabular">
          <span className="font-semibold text-ink-strong">{formatAmount(s.amount, s.currency)}</span>{" "}
          <span className="text-subdued">
            {formatCurrencyCode(s.currency)} / {s.interval}
          </span>
        </span>
      ),
    },
    {
      header: "Current period",
      width: 170,
      cell: (s) =>
        s.status === "canceled" ? (
          <span className="text-faint">—</span>
        ) : (
          <span className="tabular">
            {periodFormat.format(s.periodStart)} – {periodFormat.format(s.periodEnd)}
          </span>
        ),
    },
    { header: "Created", width: 150, cell: (s) => <DateCell ts={s.created} now={now} /> },
  ];

  return (
    <div className="pb-6">
      <PageTitle>Subscriptions</PageTitle>
      {hydrated ? (
        <>
          <div className="mt-6 grid grid-cols-4 gap-3">
            <StatTile label="Active subscriptions" value={subs.filter((s) => s.status === "active").length} />
            <StatTile label="MRR (USD)" value={formatAmount(mrr, "usd")} hint="Monthly recurring revenue" />
            <StatTile label="Trialing" value={subs.filter((s) => s.status === "trialing").length} />
            <StatTile label="Past due" value={subs.filter((s) => s.status === "past_due").length} />
          </div>
          <DataTable className="mt-6" columns={columns} rows={rows} rowKey={(s) => s.id} />
          <TablePagination
            page={page}
            pageSize={pageSize}
            pageCount={pageCount}
            total={subs.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      ) : (
        <TableSkeleton />
      )}
    </div>
  );
}
