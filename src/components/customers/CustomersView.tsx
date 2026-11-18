"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TablePagination } from "@/components/payments/TablePagination";
import { PaymentMethodCell } from "@/components/payments/cells/PaymentMethodCell";
import { DateCell } from "@/components/payments/cells/DateCell";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { formatAmount } from "@/lib/format";
import type { PageSize } from "@/lib/filters";
import { getCustomers } from "@/lib/paymentsService";

const HEADERS = [
  { label: "Name", width: 200 },
  { label: "Email", width: 260 },
  { label: "Default payment method", width: 190 },
  { label: "Payments", width: 90, right: true },
  { label: "Total spend", width: 120, right: true },
  { label: "Refunds", width: 80, right: true },
  { label: "Created", width: 150 },
] as const;

export function CustomersView() {
  const hydrated = useHydrated();
  const now = useMemo(() => (hydrated ? Date.now() : 0), [hydrated]);
  const customers = useMemo(() => (hydrated ? getCustomers(now) : []), [hydrated, now]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? customers.filter((c) => c.email.includes(q) || c.name.toLowerCase().includes(q)) : customers;
  }, [customers, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="pb-6">
      <h1 className="pt-4 text-[28px] leading-8 font-bold tracking-[-0.01em] text-ink-strong">Customers</h1>

      <div className="relative mt-6 w-[320px]">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subdued"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
          aria-label="Search customers"
          autoComplete="off"
          spellCheck={false}
          className="h-8 w-full rounded-md bg-white pr-3 pl-8 text-[14px] text-ink shadow-[var(--shadow-button)] outline-none placeholder:text-faint focus:shadow-[0_0_0_1px_var(--color-brand),0_0_0_4px_rgb(99_91_255/0.2)]"
        />
      </div>

      {!hydrated ? (
        <TableSkeleton />
      ) : (
        <>
          <div className="mt-[11px] overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-[14px] leading-5" style={{ minWidth: 1090 }}>
              <colgroup>
                {HEADERS.map((h) => (
                  <col key={h.label} style={{ width: h.width }} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  {HEADERS.map((h) => (
                    <th
                      key={h.label}
                      scope="col"
                      className={`h-[34px] px-2 text-[13px] font-semibold whitespace-nowrap text-ink ${"right" in h ? "text-right" : "text-left"}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.email} className="h-9 border-b border-border hover:bg-offset">
                    <td className="truncate px-2 font-medium text-ink-strong">
                      <Link
                        href={`/payments?q=${encodeURIComponent(c.email)}`}
                        className="hover:text-brand-text"
                        title={`View payments from ${c.name}`}
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="truncate px-2 text-ink">{c.email}</td>
                    <td className="px-2">
                      <PaymentMethodCell method={c.defaultMethod} />
                    </td>
                    <td className="tabular px-2 text-right text-ink">{c.paymentCount}</td>
                    <td className="tabular px-2 text-right font-semibold text-ink-strong">
                      {formatAmount(c.totalSpendUsd, "usd")}
                    </td>
                    <td className="tabular px-2 text-right text-ink">
                      {c.refundCount || <span className="text-faint">—</span>}
                    </td>
                    <td className="px-2">
                      <DateCell ts={c.firstPaymentAt} now={now} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="py-16 text-center text-[14px] text-subdued">No customers match “{search.trim()}”.</p>
            )}
          </div>
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
      )}
    </div>
  );
}
