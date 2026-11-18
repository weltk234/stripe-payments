"use client";

import { Bell, CircleHelp, Plus, Search, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePaymentsQuery } from "@/hooks/usePaymentsQuery";
import { Tooltip } from "@/components/ui/Tooltip";

function SearchInput() {
  const { query, update } = usePaymentsQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(query.filters.q);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlQ = query.filters.q;

  // Keep the input in sync when the URL changes elsewhere (e.g. "Clear filters").
  // Skipped while focused so an in-flight debounce never clobbers fresh keystrokes.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setValue(urlQ);
  }, [urlQ]);

  // Debounced URL update while typing on the list page.
  useEffect(() => {
    if (value === urlQ || pathname !== "/payments") return;
    const t = setTimeout(() => update({ filters: { q: value } }), 200);
    return () => clearTimeout(t);
  }, [value, urlQ, pathname, update]);

  // "/" focuses search, like the Dashboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) && !target.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      className="relative w-full max-w-[544px]"
      onSubmit={(e) => {
        e.preventDefault();
        if (pathname !== "/payments") {
          router.push(value.trim() ? `/payments?q=${encodeURIComponent(value.trim())}` : "/payments");
        } else {
          update({ filters: { q: value } });
        }
      }}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subdued"
        strokeWidth={2.25}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        aria-label="Search payments by ID, email or last 4 digits"
        autoComplete="off"
        spellCheck={false}
        className="h-8 w-full rounded-md bg-offset pr-3 pl-8 text-[14px] text-ink placeholder:text-subdued focus:bg-white focus:shadow-[0_0_0_1px_var(--color-border-strong)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
    </form>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip content={label} side="bottom">
      <button
        type="button"
        aria-label={label}
        className="relative flex size-8 items-center justify-center rounded-md text-ink hover:bg-offset"
      >
        {children}
      </button>
    </Tooltip>
  );
}

function AppTile({ className, children, label }: { className: string; children?: React.ReactNode; label: string }) {
  return (
    <Tooltip content={label} side="bottom">
      <button
        type="button"
        aria-label={label}
        className="flex size-7 items-center justify-center rounded-md hover:bg-offset"
      >
        <span
          className={`flex size-[15px] items-center justify-center rounded-[4px] text-[8px] font-bold ${className}`}
        >
          {children}
        </span>
      </button>
    </Tooltip>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-6 bg-white px-10">
      <SearchInput />
      <div className="ml-auto flex shrink-0 items-center gap-6">
        <p className="text-[14px] whitespace-nowrap text-ink">
          Test mode has moved.{" "}
          <button type="button" className="ml-1 font-normal underline underline-offset-2 hover:text-ink-strong">
            Show me
          </button>
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-[34px] items-center gap-0.5 rounded-full px-1.5 shadow-[inset_0_0_0_1px_var(--color-border)]">
            <AppTile label="Docs" className="text-[#1e1b4b]">
              D
            </AppTile>
            <AppTile label="Payments" className="bg-[#3ba1f7] text-white">
              ◎
            </AppTile>
            <AppTile label="Terminal" className="bg-black text-[#00d66f]">
              ⌐
            </AppTile>
            <AppTile label="Apps" className="text-ink">
              <span className="grid grid-cols-2 gap-[2px]">
                <i className="size-[5px] rounded-[1px] border border-ink" />
                <i className="size-[5px] rounded-[1px] border border-ink" />
                <i className="size-[5px] rounded-[1px] border border-ink" />
                <i className="size-[5px] text-[7px] leading-[5px] not-italic">+</i>
              </span>
            </AppTile>
          </div>
          <div className="flex items-center gap-2">
            <IconButton label="Help">
              <CircleHelp className="size-4" strokeWidth={2} aria-hidden />
            </IconButton>
            <IconButton label="Notifications">
              <Bell className="size-4" strokeWidth={2} aria-hidden />
              <span className="absolute top-[7px] right-[8px] size-[6px] rounded-full bg-[#0570de] ring-2 ring-white" />
            </IconButton>
            <IconButton label="Settings">
              <Settings className="size-4" strokeWidth={2} aria-hidden />
            </IconButton>
            <Tooltip content="Create" side="bottom">
              <button
                type="button"
                aria-label="Create"
                className="flex size-8 items-center justify-center rounded-md hover:bg-offset"
              >
                <span className="flex size-[18px] items-center justify-center rounded-full bg-brand text-white">
                  <Plus className="size-3" strokeWidth={3} aria-hidden />
                </span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
}
