"use client";

import { useMemo, useState } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { TablePagination } from "@/components/payments/TablePagination";
import { DateCell } from "@/components/payments/cells/DateCell";
import { cn } from "@/components/ui/cn";
import { formatAmount, formatCurrencyCode, formatDate } from "@/lib/format";
import type { PageSize } from "@/lib/filters";
import { getInvoices, type Invoice, type InvoiceStatus } from "@/lib/mock/catalog";
import { DataTable, PageTitle, Pill, useNow, type Column, type Tone } from "../product-catalog/ui";

const STATUS: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  paid: { label: "Paid", tone: "success" },
  open: { label: "Open", tone: "info" },
  void: { label: "Void", tone: "neutral" },
  uncollectible: { label: "Uncollectible", tone: "danger" },
};

const TABS: { id: InvoiceStatus | "all"; label: string }[] = [
  { id: "all", label: "All invoices" },
  { id: "open", label: "Open" },
  { id: "paid", label: "Paid" },
  { id: "void", label: "Void" },
  { id: "uncollectible", label: "Uncollectible" },
];

export function InvoicesView() {
  const { hydrated, now } = useNow();
  const invoices = useMemo(() => (hydrated ? getInvoices(now) : []), [hydrated, now]);
  const [tab, setTab] = useState<InvoiceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  const filtered = tab === "all" ? invoices : invoices.filter((i) => i.status === tab);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  const columns: Column<Invoice>[] = [
    {
      header: "Amount",
      width: 150,
      align: "right",
      cell: (i) => (
        <span className="tabular">
          <span className="font-semibold text-ink-strong">{formatAmount(i.amountDue, i.currency)}</span>{" "}
          <span className="text-subdued">{formatCurrencyCode(i.currency)}</span>
        </span>
      ),
    },
    {
      header: "Status",
      width: 130,
      cell: (i) => <Pill tone={STATUS[i.status].tone}>{STATUS[i.status].label}</Pill>,
    },
    { header: "Invoice number", width: 150, cell: (i) => <span className="font-mono text-[13px]">{i.number}</span> },
    { header: "Customer", width: 270, cell: (i) => <span className="truncate">{i.customerEmail}</span> },
    {
      header: "Due",
      width: 150,
      cell: (i) => (
        <span className={cn("tabular", i.status === "open" && i.dueDate < now && "text-danger-text")}>
          {formatDate(i.dueDate, now)}
        </span>
      ),
    },
    { header: "Created", width: 150, cell: (i) => <DateCell ts={i.created} now={now} /> },
  ];

  return (
    <div className="pb-6">
      <PageTitle>Invoices</PageTitle>
      <nav aria-label="Invoice status" className="mt-6 border-b border-border">
        <ul className="flex gap-6">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setTab(t.id);
                    setPage(1);
                  }}
                  className={cn(
                    "-mb-px inline-flex h-[30px] items-start border-b-2 text-[14px] leading-5 font-semibold",
                    active ? "border-brand-text text-brand-text" : "border-transparent text-muted hover:text-ink",
                  )}
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {hydrated ? (
        <>
          <DataTable className="mt-4" columns={columns} rows={rows} rowKey={(i) => i.id} empty="No invoices found" />
          <TablePagination
            page={current}
            pageSize={pageSize}
            pageCount={pageCount}
            total={filtered.length}
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
