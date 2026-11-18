"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import { formatDate, formatFullDate, formatRelative } from "@/lib/format";

export function DateCell({ ts, now }: { ts: number; now: number }) {
  return (
    <Tooltip
      content={
        <span className="flex flex-col">
          <span className="font-semibold text-ink-strong">{formatRelative(ts, now)}</span>
          <span className="text-subdued">{formatFullDate(ts)}</span>
        </span>
      }
    >
      <time
        dateTime={new Date(ts).toISOString()}
        className="tabular block min-w-0 cursor-default truncate text-ink"
        tabIndex={0}
      >
        {formatDate(ts, now)}
      </time>
    </Tooltip>
  );
}
