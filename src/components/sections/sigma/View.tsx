"use client";

import { Play } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { useHydrated } from "@/hooks/useHydrated";
import { SIGMA_TEMPLATES } from "@/lib/mock/analytics";
import { getAllPayments } from "@/lib/paymentsService";
import { PAGE_TITLE, TD, TH, TR } from "../home/charts";

type Result = { columns: string[]; rows: (string | number)[][]; ms: number; template: string };

export function SigmaView() {
  const hydrated = useHydrated();
  const [templateId, setTemplateId] = useState(SIGMA_TEMPLATES[0].id);
  const [sql, setSql] = useState(SIGMA_TEMPLATES[0].sql);
  const [result, setResult] = useState<Result | null>(null);
  const template = useMemo(() => SIGMA_TEMPLATES.find((t) => t.id === templateId)!, [templateId]);

  const run = () => {
    const started = performance.now();
    const out = template.run(getAllPayments());
    setResult({ ...out, ms: Math.max(1, Math.round(performance.now() - started)) + 180, template: template.name });
  };

  return (
    <div className="pb-16">
      <h1 className={PAGE_TITLE}>Sigma</h1>
      <p className="mt-2 text-[14px] text-subdued">Query your Stripe data with SQL. Pick a template to get started.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Query templates" className="rounded-lg border border-border p-2">
          <p className="px-2 pb-1 text-[12px] font-medium text-subdued">Templates</p>
          <ul className="flex flex-col gap-px">
            {SIGMA_TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  aria-current={t.id === templateId ? "true" : undefined}
                  onClick={() => {
                    setTemplateId(t.id);
                    setSql(t.sql);
                    setResult(null);
                  }}
                  className={cn(
                    "flex h-8 w-full items-center rounded-md px-2 text-left text-[14px]",
                    t.id === templateId ? "bg-brand-soft font-medium text-brand-text" : "text-ink hover:bg-offset",
                  )}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-offset px-3 py-2">
              <span className="text-[13px] font-medium text-ink">{template.name}</span>
              <Button variant="primary" onClick={run} disabled={!hydrated}>
                <Play className="size-3.5" strokeWidth={2.5} aria-hidden />
                Run
              </Button>
            </div>
            <textarea
              aria-label="SQL query"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              spellCheck={false}
              rows={9}
              className="block w-full resize-y bg-white p-3 font-mono text-[13px] leading-5 text-ink outline-none"
            />
          </div>

          <section aria-live="polite" className="mt-4">
            {result ? (
              <>
                <p className="text-[13px] text-subdued">
                  {result.rows.length} rows · {result.ms} ms
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse text-[14px] leading-5">
                    <thead>
                      <tr className="border-b border-border">
                        {result.columns.map((c) => (
                          <th key={c} scope="col" className={`${TH} text-left font-mono`}>
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, i) => (
                        <tr key={i} className={TR}>
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className={cn(
                                TD,
                                "tabular font-mono text-[13px]",
                                typeof cell === "number" && "text-right",
                              )}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="rounded-lg border border-dashed border-border-strong py-10 text-center text-[14px] text-subdued">
                Run the query to see results.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
