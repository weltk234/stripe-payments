"use client";

import { useMemo, useState } from "react";
import { DateCell } from "@/components/payments/cells/DateCell";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { cn } from "@/components/ui/cn";
import { formatAmount, formatCurrencyCode } from "@/lib/format";
import { getProducts, type Product } from "@/lib/mock/catalog";
import { DataTable, PageTitle, Pill, useNow, type Column } from "./ui";

export const formatPrice = (p: Pick<Product, "price" | "currency" | "interval">) =>
  `${formatAmount(p.price, p.currency)}${p.interval ? ` / ${p.interval}` : ""}`;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "archived", label: "Archived" },
] as const;

export function ProductCatalogView() {
  const { hydrated, now } = useNow();
  const products = useMemo(() => (hydrated ? getProducts(now) : []), [hydrated, now]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const rows = products.filter((p) => filter === "all" || (filter === "active" ? p.active : !p.active));

  const columns: Column<Product>[] = [
    {
      header: "Name",
      width: 300,
      cell: (p) => (
        <span className="flex min-w-0 items-center gap-3">
          <span className="size-6 shrink-0 rounded-md" style={{ background: p.color }} aria-hidden />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink-strong">{p.name}</span>
          </span>
        </span>
      ),
    },
    { header: "Description", width: 280, cell: (p) => <span className="truncate text-subdued">{p.description}</span> },
    {
      header: "Pricing",
      width: 170,
      cell: (p) => (
        <span className="tabular truncate">
          {formatPrice(p)} <span className="text-subdued">{formatCurrencyCode(p.currency)}</span>
        </span>
      ),
    },
    {
      header: "Status",
      width: 100,
      cell: (p) => (p.active ? <Pill tone="success">Active</Pill> : <Pill tone="neutral">Archived</Pill>),
    },
    { header: "Created", width: 140, cell: (p) => <DateCell ts={p.created} now={now} /> },
    { header: "Updated", width: 140, cell: (p) => <DateCell ts={p.updated} now={now} /> },
  ];

  return (
    <div className="pb-6">
      <PageTitle>Product catalog</PageTitle>
      <div role="tablist" aria-label="Filter products" className="mt-6 grid grid-cols-6 gap-2">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          const count = products.filter((p) => f.id === "all" || (f.id === "active" ? p.active : !p.active)).length;
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
        <DataTable className="mt-4" columns={columns} rows={rows} rowKey={(p) => p.id} empty="No products found" />
      ) : (
        <TableSkeleton rows={8} />
      )}
    </div>
  );
}
