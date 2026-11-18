"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DateCell } from "@/components/payments/cells/DateCell";
import { formatAmount, formatCurrencyCode } from "@/lib/format";
import {
  getBalanceSummary,
  getBalanceTransactions,
  type BalanceTransaction,
  type BalanceTxnType,
} from "@/lib/mock/treasury";
import { DataTable, MoneyCell, StatTile, ToneBadge, useNow, type DataColumn, type Tone } from "../payouts/shared";

const TYPE: Record<BalanceTxnType, { label: string; tone: Tone }> = {
  charge: { label: "Charge", tone: "success" },
  refund: { label: "Refund", tone: "neutral" },
  dispute: { label: "Dispute", tone: "warning" },
  payout: { label: "Payout", tone: "info" },
  topup: { label: "Top-up", tone: "info" },
  transfer: { label: "Transfer", tone: "neutral" },
};

const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/** Daily net volume, last 30 days: simple bars with a hover readout. */
function NetVolumeChart({ daily }: { daily: { day: number; net: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 140;
  const max = Math.max(1, ...daily.map((d) => d.net));
  const barW = W / daily.length;
  const total = daily.reduce((s, d) => s + d.net, 0);
  const shown = hover !== null ? daily[hover] : null;

  return (
    <div className="mt-6 rounded-lg px-4 pt-3 pb-2 shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[13px] font-medium text-subdued">Net volume from sales</div>
          <div className="tabular mt-0.5 text-[20px] leading-7 font-semibold text-ink-strong">
            {formatAmount(shown ? shown.net : total, "usd")}
          </div>
        </div>
        <div className="text-[12px] text-subdued">
          {shown
            ? dayLabel.format(shown.day)
            : `${dayLabel.format(daily[0].day)} – ${dayLabel.format(daily[daily.length - 1].day)}`}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 h-[140px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Net volume over the last 30 days: ${formatAmount(total, "usd")}`}
        onMouseLeave={() => setHover(null)}
      >
        <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--color-border)" />
        {daily.map((d, i) => {
          const h = Math.max(2, (Math.max(d.net, 0) / max) * (H - 8));
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)}>
              <rect x={i * barW} y={0} width={barW} height={H} fill="transparent" />
              <rect
                x={i * barW + barW * 0.18}
                y={H - h}
                width={barW * 0.64}
                height={h}
                rx={2}
                fill={hover === i ? "var(--color-brand-hover)" : "var(--color-brand)"}
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function BalancesView() {
  const now = useNow();
  const summary = useMemo(() => (now === null ? null : getBalanceSummary(now)), [now]);
  const txns = useMemo(() => (now === null ? null : getBalanceTransactions(now).slice(0, 100)), [now]);

  const columns: DataColumn<BalanceTransaction>[] = [
    {
      id: "type",
      header: "Type",
      width: 110,
      cell: (t) => <ToneBadge tone={TYPE[t.type].tone}>{TYPE[t.type].label}</ToneBadge>,
    },
    {
      id: "amount",
      header: "Amount",
      width: 140,
      align: "right",
      cell: (t) => <MoneyCell amount={formatAmount(t.amount, t.currency)} code={formatCurrencyCode(t.currency)} />,
    },
    {
      id: "net",
      header: "Net",
      width: 120,
      align: "right",
      cell: (t) => <span className="tabular font-semibold text-ink-strong">{formatAmount(t.net, t.currency)}</span>,
    },
    {
      id: "description",
      header: "Description",
      width: 340,
      cell: (t) =>
        t.source.startsWith("pi_") ? (
          <Link href={`/payments/${t.source}`} className="truncate hover:text-brand-text">
            {t.description}
          </Link>
        ) : (
          <span className="truncate">{t.description}</span>
        ),
    },
    { id: "created", header: "Created", width: 150, cell: (t) => <DateCell ts={t.created} now={now ?? 0} /> },
    {
      id: "available",
      header: "Available on",
      width: 150,
      cell: (t) => <DateCell ts={t.availableOn} now={now ?? 0} />,
    },
  ];

  return (
    <div className="pb-6">
      <h1 className="pt-4 text-[28px] leading-8 font-bold tracking-[-0.01em] text-ink-strong">Balances</h1>

      {summary && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile
              label="Available to pay out"
              value={formatAmount(summary.available, "usd")}
              hint="USD · Paid out every 2 days"
            />
            <StatTile
              label="Incoming"
              value={formatAmount(summary.pending, "usd")}
              hint="Pending, available in ~2 days"
            />
            <StatTile
              label="In transit to bank"
              value={formatAmount(summary.inTransitToBank, "usd")}
              hint="STRIPE TEST BANK •••• 6789"
            />
          </div>
          <NetVolumeChart daily={summary.daily} />
        </>
      )}

      <h2 className="mt-8 text-[16px] leading-6 font-bold text-ink-strong">Recent activity</h2>
      <DataTable
        label="Recent balance activity"
        columns={columns}
        rows={txns}
        getRowId={(t) => t.id}
        emptyText="No balance activity yet."
      />
    </div>
  );
}
