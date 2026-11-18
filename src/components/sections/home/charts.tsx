import { cn } from "@/components/ui/cn";

/** Shared inline-SVG chart primitives for the analytics-style sections. */

export const PAGE_TITLE = "pt-4 text-[28px] leading-8 font-bold tracking-[-0.01em] text-ink-strong";
export const TH = "h-[34px] px-2 text-[13px] leading-4 font-semibold whitespace-nowrap text-ink";
export const TR = "h-9 border-b border-border hover:bg-offset";
export const TD = "overflow-hidden px-2 whitespace-nowrap text-ink";

const path = (values: number[], w: number, h: number, max: number, count = values.length) =>
  values
    .map((v, i) => {
      const x = count <= 1 ? 0 : (i / (count - 1)) * w;
      const y = h - (max === 0 ? 0 : (v / max) * h);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

export function LineChart({
  series,
  points,
  height = 160,
  ariaLabel,
}: {
  /** First series is drawn in brand color; others in a muted gray. */
  series: number[][];
  /** Number of x positions (series may be shorter, e.g. "today so far"). */
  points: number;
  height?: number;
  ariaLabel: string;
}) {
  const w = 600;
  const max = Math.max(1, ...series.flat());
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className="h-[160px] w-full overflow-visible"
      role="img"
      aria-label={ariaLabel}
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={0}
          x2={w}
          y1={height - f * height}
          y2={height - f * height}
          stroke="var(--color-border)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <line
        x1={0}
        x2={w}
        y1={height}
        y2={height}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {[...series].reverse().map((s, ri) => {
        const i = series.length - 1 - ri;
        return (
          <path
            key={i}
            d={path(s, w, height, max, points)}
            fill="none"
            stroke={i === 0 ? "var(--color-brand)" : "var(--color-faint)"}
            strokeWidth={i === 0 ? 2 : 1.5}
            strokeDasharray={i === 0 ? undefined : "4 3"}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 120;
  const h = 32;
  const max = Math.max(1, ...values);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-8 w-full", className)} aria-hidden>
      <path
        d={path(values, w, h - 2, max)}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function Change({ value }: { value: number }) {
  const rounded = Math.round(value * 10) / 10;
  const tone = rounded > 0 ? "text-success-text" : rounded < 0 ? "text-danger-text" : "text-subdued";
  return (
    <span className={cn("tabular text-[13px] font-medium", tone)}>
      {rounded > 0 ? "+" : ""}
      {rounded.toFixed(1)}%
    </span>
  );
}

export function HBarList({
  items,
  format,
}: {
  items: { key: string; label: string; value: number; hint?: string }[];
  format: (v: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((i) => (
        <li key={i.key}>
          <div className="flex items-baseline justify-between gap-3 text-[14px]">
            <span className="truncate text-ink">{i.label}</span>
            <span className="tabular shrink-0 text-ink-strong">
              {format(i.value)}
              {i.hint && <span className="ml-1.5 text-subdued">{i.hint}</span>}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-offset">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ColumnChart({
  items,
  ariaLabel,
  format,
}: {
  items: { key: string; label: string; value: number; secondary?: number }[];
  ariaLabel: string;
  format: (v: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value + (i.secondary ?? 0)));
  return (
    <div role="img" aria-label={ariaLabel} className="flex h-[200px] items-end gap-3 border-b border-border-strong">
      {items.map((i) => (
        <div
          key={i.key}
          className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
          title={`${i.label}: ${format(i.value)}`}
        >
          <span className="tabular mb-1 text-[12px] text-subdued opacity-0 transition-opacity group-hover:opacity-100">
            {format(i.value)}
          </span>
          {i.secondary ? (
            <div
              className="w-full max-w-[48px] rounded-t-[3px] bg-[#c4c0ff]"
              style={{ height: `${(i.secondary / max) * 85}%` }}
            />
          ) : null}
          <div
            className={cn("w-full max-w-[48px] bg-brand", i.secondary ? "" : "rounded-t-[3px]")}
            style={{ height: `${(i.value / max) * 85}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[14px] leading-5 font-semibold text-ink-strong">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Placeholder({ height = 400 }: { height?: number }) {
  return <div className="mt-6 animate-pulse rounded-lg bg-offset" style={{ height }} aria-busy="true" />;
}
