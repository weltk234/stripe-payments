"use client";

import { cn } from "@/components/ui/cn";
import type { PaymentStatus } from "@/lib/types";

const CARDS: { label: string; status: PaymentStatus | null }[] = [
  { label: "All", status: null },
  { label: "Succeeded", status: "succeeded" },
  { label: "Refunded", status: "refunded" },
  { label: "Disputed", status: "disputed" },
  { label: "Failed", status: "failed" },
  { label: "Uncaptured", status: "uncaptured" },
];

interface StatusCardsProps {
  selected: PaymentStatus[];
  counts: Partial<Record<PaymentStatus | "all", number>>;
  onSelect: (status: PaymentStatus[]) => void;
}

/** Quick filters. They drive the same `status` URL param as the Status filter pill. */
export function StatusCards({ selected, counts, onSelect }: StatusCardsProps) {
  return (
    <div role="tablist" aria-label="Filter by status" className="mt-4 grid grid-cols-6 gap-2">
      {CARDS.map(({ label, status }) => {
        const active = status === null ? selected.length === 0 : selected.length === 1 && selected[0] === status;
        const count = counts[status ?? "all"] ?? 0;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${label} (${count})`}
            onClick={() => onSelect(status ? [status] : [])}
            className={cn(
              "flex h-11 items-center rounded-lg px-3 text-left text-[14px] leading-5 transition-shadow",
              active
                ? "font-medium text-brand-text shadow-[inset_0_0_0_1.5px_var(--color-brand)]"
                : "text-ink shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:shadow-[inset_0_0_0_1px_#a3acba]",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
