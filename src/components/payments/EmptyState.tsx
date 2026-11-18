import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({ onClear, filtered }: { onClear: () => void; filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-offset">
        <Search className="size-4 text-subdued" strokeWidth={2.25} aria-hidden />
      </span>
      <p className="text-[16px] font-semibold text-ink-strong">No results found</p>
      <p className="text-[14px] text-subdued">
        {filtered ? "There aren’t any payments matching those filters." : "There aren’t any payments yet."}
      </p>
      {filtered && (
        <Button className="mt-2" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
