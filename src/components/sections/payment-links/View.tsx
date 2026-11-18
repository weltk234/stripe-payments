"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { DateCell } from "@/components/payments/cells/DateCell";
import { copyText } from "@/components/payments/cells/CopyId";
import { Tooltip } from "@/components/ui/Tooltip";
import { getPaymentLinks, type PaymentLink } from "@/lib/mock/catalog";
import { formatPrice } from "../product-catalog/View";
import { DataTable, PageTitle, Pill, Toggle, useNow, type Column } from "../product-catalog/ui";

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate text-brand-text">{url}</span>
      <Tooltip content={copied ? "Copied" : "Copy link"} open={copied ? true : undefined}>
        <button
          type="button"
          aria-label={`Copy link ${url}`}
          onClick={async () => {
            if (await copyText(`https://${url}`)) setCopied(true);
          }}
          className="flex size-5 shrink-0 items-center justify-center rounded text-subdued hover:bg-offset-strong hover:text-ink"
        >
          {copied ? (
            <Check className="size-3.5 text-success-text" strokeWidth={2.5} aria-hidden />
          ) : (
            <Copy className="size-3.5" strokeWidth={2} aria-hidden />
          )}
        </button>
      </Tooltip>
    </span>
  );
}

export function PaymentLinksView() {
  const { hydrated, now } = useNow();
  const links = useMemo(() => (hydrated ? getPaymentLinks(now) : []), [hydrated, now]);
  /** Local overrides of the `active` flag, keyed by link id. */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const isActive = (l: PaymentLink) => overrides[l.id] ?? l.active;

  const columns: Column<PaymentLink>[] = [
    { header: "Link", width: 300, cell: (l) => <CopyLink url={l.url} /> },
    {
      header: "Product",
      width: 200,
      cell: (l) => <span className="truncate font-medium text-ink-strong">{l.product}</span>,
    },
    { header: "Price", width: 150, cell: (l) => <span className="tabular">{formatPrice(l)}</span> },
    {
      header: "Status",
      width: 100,
      cell: (l) => (isActive(l) ? <Pill tone="success">Active</Pill> : <Pill tone="neutral">Inactive</Pill>),
    },
    {
      header: "Active",
      width: 80,
      cell: (l) => (
        <Toggle
          checked={isActive(l)}
          label={`${isActive(l) ? "Deactivate" : "Activate"} link for ${l.product}`}
          onChange={(v) => setOverrides((o) => ({ ...o, [l.id]: v }))}
        />
      ),
    },
    { header: "Created", width: 150, cell: (l) => <DateCell ts={l.created} now={now} /> },
  ];

  return (
    <div className="pb-6">
      <PageTitle>Payment links</PageTitle>
      {hydrated ? (
        <DataTable className="mt-6" columns={columns} rows={links} rowKey={(l) => l.id} />
      ) : (
        <TableSkeleton rows={10} />
      )}
    </div>
  );
}
