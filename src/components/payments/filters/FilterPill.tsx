"use client";

import { ChevronDown, CirclePlus, CircleX } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

interface FilterPillProps {
  label: string;
  /** Summary of the applied value; when set the pill renders as active. */
  value?: string | null;
  onClear?: () => void;
  /** Render prop so the panel can close the popover after applying. */
  children: (close: () => void) => ReactNode;
  contentClassName?: string;
}

export function FilterPill({ label, value, onClear, children, contentClassName }: FilterPillProps) {
  const [open, setOpen] = useState(false);
  const active = Boolean(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <span
        className={cn(
          "inline-flex h-6 items-center rounded-full text-[12px] leading-4 font-semibold text-ink transition-colors",
          active
            ? "border border-border-strong bg-white"
            : "border border-dashed border-border-strong hover:border-[#a3acba] hover:bg-offset/60",
          open && !active && "border-[#a3acba] bg-offset/60",
        )}
      >
        {active ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label} filter`}
            className="flex h-full items-center pr-0.5 pl-1.5 text-subdued hover:text-ink"
          >
            <CircleX className="size-3" strokeWidth={2.25} aria-hidden />
          </button>
        ) : null}
        <PopoverTrigger asChild>
          <button type="button" className={cn("flex h-full items-center gap-1 pr-2", active ? "pl-0.5" : "pl-1.5")}>
            {!active && <CirclePlus className="size-3 text-subdued" strokeWidth={2.25} aria-hidden />}
            <span>{label}</span>
            {active && (
              <>
                <span className="mx-0.5 h-3 w-px bg-border-strong" aria-hidden />
                <span className="max-w-[220px] truncate text-brand-text">{value}</span>
                <ChevronDown className="size-3 text-brand-text" strokeWidth={2.25} aria-hidden />
              </>
            )}
          </button>
        </PopoverTrigger>
      </span>
      <PopoverContent className={cn("w-[248px]", contentClassName)}>{children(() => setOpen(false))}</PopoverContent>
    </Popover>
  );
}

export function FilterPanel({
  title,
  children,
  onApply,
  applyDisabled,
}: {
  title: string;
  children: ReactNode;
  onApply: () => void;
  applyDisabled?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!applyDisabled) onApply();
      }}
    >
      <div className="px-3 pt-3 pb-2 text-[14px] leading-5 font-semibold text-ink-strong">{title}</div>
      <div className="px-3 pb-3">{children}</div>
      <div className="border-t border-border p-3">
        <Button type="submit" variant="primary" className="w-full" disabled={applyDisabled}>
          Apply
        </Button>
      </div>
    </form>
  );
}
