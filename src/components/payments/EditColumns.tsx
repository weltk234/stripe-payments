"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

export interface ColumnOption {
  id: string;
  label: string;
}

interface EditColumnsProps {
  columns: ColumnOption[];
  visibility: VisibilityState;
  onChange: (v: VisibilityState) => void;
}

export function EditColumns({ columns, visibility, onChange }: EditColumnsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <Settings className="size-3.5" strokeWidth={2.25} aria-hidden />
          Edit columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[220px] py-2">
        <div className="px-3 pb-1.5 text-[12px] font-medium text-subdued">Columns</div>
        <ul>
          {columns.map((c) => {
            const id = `col-toggle-${c.id}`;
            return (
              <li key={c.id}>
                <label
                  htmlFor={id}
                  className="mx-1 flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-[14px] hover:bg-offset"
                >
                  <Checkbox
                    id={id}
                    checked={visibility[c.id] !== false}
                    onCheckedChange={(v) => onChange({ ...visibility, [c.id]: v === true })}
                  />
                  {c.label}
                </label>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
