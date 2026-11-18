"use client";

import { useMemo, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { useHydrated } from "@/hooks/useHydrated";

/**
 * Small building blocks shared by agent-C section pages (catalog, billing,
 * Connect, Tax, Issuing, Climate, Developers). Styling mirrors the Payments table.
 */

export function PageTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="pt-4 text-[28px] leading-8 font-bold tracking-[-0.01em] text-ink-strong">{children}</h1>
      {actions && <div className="flex items-center gap-2 pt-4">{actions}</div>}
    </div>
  );
}

/** `now` captured after hydration (0 before), plus the hydration flag. */
export function useNow() {
  const hydrated = useHydrated();
  const now = useMemo(() => (hydrated ? Date.now() : 0), [hydrated]);
  return { hydrated, now };
}

export interface Column<T> {
  header: string;
  width: number;
  align?: "left" | "right";
  cell: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = "No results found",
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
  className?: string;
}) {
  const minWidth = columns.reduce((sum, c) => sum + c.width, 0);
  return (
    <div className={cn("overflow-x-auto overscroll-x-contain", className)}>
      <table className="w-full table-fixed border-collapse text-[14px] leading-5" style={{ minWidth }}>
        <colgroup>
          {columns.map((c) => (
            <col key={c.header} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => (
              <th
                key={c.header}
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
          {rows.map((row) => (
            <tr key={rowKey(row)} className="h-9 border-b border-border hover:bg-offset">
              {columns.map((c) => (
                <td
                  key={c.header}
                  className={cn("overflow-hidden px-2 whitespace-nowrap text-ink", c.align === "right" && "text-right")}
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
      {rows.length === 0 && <p className="py-16 text-center text-[14px] text-subdued">{empty}</p>}
    </div>
  );
}

export type Tone = "success" | "danger" | "neutral" | "warning" | "info";

const TONE: Record<Tone, string> = {
  success: "bg-success-bg text-success-text border-success-border",
  danger: "bg-danger-bg text-danger-text border-danger-border",
  neutral: "bg-neutral-bg text-neutral-text border-neutral-border",
  warning: "bg-warning-bg text-warning-text border-warning-border",
  info: "bg-info-bg text-info-text border-info-border",
};

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
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

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-lg px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
      <div className="text-[13px] text-subdued">{label}</div>
      <div className="tabular mt-1 text-[20px] leading-7 font-semibold text-ink-strong">{value}</div>
      {hint && <div className="mt-0.5 text-[12px] text-subdued">{hint}</div>}
    </div>
  );
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-8 flex items-center justify-between border-b border-border pb-2">
      <h2 className="text-[16px] leading-6 font-bold text-ink-strong">{children}</h2>
      {action}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-brand" : "bg-border-strong",
      )}
    >
      <span
        className={cn(
          "absolute size-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[16px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

export const Dash = () => <span className="text-faint">—</span>;
