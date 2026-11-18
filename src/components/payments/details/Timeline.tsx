import { Ban, Check, Clock3, CornerUpLeft, Hourglass, Plus, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { formatFullDate, formatRelative } from "@/lib/format";
import type { PaymentEvent, PaymentEventType } from "@/lib/types";

const EVENT_STYLE: Record<PaymentEventType, { icon: LucideIcon; className: string }> = {
  created: { icon: Plus, className: "bg-offset-strong text-subdued" },
  authorized: { icon: Check, className: "bg-info-bg text-info-text" },
  succeeded: { icon: Check, className: "bg-success-bg text-success-text" },
  failed: { icon: X, className: "bg-danger-bg text-danger-text" },
  blocked: { icon: Ban, className: "bg-danger-bg text-danger-text" },
  canceled: { icon: X, className: "bg-neutral-bg text-neutral-text" },
  refunded: { icon: CornerUpLeft, className: "bg-neutral-bg text-neutral-text" },
  disputed: { icon: TriangleAlert, className: "bg-warning-bg text-warning-text" },
  pending: { icon: Clock3, className: "bg-info-bg text-info-text" },
};

export function Timeline({ events, now }: { events: PaymentEvent[]; now: number }) {
  return (
    <ol className="relative">
      {events.map((event, i) => {
        const { icon: Icon, className } = EVENT_STYLE[event.type] ?? { icon: Hourglass, className: "" };
        const last = i === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className="absolute top-6 bottom-0 left-[11px] w-px bg-border" aria-hidden />}
            <span
              className={cn("relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full", className)}
            >
              <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
            </span>
            <div className="pt-0.5">
              <p className="text-[14px] leading-5 font-medium text-ink-strong">{event.description}</p>
              <p className="text-[13px] leading-5 text-subdued">
                <time dateTime={new Date(event.at).toISOString()} title={formatRelative(event.at, now)}>
                  {formatFullDate(event.at)}
                </time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
