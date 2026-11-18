"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import type { SortKey, SortSpec } from "@/lib/filters";

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  sort: SortSpec[];
  align?: "left" | "right";
  hideLabel?: boolean;
  onSort: (key: SortKey, additive: boolean) => void;
}

/** Click sorts by this column; Shift+click adds it as a secondary sort (multi-column). */
export function SortHeader({ label, sortKey, sort, align = "left", hideLabel, onSort }: SortHeaderProps) {
  const index = sort.findIndex((s) => s.key === sortKey);
  const spec = index >= 0 ? sort[index] : null;
  const Icon = spec ? (spec.desc ? ArrowDown : ArrowUp) : ArrowUpDown;
  const direction = spec ? (spec.desc ? "descending" : "ascending") : "none";

  const button = (
    <button
      type="button"
      onClick={(e) => onSort(sortKey, e.shiftKey)}
      aria-label={`Sort by ${label}${spec ? `, currently ${direction}` : ""}. Shift-click to add to the sort.`}
      className={cn(
        "group/sort -mx-1 inline-flex h-6 items-center gap-1 rounded px-1 hover:text-ink-strong",
        align === "right" && "flex-row-reverse",
      )}
    >
      {!hideLabel && <span>{label}</span>}
      {hideLabel && spec && <span className="text-subdued">{label}</span>}
      <Icon
        className={cn(
          "size-3 transition-opacity",
          spec
            ? "text-ink opacity-100"
            : "text-subdued opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100",
          hideLabel && !spec && "opacity-40",
        )}
        strokeWidth={2.5}
        aria-hidden
      />
      {spec && sort.length > 1 && <span className="text-[10px] leading-none text-subdued tabular">{index + 1}</span>}
    </button>
  );

  return hideLabel ? <Tooltip content={`Sort by ${label.toLowerCase()}`}>{button}</Tooltip> : button;
}

/** Next sort state for a header click. */
export function nextSort(current: SortSpec[], key: SortKey, additive: boolean): SortSpec[] {
  const existing = current.find((s) => s.key === key);
  const toggled: SortSpec = existing ? { key, desc: !existing.desc } : { key, desc: key !== "status" };
  if (!additive) return [toggled];
  return existing ? current.map((s) => (s.key === key ? toggled : s)) : [...current, toggled];
}
