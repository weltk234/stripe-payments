"use client";

import { useState, type ReactNode } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { FilterPanel, FilterPill } from "./FilterPill";

export interface Option<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface CheckboxListFilterProps<T extends string> {
  label: string;
  title: string;
  options: readonly Option<T>[];
  selected: readonly T[];
  onChange: (values: T[]) => void;
}

/** Multi-select filter shared by Status, Payment method and Currency. */
export function CheckboxListFilter<T extends string>({
  label,
  title,
  options,
  selected,
  onChange,
}: CheckboxListFilterProps<T>) {
  const summary = selected.length
    ? options
        .filter((o) => selected.includes(o.value))
        .map((o) => o.label)
        .join(", ")
    : null;

  return (
    <FilterPill label={label} value={summary} onClear={() => onChange([])}>
      {(close) => <Panel title={title} options={options} initial={selected} onApply={(v) => (onChange(v), close())} />}
    </FilterPill>
  );
}

function Panel<T extends string>({
  title,
  options,
  initial,
  onApply,
}: {
  title: string;
  options: readonly Option<T>[];
  initial: readonly T[];
  onApply: (values: T[]) => void;
}) {
  const [draft, setDraft] = useState<Set<T>>(() => new Set(initial));
  const toggle = (value: T, on: boolean) =>
    setDraft((prev) => {
      const next = new Set(prev);
      if (on) next.add(value);
      else next.delete(value);
      return next;
    });

  return (
    <FilterPanel title={title} onApply={() => onApply(options.map((o) => o.value).filter((v) => draft.has(v)))}>
      <ul className="-mx-1 flex max-h-[260px] flex-col overflow-y-auto">
        {options.map((o) => {
          const id = `opt-${title}-${o.value}`.replace(/\s+/g, "-");
          return (
            <li key={o.value}>
              <label
                htmlFor={id}
                className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-1 hover:bg-offset"
              >
                <Checkbox id={id} checked={draft.has(o.value)} onCheckedChange={(v) => toggle(o.value, v === true)} />
                {o.icon}
                <span className="text-[14px] text-ink">{o.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </FilterPanel>
  );
}
