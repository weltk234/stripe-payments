"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/payments/filters/fields";
import { useHydrated } from "@/hooks/useHydrated";
import { escapeCsv } from "@/lib/csv";
import { REPORT_TYPES, startOfLocalDay, type ReportType } from "@/lib/mock/analytics";
import { getAllPayments } from "@/lib/paymentsService";
import { PAGE_TITLE, TD, TH, TR } from "../home/charts";

const DAY_MS = 24 * 3600 * 1000;
const PERIODS = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
] as const;

function download(report: ReportType, rows: (string | number)[][], periodLabel: string) {
  const csv = rows.map((r) => r.map(escapeCsv).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.id}_${periodLabel.toLowerCase().replace(/\s+/g, "_")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ReportsView() {
  const hydrated = useHydrated();
  const [periodId, setPeriodId] = useState<(typeof PERIODS)[number]["id"]>("30");
  const period = PERIODS.find((p) => p.id === periodId)!;

  const payments = useMemo(() => {
    if (!hydrated) return [];
    const now = Date.now();
    const from = startOfLocalDay(now) - (period.days - 1) * DAY_MS;
    return getAllPayments(now).filter((p) => p.created >= from);
  }, [hydrated, period.days]);

  return (
    <div className="pb-16">
      <h1 className={PAGE_TITLE}>Reports</h1>
      <p className="mt-2 text-[14px] text-subdued">Download financial reports to reconcile your Stripe activity.</p>

      <div className="mt-6 flex items-center gap-3">
        <label htmlFor="report-period" className="text-[14px] font-medium text-ink">
          Period
        </label>
        <div className="w-[180px]">
          <SelectField
            id="report-period"
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value as typeof periodId)}
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </SelectField>
        </div>
        <span className="text-[13px] text-subdued">{hydrated ? `${payments.length} payments in period` : ""}</span>
      </div>

      <table className="mt-4 w-full table-fixed border-collapse text-[14px] leading-5">
        <colgroup>
          <col style={{ width: 240 }} />
          <col />
          <col style={{ width: 90 }} />
          <col style={{ width: 140 }} />
        </colgroup>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className={`${TH} text-left`}>
              Report
            </th>
            <th scope="col" className={`${TH} text-left`}>
              Description
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Rows
            </th>
            <th scope="col" className={TH}>
              <span className="sr-only">Download</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {REPORT_TYPES.map((report) => {
            const rows = hydrated ? report.rows(payments) : null;
            return (
              <tr key={report.id} className={TR}>
                <td className={`${TD} font-medium text-ink-strong`}>{report.name}</td>
                <td className={`${TD} truncate text-subdued`}>{report.description}</td>
                <td className={`${TD} tabular text-right`}>{rows ? rows.length - 1 : "—"}</td>
                <td className={`${TD} text-right`}>
                  <Button
                    size="sm"
                    disabled={!rows}
                    onClick={() => rows && download(report, rows, period.label)}
                    aria-label={`Download ${report.name} CSV`}
                  >
                    <Download className="size-3.5" strokeWidth={2.25} aria-hidden />
                    Download
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
