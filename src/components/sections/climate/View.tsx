"use client";

import { Leaf } from "lucide-react";
import { useMemo, useState } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { formatAmount, toUsdEstimate } from "@/lib/format";
import { CLIMATE_PROJECTS } from "@/lib/mock/catalog";
import { getAllPayments } from "@/lib/paymentsService";
import { PageTitle, SectionHeading, StatTile, useNow } from "../product-catalog/ui";

/** Frontier's offtake price used to estimate tonnes removed, in USD per tonne. */
const PRICE_PER_TONNE = 500;
const OPTIONS = [0.5, 1, 1.5, 2] as const;

export function ClimateView() {
  const { hydrated, now } = useNow();
  const [rate, setRate] = useState<number>(1);
  const revenueUsd = useMemo(
    () =>
      hydrated
        ? getAllPayments(now)
            .filter((p) => p.status === "succeeded")
            .reduce((sum, p) => sum + toUsdEstimate(p.amount, p.currency), 0)
        : 0,
    [hydrated, now],
  );
  const contributed = revenueUsd * (rate / 100);
  const tonnes = contributed / PRICE_PER_TONNE;

  return (
    <div className="pb-6">
      <PageTitle>Climate</PageTitle>
      {hydrated ? (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile label="Contribution" value={`${rate}% of revenue`} />
            <StatTile label="Contributed (90d)" value={formatAmount(Math.round(contributed * 100), "usd")} />
            <StatTile
              label="Carbon removed"
              value={`${tonnes.toFixed(2)} t`}
              hint={`At ~$${PRICE_PER_TONNE} per tonne of CO₂`}
            />
          </div>

          <SectionHeading>Contribution rate</SectionHeading>
          <fieldset className="mt-4">
            <legend className="sr-only">Share of revenue contributed to carbon removal</legend>
            <div className="flex gap-2">
              {OPTIONS.map((o) => {
                const checked = o === rate;
                return (
                  <label
                    key={o}
                    className={`flex h-9 cursor-pointer items-center gap-2 rounded-lg px-4 text-[14px] ${
                      checked
                        ? "font-medium text-brand-text shadow-[inset_0_0_0_1.5px_var(--color-brand)]"
                        : "text-ink shadow-[inset_0_0_0_1px_var(--color-border-strong)] hover:bg-offset"
                    }`}
                  >
                    <input
                      type="radio"
                      name="climate-rate"
                      value={o}
                      checked={checked}
                      onChange={() => setRate(o)}
                      className="sr-only"
                    />
                    {o}%
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-[13px] text-subdued">
              Changes apply to new payments. Contributions are made from your Stripe balance.
            </p>
          </fieldset>

          <SectionHeading>Projects you support</SectionHeading>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {CLIMATE_PROJECTS.map((p) => (
              <li
                key={p.name}
                className="flex gap-3 rounded-lg p-4 shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ background: p.color }}
                  aria-hidden
                >
                  <Leaf className="size-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink-strong">{p.name}</p>
                  <p className="text-[12px] text-subdued">
                    {p.pathway} · {p.location}
                  </p>
                  <p className="mt-1 text-[13px] text-ink">{p.description}</p>
                  <p className="tabular mt-2 text-[12px] font-medium text-ink-strong">
                    {Math.round(p.share * 100)}% of contributions · {(tonnes * p.share).toFixed(2)} t
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <TableSkeleton rows={6} />
      )}
    </div>
  );
}
