export function TableSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <div className="mt-[11px]" aria-busy="true" aria-label="Loading payments">
      <div className="h-[34px] border-b border-border" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex h-9 items-center gap-6 border-b border-border px-2">
          <div className="h-3 w-[60px] animate-pulse rounded bg-offset-strong" />
          <div className="h-3 w-[90px] animate-pulse rounded bg-offset" />
          <div className="h-3 w-[120px] animate-pulse rounded bg-offset" />
          <div className="h-3 w-[200px] animate-pulse rounded bg-offset" />
        </div>
      ))}
    </div>
  );
}
