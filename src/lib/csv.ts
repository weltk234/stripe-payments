import { describeMethod, formatCurrencyCode, STATUS_LABEL, toMajorUnits } from "@/lib/format";
import type { Payment } from "@/lib/types";

const COLUMNS: { header: string; value: (p: Payment) => string | number }[] = [
  { header: "id", value: (p) => p.id },
  { header: "Amount", value: (p) => toMajorUnits(p.amount, p.currency) },
  { header: "Currency", value: (p) => formatCurrencyCode(p.currency) },
  { header: "Status", value: (p) => STATUS_LABEL[p.status] },
  { header: "Payment method", value: (p) => describeMethod(p.method) },
  { header: "Description", value: (p) => p.description },
  { header: "Customer Email", value: (p) => p.customer.email },
  { header: "Created date (UTC)", value: (p) => new Date(p.created).toISOString() },
  { header: "Refunded date (UTC)", value: (p) => (p.refundedAt ? new Date(p.refundedAt).toISOString() : "") },
  { header: "Decline reason", value: (p) => p.declineReason ?? "" },
];

/** RFC 4180 escaping, plus a guard against spreadsheet formula injection. */
export function escapeCsv(value: string | number): string {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s) && typeof value === "string") s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function paymentsToCsv(payments: readonly Payment[]): string {
  const lines = [COLUMNS.map((c) => escapeCsv(c.header)).join(",")];
  for (const p of payments) lines.push(COLUMNS.map((c) => escapeCsv(c.value(p))).join(","));
  return lines.join("\r\n");
}

export function downloadCsv(payments: readonly Payment[], now = new Date()) {
  const blob = new Blob([paymentsToCsv(payments)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payments-${now.toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
