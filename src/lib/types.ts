export const PAYMENT_STATUSES = [
  "succeeded",
  "pending",
  "failed",
  "refunded",
  "canceled",
  "blocked",
  "disputed",
  "uncaptured",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const CURRENCIES = ["usd", "eur", "gbp", "brl", "cad", "jpy"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CARD_BRANDS = ["visa", "mastercard", "amex", "discover"] as const;
export type CardBrand = (typeof CARD_BRANDS)[number];

export const PAYMENT_METHOD_TYPES = ["card", "ach", "wallet"] as const;
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export type WalletType = "apple_pay" | "google_pay" | "link";

/** Discriminated union on `type`, mirroring Stripe's `payment_method_details`. */
export type PaymentMethod =
  | { type: "card"; brand: CardBrand; last4: string }
  | { type: "ach"; bankName: string; last4: string }
  | { type: "wallet"; wallet: WalletType; brand: CardBrand; last4: string };

export type PaymentEventType =
  | "created"
  | "authorized"
  | "succeeded"
  | "failed"
  | "canceled"
  | "blocked"
  | "refunded"
  | "disputed"
  | "pending";

export interface PaymentEvent {
  id: string;
  type: PaymentEventType;
  /** Unix epoch, milliseconds. */
  at: number;
  description: string;
}

export interface Payment {
  /** Stripe-style PaymentIntent id, e.g. `pi_3NxA…`. */
  id: string;
  /** Amount in the currency's minor unit (cents), like Stripe. */
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  method: PaymentMethod;
  description: string;
  customer: { name: string; email: string };
  /** Unix epoch, milliseconds. */
  created: number;
  refundedAt: number | null;
  declineReason: string | null;
  riskScore: number;
  metadata: Record<string, string>;
  events: PaymentEvent[];
}
