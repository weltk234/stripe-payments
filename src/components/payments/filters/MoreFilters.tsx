"use client";

import { useState } from "react";
import { FilterPanel, FilterPill } from "./FilterPill";
import { TextField } from "./fields";

/** Text search by payment ID, customer email or card last 4 (mirrors the top-bar search). */
export function MoreFilters({ q, onChange }: { q: string; onChange: (q: string) => void }) {
  return (
    <FilterPill label="More filters" value={q.trim() ? `“${q.trim()}”` : null} onClear={() => onChange("")}>
      {(close) => <Panel initial={q} onApply={(v) => (onChange(v), close())} />}
    </FilterPill>
  );
}

function Panel({ initial, onApply }: { initial: string; onApply: (q: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <FilterPanel title="Search payments" onApply={() => onApply(value.trim())}>
      <label className="flex flex-col gap-1 text-[12px] font-medium text-subdued">
        Payment ID, customer email or last 4
        <TextField
          autoFocus
          placeholder="pi_3…, jenny@example.com, 4242"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
    </FilterPanel>
  );
}
