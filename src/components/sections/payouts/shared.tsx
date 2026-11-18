"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { TablePagination } from "@/components/payments/TablePagination";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { useHydrated } from "@/hooks/useHydrated";
import type { PageSize } from "@/lib/filters";

/**
 * Shared building blocks for the money-movement sections (payouts, top-ups,
 * transfers, collected fees, all activity, balances).
 */

/** Current time once hydrated, `null` during SSR/hydration (dates depend on the viewer's time zone). */
export function useNow(): number | null {
  const hydrated = useHydrated();
  return useMemo(() => (hydrated ? Date.now() : null), [hydrated]);
}

export type Tone = "success" | "danger" | "neutral" | "warning" | "info";

const TONE: Record<Tone, string> = {
  success: "bg-success-bg text-success-text border-success-border",
  danger: "bg-danger-bg text-danger-text border-danger-border",
  neutral: "bg-neutral-bg text-neutral-text border-neutral-border",
  warning: "bg-warning-bg text-warning-text border-warning-border",
  info: "bg-info-bg text-info-text border-info-border",
};

export function ToneBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center gap-1 rounded-[4px] border px-[5px] text-[12px] leading-4 font-medium whitespace-nowrap",
        TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

export const Dash = () => <span className="text-faint">—</span>;

export interface DataColumn<T> {
  id: string;
  header: string;
  width: number;
  align?: "left" | "right";
  cell: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[] | null;
  getRowId: (row: T) => string;
  emptyText: string;
  /** Hide pagination for short, fixed lists. */
  paginate?: boolean;
  label: string;
}

/** Table styled like the Payments table, with client-side 25/50/100 pagination. */
export function DataTable<T>({ columns, rows, getRowId, emptyText, paginate = true, label }: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  if (!rows) return <TableSkeleton />;

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = paginate ? rows.slice((current - 1) * pageSize, current * pageSize) : rows;
  const minWidth = columns.reduce((s, c) => s + c.width, 0);

  return (
    <>
      <div className="mt-[11px] overflow-x-auto overscroll-x-contain">
        <table
          aria-label={label}
          className="w-full table-fixed border-collapse text-[14px] leading-5"
          style={{ minWidth }}
        >
          <colgroup>
            {columns.map((c) => (
              <col key={c.id} style={{ width: c.width }} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-border">
              {columns.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className={cn(
                    "h-[34px] px-2 text-[13px] leading-4 font-semibold whitespace-nowrap text-ink",
                    c.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={getRowId(row)} className="h-9 border-b border-border hover:bg-offset">
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={cn(
                      "overflow-hidden px-2 whitespace-nowrap text-ink",
                      c.align === "right" && "text-right",
                    )}
                  >
                    <div className={cn("flex min-w-0 items-center", c.align === "right" && "justify-end")}>
                      {c.cell(row)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-16 text-center text-[14px] text-subdued">{emptyText}</p>}
      </div>
      {paginate && (
        <TablePagination
          page={current}
          pageSize={pageSize}
          pageCount={pageCount}
          total={rows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
    </>
  );
}

/** Bold amount + gray currency code, as in the Payments table. */
export function MoneyCell({ amount, code, muted }: { amount: string; code?: string; muted?: boolean }) {
  return (
    <span className="tabular truncate whitespace-nowrap">
      <span className={cn("font-semibold", muted ? "text-subdued" : "text-ink-strong")}>{amount}</span>
      {code && <span className="ml-1.5 text-subdued">{code}</span>}
    </span>
  );
}

/** Small summary tile used above tables. */
export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
      <div className="text-[13px] font-medium text-subdued">{label}</div>
      <div className="tabular mt-1 truncate text-[20px] leading-7 font-semibold text-ink-strong">{value}</div>
      {hint && <div className="mt-0.5 truncate text-[12px] text-subdued">{hint}</div>}
    </div>
  );
}
