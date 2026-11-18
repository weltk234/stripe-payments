import { formatAmount, formatCurrencyCode } from "@/lib/format";
import type { Currency } from "@/lib/types";

export function AmountCell({ amount, currency }: { amount: number; currency: Currency }) {
  return (
    <span className="tabular font-semibold whitespace-nowrap text-ink-strong">{formatAmount(amount, currency)}</span>
  );
}

export function CurrencyCell({ currency }: { currency: Currency }) {
  return <span className="text-subdued">{formatCurrencyCode(currency)}</span>;
}
