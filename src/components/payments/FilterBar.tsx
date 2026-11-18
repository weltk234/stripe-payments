"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApplePayIcon, BankIcon, VisaIcon } from "@/components/ui/icons/PaymentIcons";
import { STATUS_LABEL } from "@/lib/format";
import type { PaymentFilters } from "@/lib/filters";
import { CURRENCIES, PAYMENT_STATUSES, type Currency, type PaymentMethodType, type PaymentStatus } from "@/lib/types";
import { CheckboxListFilter, type Option } from "./filters/CheckboxListFilter";
import { AmountFilter } from "./filters/AmountFilter";
import { DateFilter } from "./filters/DateFilter";
import { MoreFilters } from "./filters/MoreFilters";
import { EditColumns, type ColumnOption } from "./EditColumns";

const STATUS_OPTIONS: Option<PaymentStatus>[] = PAYMENT_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }));
const CURRENCY_OPTIONS: Option<Currency>[] = CURRENCIES.map((c) => ({ value: c, label: c.toUpperCase() }));
const METHOD_OPTIONS: Option<PaymentMethodType>[] = [
  { value: "card", label: "Card", icon: <VisaIcon /> },
  { value: "ach", label: "ACH", icon: <BankIcon /> },
  { value: "wallet", label: "Wallet", icon: <ApplePayIcon /> },
];

interface FilterBarProps {
  filters: PaymentFilters;
  onChange: (patch: Partial<PaymentFilters>) => void;
  onClearAll: () => void;
  hasFilters: boolean;
  onExport: () => void;
  exportCount: number;
  columns: ColumnOption[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (v: VisibilityState) => void;
}

export function FilterBar(props: FilterBarProps) {
  const { filters, onChange } = props;
  return (
    <div className="mt-4 flex items-start justify-between gap-4">
      <div className="flex min-h-7 flex-wrap items-center gap-2">
        <DateFilter value={filters.date} onChange={(date) => onChange({ date })} />
        <AmountFilter value={filters.amount} onChange={(amount) => onChange({ amount })} />
        <CheckboxListFilter
          label="Currency"
          title="Filter by currency"
          options={CURRENCY_OPTIONS}
          selected={filters.currency}
          onChange={(currency) => onChange({ currency })}
        />
        <CheckboxListFilter
          label="Status"
          title="Filter by status"
          options={STATUS_OPTIONS}
          selected={filters.status}
          onChange={(status) => onChange({ status })}
        />
        <CheckboxListFilter
          label="Payment method"
          title="Filter by payment method"
          options={METHOD_OPTIONS}
          selected={filters.method}
          onChange={(method) => onChange({ method })}
        />
        <MoreFilters q={filters.q} onChange={(q) => onChange({ q })} />
        {props.hasFilters && (
          <button
            type="button"
            onClick={props.onClearAll}
            className="h-6 px-1 text-[12px] font-semibold text-brand-text hover:text-brand-hover"
          >
            Clear filters
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          onClick={props.onExport}
          disabled={props.exportCount === 0}
          title={`Export ${props.exportCount} payments as CSV`}
        >
          <Share className="size-3.5" strokeWidth={2.25} aria-hidden />
          Export
        </Button>
        <EditColumns
          columns={props.columns}
          visibility={props.columnVisibility}
          onChange={props.onColumnVisibilityChange}
        />
      </div>
    </div>
  );
}
