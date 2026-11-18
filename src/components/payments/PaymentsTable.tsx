"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import type { SortKey, SortSpec } from "@/lib/filters";
import type { Payment } from "@/lib/types";
import { buildColumns } from "./columns";
import { SortHeader } from "./SortHeader";

interface PaymentsTableProps {
  rows: Payment[];
  now: number;
  sort: SortSpec[];
  onSort: (key: SortKey, additive: boolean) => void;
  columnVisibility: VisibilityState;
  empty: React.ReactNode;
}

const INTERACTIVE = "a,button,input,label,[role=menuitem],[role=checkbox]";

export function PaymentsTable({ rows, now, sort, onSort, columnVisibility, empty }: PaymentsTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columns = useMemo(() => buildColumns({ now }), [now]);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    // Only captured payments can be bulk-actioned (refund/export), as in the Dashboard.
    enableRowSelection: (row) => row.original.status === "succeeded",
    state: { rowSelection, columnVisibility },
    onRowSelectionChange: setRowSelection,
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const tableWidth = visibleColumns.reduce((sum, c) => sum + c.columnDef.meta!.width, 0);

  return (
    <div className="relative mt-[11px] overflow-x-auto overscroll-x-contain">
      <table className="w-full table-fixed border-collapse text-[14px] leading-5" style={{ minWidth: tableWidth }}>
        <colgroup>
          {visibleColumns.map((c) => (
            <col key={c.id} style={{ width: c.columnDef.meta!.width }} />
          ))}
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b border-border">
              {group.headers.map((header) => {
                const meta = header.column.columnDef.meta!;
                const label = typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : "";
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={
                      meta.sortKey
                        ? (() => {
                            const s = sort.find((x) => x.key === meta.sortKey);
                            return s ? (s.desc ? "descending" : "ascending") : "none";
                          })()
                        : undefined
                    }
                    className={cn(
                      "h-[34px] px-2 text-[13px] leading-4 font-semibold whitespace-nowrap text-ink",
                      meta.align === "right" ? "text-right" : "text-left",
                      meta.sticky && "sticky right-0 z-10 bg-white",
                      meta.cellClassName,
                    )}
                  >
                    {meta.sortKey ? (
                      <SortHeader
                        label={label}
                        sortKey={meta.sortKey}
                        sort={sort}
                        align={meta.align}
                        hideLabel={meta.hideHeader}
                        onSort={onSort}
                      />
                    ) : meta.hideHeader ? (
                      <span className="sr-only">{label}</span>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
                if (window.getSelection()?.toString()) return;
                router.push(`/payments/${row.original.id}`);
              }}
              className="group/row h-9 cursor-pointer border-b border-border hover:bg-offset data-[selected=true]:bg-brand-soft"
              data-selected={row.getIsSelected()}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta!;
                return (
                  <td
                    key={cell.id}
                    className={cn(
                      "overflow-hidden px-2 whitespace-nowrap text-ink",
                      meta.align === "right" && "text-right",
                      meta.sticky &&
                        "sticky right-0 z-10 bg-white group-hover/row:bg-offset group-data-[selected=true]/row:bg-brand-soft before:pointer-events-none before:absolute before:inset-y-0 before:-left-6 before:w-6 before:bg-gradient-to-r before:from-white/0 before:to-white group-hover/row:before:to-offset",
                      meta.cellClassName,
                    )}
                  >
                    <div className={cn("flex min-w-0 items-center", meta.align === "right" && "justify-end")}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && empty}
    </div>
  );
}
