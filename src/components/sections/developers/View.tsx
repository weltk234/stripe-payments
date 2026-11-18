"use client";

import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { TableSkeleton } from "@/components/payments/TableSkeleton";
import { CopyId } from "@/components/payments/cells/CopyId";
import { DateCell } from "@/components/payments/cells/DateCell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { getDeveloperData, type ApiRequestLog, type WebhookEndpoint } from "@/lib/mock/catalog";
import { DataTable, PageTitle, Pill, SectionHeading, useNow, type Column } from "../product-catalog/ui";

const METHOD_CLASS: Record<ApiRequestLog["method"], string> = {
  GET: "text-info-text",
  POST: "text-success-text",
  DELETE: "text-danger-text",
};

function StatusCode({ code }: { code: number }) {
  const tone = code < 300 ? "success" : code < 500 ? "warning" : "danger";
  return (
    <Pill tone={tone}>
      <span className="tabular">{code}</span>{" "}
      {code < 300
        ? "OK"
        : code === 402
          ? "Payment required"
          : code === 404
            ? "Not found"
            : code < 500
              ? "Bad request"
              : "Error"}
    </Pill>
  );
}

function SecretKey({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span className="flex min-w-0 items-center gap-2">
      {revealed ? (
        <CopyId id={value} shorten={false} />
      ) : (
        <span className="font-mono text-[13px] text-ink">{`${value.slice(0, 8)}${"•".repeat(24)}${value.slice(-4)}`}</span>
      )}
      <Button size="sm" onClick={() => setRevealed((r) => !r)} aria-pressed={revealed}>
        {revealed ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
        {revealed ? "Hide" : "Reveal"}
      </Button>
    </span>
  );
}

export function DevelopersView() {
  const { hydrated, now } = useNow();
  const data = useMemo(() => (hydrated ? getDeveloperData(now) : null), [hydrated, now]);

  const webhookColumns: Column<WebhookEndpoint>[] = [
    { header: "URL", width: 360, cell: (w) => <span className="truncate font-mono text-[13px]">{w.url}</span> },
    { header: "Events", width: 100, align: "right", cell: (w) => <span className="tabular">{w.events}</span> },
    {
      header: "Status",
      width: 110,
      cell: (w) =>
        w.status === "enabled" ? <Pill tone="success">Enabled</Pill> : <Pill tone="neutral">Disabled</Pill>,
    },
    {
      header: "Error rate",
      width: 110,
      align: "right",
      cell: (w) => (
        <span className={cn("tabular", w.errorRate > 2 && "text-danger-text")}>{w.errorRate.toFixed(1)}%</span>
      ),
    },
    { header: "Created", width: 150, cell: (w) => <DateCell ts={w.created} now={now} /> },
  ];

  const logColumns: Column<ApiRequestLog>[] = [
    { header: "Status", width: 170, cell: (l) => <StatusCode code={l.status} /> },
    {
      header: "Method",
      width: 90,
      cell: (l) => (
        <span className={cn("font-mono text-[13px] font-semibold", METHOD_CLASS[l.method])}>{l.method}</span>
      ),
    },
    { header: "Path", width: 380, cell: (l) => <span className="truncate font-mono text-[13px]">{l.path}</span> },
    { header: "Time", width: 150, cell: (l) => <DateCell ts={l.at} now={now} /> },
  ];

  return (
    <div className="pb-6">
      <PageTitle>Developers</PageTitle>
      {data ? (
        <>
          <SectionHeading>API keys</SectionHeading>
          <dl className="mt-3 grid grid-cols-[160px_minmax(0,1fr)] items-center gap-x-6 gap-y-3 text-[14px]">
            <dt className="text-subdued">Publishable key</dt>
            <dd className="min-w-0">
              <CopyId id={data.keys.publishable} shorten={false} />
            </dd>
            <dt className="text-subdued">Secret key</dt>
            <dd className="min-w-0">
              <SecretKey value={data.keys.secret} />
            </dd>
          </dl>
          <p className="mt-2 text-[12px] text-subdued">
            Mock keys for this demo only; they don&apos;t authenticate anywhere.
          </p>

          <SectionHeading>Webhook endpoints</SectionHeading>
          <DataTable className="mt-2" columns={webhookColumns} rows={data.webhooks} rowKey={(w) => w.id} />

          <SectionHeading>Recent API requests</SectionHeading>
          <DataTable className="mt-2" columns={logColumns} rows={data.logs} rowKey={(l) => l.id} />
        </>
      ) : (
        <TableSkeleton rows={10} />
      )}
    </div>
  );
}
