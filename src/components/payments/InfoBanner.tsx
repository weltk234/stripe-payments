"use client";

import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "banner:rule-attributes:dismissed";

export function InfoBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setVisible(false);
    } catch {
      /* storage unavailable: keep the banner */
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      role="status"
      className="mt-[22px] flex h-[34px] items-center gap-3 rounded-lg bg-offset pr-2 pl-3 text-[14px] text-ink"
    >
      <span className="flex items-center gap-1 text-[13px] font-semibold text-ink-strong">
        <Sparkles className="size-3" strokeWidth={2.25} aria-hidden />
        New
      </span>
      <span className="flex-1 truncate">
        Rule Attributes are now in Sigma and Data Pipeline for better fraud insights.
      </span>
      <a href="#" className="text-brand-text hover:text-brand-hover">
        Get started
      </a>
      <span className="h-4 w-px bg-border-strong" aria-hidden />
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex size-6 items-center justify-center rounded-md text-ink hover:bg-offset-strong"
      >
        <X className="size-3.5" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
