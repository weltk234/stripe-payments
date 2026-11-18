"use client";

import { useState } from "react";
import type { AmountFilter as AmountFilterValue, AmountOp } from "@/lib/filters";
import { FilterPanel, FilterPill } from "./FilterPill";
import { SelectField, TextField } from "./fields";

const OPS: { value: AmountOp; label: string }[] = [
  { value: "eq", label: "is equal to" },
  { value: "between", label: "is between" },
  { value: "gt", label: "is greater than" },
  { value: "lt", label: "is less than" },
];

const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function summarizeAmount(f: AmountFilterValue | null): string | null {
  if (!f) return null;
  switch (f.op) {
    case "between":
      return `${num.format(f.min)} – ${num.format(f.max)}`;
    case "eq":
      return `= ${num.format(f.value)}`;
    case "gt":
      return `> ${num.format(f.value)}`;
    case "lt":
      return `< ${num.format(f.value)}`;
  }
}

export function AmountFilter({
  value,
  onChange,
}: {
  value: AmountFilterValue | null;
  onChange: (v: AmountFilterValue | null) => void;
}) {
  return (
    <FilterPill label="Amount" value={summarizeAmount(value)} onClear={() => onChange(null)}>
      {(close) => <Panel initial={value} onApply={(v) => (onChange(v), close())} />}
    </FilterPill>
  );
}

const parse = (s: string) => (s.trim() === "" || !Number.isFinite(Number(s)) ? null : Number(s));

function Panel({ initial, onApply }: { initial: AmountFilterValue | null; onApply: (v: AmountFilterValue) => void }) {
  const [op, setOp] = useState<AmountOp>(initial?.op ?? "eq");
  const [a, setA] = useState(initial ? String(initial.op === "between" ? initial.min : initial.value) : "");
  const [b, setB] = useState(initial?.op === "between" ? String(initial.max) : "");
  const first = parse(a);
  const second = parse(b);
  const valid = op === "between" ? first !== null && second !== null : first !== null;

  return (
    <FilterPanel
      title="Filter by amount"
      applyDisabled={!valid}
      onApply={() =>
        onApply(
          op === "between"
            ? { op, min: Math.min(first!, second!), max: Math.max(first!, second!) }
            : { op, value: first! },
        )
      }
    >
      <div className="flex flex-col gap-2">
        <SelectField aria-label="Condition" value={op} onChange={(e) => setOp(e.target.value as AmountOp)}>
          {OPS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <div className="flex items-center gap-2">
          <TextField
            autoFocus
            inputMode="decimal"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            aria-label={op === "between" ? "Minimum amount" : "Amount"}
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
          {op === "between" && (
            <>
              <span className="text-[13px] text-subdued">and</span>
              <TextField
                inputMode="decimal"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                aria-label="Maximum amount"
                value={b}
                onChange={(e) => setB(e.target.value)}
              />
            </>
          )}
        </div>
        <p className="text-[12px] text-subdued">Compared in each payment’s own currency.</p>
      </div>
    </FilterPanel>
  );
}
