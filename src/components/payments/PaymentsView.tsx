"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { usePaymentsQuery } from "@/hooks/usePaymentsQuery";
import { downloadCsv } from "@/lib/csv";
import { EMPTY_FILTERS, hasActiveFilters, type SortKey } from "@/lib/filters";
import { queryPayments } from "@/lib/paymentsService";
import { EmptyState } from "./EmptyState";
import { FilterBar } from "./FilterBar";
import { InfoBanner } from "./InfoBanner";
import { PaymentsHeader } from "./PaymentsHeader";
import { PaymentsTable } from "./PaymentsTable";
import { nextSort } from "./SortHeader";
import { StatusCards } from "./StatusCards";
import { SubTabs } from "./SubTabs";
import { TablePagination } from "./TablePagination";
import { TableSkeleton } from "./TableSkeleton";

const HIDEABLE_COLUMNS = [
  { id: "method", label: "Payment method" },
  { id: "description", label: "Description" },
  { id: "customer", label: "Customer" },
  { id: "refundedAt", label: "Refunded date" },
  { id: "declineReason", label: "Decline reason" },
  { id: "id", label: "Payment ID" },
];
const COLUMNS_KEY = "payments:columns";

function useColumnVisibility() {
  const [visibility, setVisibility] = useState<VisibilityState>({});
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_KEY);
      if (saved) setVisibility(JSON.parse(saved) as VisibilityState);
    } catch {
      /* ignore */
    }
  }, []);
  const update = useCallback((v: VisibilityState) => {
    setVisibility(v);
    try {
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }, []);
  return [visibility, update] as const;
}

export function PaymentsView() {
  const { query, update } = usePaymentsQuery();
  const hydrated = useHydrated();
  // Captured once after hydration so the server render never depends on the clock or time zone.
  const now = useMemo(() => (hydrated ? Date.now() : 0), [hydrated]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibility();

  const result = useMemo(() => (hydrated ? queryPayments(query, now) : null), [hydrated, query, now]);
  const filtered = hasActiveFilters(query.filters);
  const clearAll = () => update({ filters: EMPTY_FILTERS });

  return (
    <div className="pb-6">
      <PaymentsHeader />
      <SubTabs />
      <InfoBanner />
      <StatusCards
        selected={query.filters.status}
        counts={result?.statusCounts ?? {}}
        onSelect={(status) => update({ filters: { status } })}
      />
      <FilterBar
        filters={query.filters}
        onChange={(filters) => update({ filters })}
        onClearAll={clearAll}
        hasFilters={filtered}
        onExport={() => result && downloadCsv(result.matching)}
        exportCount={result?.total ?? 0}
        columns={HIDEABLE_COLUMNS}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
      />
      {result ? (
        <>
          <PaymentsTable
            rows={result.rows}
            now={now}
            sort={query.sort}
            onSort={(key: SortKey, additive) => update({ sort: nextSort(query.sort, key, additive) })}
            columnVisibility={columnVisibility}
            empty={<EmptyState filtered={filtered} onClear={clearAll} />}
          />
          <TablePagination
            page={result.page}
            pageSize={query.pageSize}
            pageCount={result.pageCount}
            total={result.total}
            onPageChange={(page) => update({ page })}
            onPageSizeChange={(pageSize) => update({ pageSize })}
          />
        </>
      ) : (
        <TableSkeleton />
      )}
    </div>
  );
}
