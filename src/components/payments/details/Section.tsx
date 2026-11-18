import type { ReactNode } from "react";

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="text-[16px] leading-6 font-bold text-ink-strong">{title}</h2>
        {action}
      </div>
      <div className="pt-3">{children}</div>
    </section>
  );
}

export function KeyValueList({
  items,
  labelWidth = 180,
}: {
  items: { label: string; value: ReactNode }[];
  labelWidth?: number;
}) {
  return (
    <dl
      className="grid gap-x-6 gap-y-2.5 text-[14px] leading-5"
      style={{ gridTemplateColumns: `${labelWidth}px minmax(0, 1fr)` }}
    >
      {items.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="text-subdued">{label}</dt>
          <dd className="min-w-0 truncate text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
