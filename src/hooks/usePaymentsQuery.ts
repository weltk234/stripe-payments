"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { parseQuery, serializeQuery, type PaymentFilters, type PaymentsQuery } from "@/lib/filters";

export type QueryUpdate = Partial<Omit<PaymentsQuery, "filters">> & { filters?: Partial<PaymentFilters> };

/**
 * The URL is the single source of truth for table state, so any view can be
 * shared or reloaded. Filter changes reset to the first page.
 */
export function usePaymentsQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = useMemo(() => parseQuery(searchParams), [searchParams]);

  const update = useCallback(
    (patch: QueryUpdate) => {
      const next: PaymentsQuery = {
        ...query,
        ...patch,
        filters: { ...query.filters, ...patch.filters },
        page: patch.page ?? (patch.filters || patch.pageSize || patch.sort ? 1 : query.page),
      };
      // Keep `,` and `:` unescaped so shared links stay readable (both are valid in a query string).
      const qs = serializeQuery(next).toString().replace(/%2C/g, ",").replace(/%3A/g, ":");
      const target = pathname.startsWith("/payments/") ? "/payments" : pathname;
      router.replace(qs ? `${target}?${qs}` : target, { scroll: false });
    },
    [query, router, pathname],
  );

  return { query, update };
}
