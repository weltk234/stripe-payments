"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";
import type { DateFilter as DateFilterValue, DatePreset } from "@/lib/filters";
import { FilterPanel, FilterPill } from "./FilterPill";
import { TextField } from "./fields";

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
];

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const fmt = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return shortDate.format(new Date(y, m - 1, d));
};

export function summarizeDate(filter: DateFilterValue | null): string | null {
  if (!filter) return null;
  if (filter.preset !== "custom") return PRESETS.find((p) => p.value === filter.preset)!.label;
  if (filter.from && filter.to) return `${fmt(filter.from)} – ${fmt(filter.to)}`;
  if (filter.from) return `On or after ${fmt(filter.from)}`;
  if (filter.to) return `Before ${fmt(filter.to)}`;
  return null;
}

export function DateFilter({
  value,
  onChange,
}: {
  value: DateFilterValue | null;
  onChange: (v: DateFilterValue | null) => void;
}) {
  return (
    <FilterPill label="Date and time" value={summarizeDate(value)} onClear={() => onChange(null)}>
      {(close) => <Panel initial={value} onApply={(v) => (onChange(v), close())} />}
    </FilterPill>
  );
}

function Panel({
  initial,
  onApply,
}: {
  initial: DateFilterValue | null;
  onApply: (v: DateFilterValue | null) => void;
}) {
  const [preset, setPreset] = useState<DatePreset>(initial?.preset ?? "7d");
  const [from, setFrom] = useState(initial?.preset === "custom" ? (initial.from ?? "") : "");
  const [to, setTo] = useState(initial?.preset === "custom" ? (initial.to ?? "") : "");
  const invalidRange = preset === "custom" && Boolean(from && to && from > to);
  const emptyCustom = preset === "custom" && !from && !to;

  return (
    <FilterPanel
      title="Filter by date and time"
      applyDisabled={invalidRange || emptyCustom}
      onApply={() => onApply(preset === "custom" ? { preset, from: from || null, to: to || null } : { preset })}
    >
      <div role="radiogroup" aria-label="Date range" className="grid grid-cols-2 gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={preset === p.value}
            onClick={() => setPreset(p.value)}
            className={cn(
              "h-8 rounded-md text-[13px] font-medium transition-shadow",
              preset === p.value
                ? "text-brand-text shadow-[inset_0_0_0_1.5px_var(--color-brand)]"
                : "text-ink shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-offset",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-[12px] font-medium text-subdued">
            From
            <TextField type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-[12px] font-medium text-subdued">
            To
            <TextField type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </label>
          {invalidRange && (
            <p className="col-span-2 text-[12px] text-danger-text">Start date must be before end date.</p>
          )}
        </div>
      )}
    </FilterPanel>
  );
}
