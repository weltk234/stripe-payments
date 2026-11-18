import { BankIcon, CARD_BRAND_ICON, WALLET_ICON } from "@/components/ui/icons/PaymentIcons";
import { describeMethod } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

/** Wallet mark (if any) + network/bank tile, right-aligned in a fixed slot, then `•••• 4242`. */
export function PaymentMethodCell({ method }: { method: PaymentMethod }) {
  const Brand = method.type === "ach" ? BankIcon : CARD_BRAND_ICON[method.brand];
  const Wallet = method.type === "wallet" ? WALLET_ICON[method.wallet] : null;
  return (
    <span className="flex items-center gap-1.5" title={describeMethod(method)}>
      <span className="flex w-10 items-center justify-end gap-1">
        {Wallet && <Wallet />}
        <Brand />
      </span>
      <span className="tabular whitespace-nowrap text-ink">
        <span className="tracking-[0.08em]">••••</span> {method.last4}
      </span>
    </span>
  );
}
