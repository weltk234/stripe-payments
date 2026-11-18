"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { shortenId } from "@/lib/format";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function CopyId({ id, shorten = true }: { id: string; shorten?: boolean }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <span className="group/copy inline-flex items-center gap-1">
      <span className="font-mono text-[13px] text-ink" title={id}>
        {shorten ? shortenId(id) : id}
      </span>
      <Tooltip content={copied ? "Copied" : "Copy to clipboard"} open={copied ? true : undefined}>
        <button
          type="button"
          aria-label={`Copy payment ID ${id}`}
          onClick={async (e) => {
            e.stopPropagation();
            if (await copyText(id)) setCopied(true);
          }}
          className="flex size-5 items-center justify-center rounded text-subdued opacity-60 transition-opacity group-hover/copy:opacity-100 hover:bg-offset-strong hover:text-ink focus-visible:opacity-100"
        >
          {copied ? (
            <Check className="size-3.5 text-success-text" strokeWidth={2.5} aria-hidden />
          ) : (
            <Copy className="size-3.5" strokeWidth={2} aria-hidden />
          )}
        </button>
      </Tooltip>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </span>
  );
}
