"use client";

import Link from "next/link";
import { createColumnHelper, type RowData } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/Checkbox";
import type { SortKey } from "@/lib/filters";
import type { Payment } from "@/lib/types";
import { AmountCell, CurrencyCell } from "./cells/AmountCell";
import { CopyId } from "./cells/CopyId";
import { DateCell } from "./cells/DateCell";
import { PaymentMethodCell } from "./cells/PaymentMethodCell";
import { StatusBadge } from "./cells/StatusBadge";
import { RowActions } from "./RowActions";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Fixed column width in px (the table uses `table-layout: fixed`). */
    width: number;
    align?: "left" | "right";
    /** Makes the header a sort button bound to this key. */
    sortKey?: SortKey;
    /** Name in the "Edit columns" menu; columns without one can't be hidden. */
    label?: string;
    /** Header text is visually hidden (still read by screen readers). */
    hideHeader?: boolean;
    sticky?: "right";
    cellClassName?: string;
  }
}

export interface TableContext {
  now: number;
}

const col = createColumnHelper<Payment>();
const Dash = () => <span className="text-faint">—</span>;

/** Ordered like the reference; "Payment ID" follows the reference columns so the default view matches it. */
export const buildColumns = ({ now }: TableContext) => [
  col.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all payments on this page"
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select payment ${row.original.id}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(v) => row.toggleSelected(v === true)}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    meta: { width: 30, cellClassName: "pl-2 pr-0" },
  }),
  col.accessor("amount", {
    header: "Amount",
    cell: ({ row }) => (
      <Link
        href={`/payments/${row.original.id}`}
        onClick={(e) => e.stopPropagation()}
        className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        <AmountCell amount={row.original.amount} currency={row.original.currency} />
      </Link>
    ),
    meta: { width: 81, align: "right", sortKey: "amount", cellClassName: "pl-0" },
  }),
  col.accessor("currency", {
    header: "Currency",
    cell: ({ getValue }) => <CurrencyCell currency={getValue()} />,
    meta: { width: 37, hideHeader: true, cellClassName: "pr-0" },
  }),
  col.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    meta: { width: 111, sortKey: "status", hideHeader: true, cellClassName: "pl-1.5" },
  }),
  col.accessor("method", {
    header: "Payment method",
    cell: ({ getValue }) => <PaymentMethodCell method={getValue()} />,
    meta: { width: 136, label: "Payment method" },
  }),
  col.accessor("description", {
    header: "Description",
    cell: ({ getValue }) => <span className="truncate">{getValue()}</span>,
    meta: { width: 148, label: "Description" },
  }),
  col.accessor((p) => p.customer.email, {
    id: "customer",
    header: "Customer",
    cell: ({ getValue }) => <span className="truncate">{getValue()}</span>,
    meta: { width: 244, label: "Customer" },
  }),
  col.accessor("created", {
    header: "Date",
    cell: ({ getValue }) => <DateCell ts={getValue()} now={now} />,
    meta: { width: 138, sortKey: "created" },
  }),
  col.accessor("refundedAt", {
    header: "Refunded date",
    cell: ({ getValue }) => {
      const v = getValue();
      return v ? <DateCell ts={v} now={now} /> : <Dash />;
    },
    meta: { width: 128, label: "Refunded date" },
  }),
  col.accessor("declineReason", {
    header: "Decline reason",
    cell: ({ getValue }) => {
      const v = getValue();
      return v ? <span className="truncate">{v}</span> : <Dash />;
    },
    meta: { width: 160, label: "Decline reason" },
  }),
  col.accessor("id", {
    header: "Payment ID",
    cell: ({ getValue }) => <CopyId id={getValue()} />,
    meta: { width: 170, label: "Payment ID" },
  }),
  col.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions payment={row.original} />,
    meta: { width: 40, sticky: "right", align: "right" },
  }),
];
