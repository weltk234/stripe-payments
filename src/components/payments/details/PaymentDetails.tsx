"use client";

import { ChevronRight, Ellipsis, RotateCcw } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";
import { describeMethod, formatAmount, formatCurrencyCode, formatDate, formatRelative } from "@/lib/format";
import { getPayment } from "@/lib/paymentsService";
import type { Payment } from "@/lib/types";
import { CopyId } from "../cells/CopyId";
import { PaymentMethodCell } from "../cells/PaymentMethodCell";
import { StatusBadge } from "../cells/StatusBadge";
import { KeyValueList, Section } from "./Section";
import { Timeline } from "./Timeline";

/** Stripe's standard US pricing, used for an illustrative fee breakdown. */
function fees(p: Payment) {
  if (p.status !== "succeeded" && p.status !== "refunded" && p.status !== "disputed") return null;
  const fee = Math.round(p.amount * 0.029) + 30;
  const refunded = p.status === "refunded" ? p.amount : 0;
  return { fee, refunded, net: p.amount - fee - refunded };
}

function riskLabel(score: number) {
  if (score >= 75) return { label: "Highest", className: "text-danger-text" };
  if (score >= 65) return { label: "Elevated", className: "text-warning-text" };
  return { label: "Normal", className: "text-success-text" };
}

export function PaymentDetails({ id }: { id: string }) {
  const hydrated = useHydrated();
  const now = useMemo(() => (hydrated ? Date.now() : 0), [hydrated]);
  const payment = hydrated ? getPayment(id, now) : undefined;

  if (!hydrated) return <div className="h-[600px]" aria-busy="true" />;
  if (!payment) notFound();

  const breakdown = fees(payment);
  const risk = riskLabel(payment.riskScore);
  const lastEvent = payment.events[0];

  return (
    <div className="pb-16">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 pt-4 text-[14px] font-medium">
        <Link href="/payments" className="text-brand-text hover:text-brand-hover">
          Payments
        </Link>
        <ChevronRight className="size-3.5 text-subdued" aria-hidden />
        <span className="font-mono text-[13px] text-subdued">{payment.id}</span>
      </nav>

      <header className="mt-3 flex items-start justify-between gap-6">
        <div>
          <p className="text-[13px] font-medium text-subdued">Payment</p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-[28px] leading-8 font-bold text-ink-strong tabular">
              {formatAmount(payment.amount, payment.currency)}{" "}
              <span className="font-normal text-subdued">{formatCurrencyCode(payment.currency)}</span>
            </h1>
            <StatusBadge status={payment.status} />
          </div>
          <div className="mt-2">
            <CopyId id={payment.id} shorten={false} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={payment.status !== "succeeded"}>
            <RotateCcw className="size-3.5" strokeWidth={2.25} aria-hidden />
            Refund
          </Button>
          <Button aria-label="More actions" className="w-8 px-0">
            <Ellipsis className="size-4" aria-hidden />
          </Button>
        </div>
      </header>

      <dl className="mt-6 flex divide-x divide-border border-y border-border py-3 text-[14px]">
        {[
          { label: "Last update", value: lastEvent ? formatDate(lastEvent.at, now) : "—" },
          { label: "Customer", value: payment.customer.email },
          { label: "Payment method", value: <PaymentMethodCell method={payment.method} /> },
          {
            label: "Risk evaluation",
            value: (
              <span className={risk.className}>
                {risk.label} <span className="text-subdued">· {payment.riskScore}</span>
              </span>
            ),
          },
        ].map(({ label, value }) => (
          <div key={label} className="min-w-0 px-4 first:pl-0">
            <dt className="text-[13px] text-subdued">{label}</dt>
            <dd className="mt-0.5 truncate text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <Section title="Timeline">
            <Timeline events={payment.events} now={now} />
          </Section>

          {breakdown && (
            <Section title="Payment breakdown">
              <KeyValueList
                items={[
                  { label: "Payment amount", value: formatAmount(payment.amount, payment.currency) },
                  { label: "Stripe processing fees", value: `-${formatAmount(breakdown.fee, payment.currency)}` },
                  ...(breakdown.refunded
                    ? [{ label: "Refunded", value: `-${formatAmount(breakdown.refunded, payment.currency)}` }]
                    : []),
                  {
                    label: "Net amount",
                    value: (
                      <span className="font-semibold text-ink-strong">
                        {formatAmount(breakdown.net, payment.currency)} {formatCurrencyCode(payment.currency)}
                      </span>
                    ),
                  },
                ]}
              />
            </Section>
          )}

          <Section title="Payment method">
            <KeyValueList
              items={[
                {
                  label: "ID",
                  value: <span className="font-mono text-[13px]">{`pm_1${payment.id.slice(4, 18)}`}</span>,
                },
                { label: "Number", value: `•••• ${payment.method.last4}` },
                { label: "Type", value: describeMethod(payment.method) },
                { label: "Owner email", value: payment.customer.email },
                ...(payment.declineReason ? [{ label: "Decline reason", value: payment.declineReason }] : []),
              ]}
            />
          </Section>

          <Section title="Metadata">
            <KeyValueList items={Object.entries(payment.metadata).map(([label, value]) => ({ label, value }))} />
          </Section>
        </div>

        <aside className="min-w-0">
          <Section title="Details">
            <KeyValueList
              labelWidth={96}
              items={[
                { label: "Payment ID", value: <CopyId id={payment.id} /> },
                {
                  label: "Created",
                  value: <span title={formatRelative(payment.created, now)}>{formatDate(payment.created, now)}</span>,
                },
                { label: "Description", value: payment.description },
                { label: "Statement", value: "CRAMLY.AI" },
              ]}
            />
          </Section>
          <Section title="Customer">
            <div className="flex flex-col gap-0.5 text-[14px]">
              <span className="font-medium text-ink-strong">{payment.customer.name}</span>
              <span className="text-subdued">{payment.customer.email}</span>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
