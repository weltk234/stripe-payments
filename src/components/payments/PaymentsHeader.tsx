import { ChartColumn, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PaymentsHeader() {
  return (
    <div className="flex items-center justify-between pt-4">
      <h1 className="text-[28px] leading-8 font-bold tracking-[-0.01em] text-ink-strong">Transactions</h1>
      <div className="flex items-center gap-2">
        <Button variant="primary">
          <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
          Create payment
        </Button>
        <Button>
          <ChartColumn className="size-3.5" strokeWidth={2.25} aria-hidden />
          Analyze
        </Button>
      </div>
    </div>
  );
}
