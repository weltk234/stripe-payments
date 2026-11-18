import { Ban, Check, Clock3, CornerUpLeft, Hourglass, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { STATUS_LABEL } from "@/lib/format";
import type { PaymentStatus } from "@/lib/types";

type Tone = "success" | "danger" | "neutral" | "warning" | "info";

const STATUS_STYLE: Record<PaymentStatus, { tone: Tone; icon: LucideIcon }> = {
  succeeded: { tone: "success", icon: Check },
  failed: { tone: "danger", icon: X },
  blocked: { tone: "danger", icon: Ban },
  canceled: { tone: "neutral", icon: X },
  refunded: { tone: "neutral", icon: CornerUpLeft },
  pending: { tone: "info", icon: Clock3 },
  disputed: { tone: "warning", icon: TriangleAlert },
  uncaptured: { tone: "neutral", icon: Hourglass },
};

const TONE: Record<Tone, string> = {
  success: "bg-success-bg text-success-text border-success-border",
  danger: "bg-danger-bg text-danger-text border-danger-border",
  neutral: "bg-neutral-bg text-neutral-text border-neutral-border",
  warning: "bg-warning-bg text-warning-text border-warning-border",
  info: "bg-info-bg text-info-text border-info-border",
};

export function StatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const { tone, icon: Icon } = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center gap-1 rounded-[4px] border px-[5px] text-[12px] leading-4 font-medium whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {STATUS_LABEL[status]}
      <Icon className="size-3" strokeWidth={2.5} aria-hidden />
    </span>
  );
}
