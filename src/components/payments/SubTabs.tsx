"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { TRANSACTION_TABS } from "@/lib/sections";

export function SubTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Transactions" className="mt-3 border-b border-border">
      <ul className="flex gap-6">
        {TRANSACTION_TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative -mb-px inline-flex h-[30px] items-start border-b-2 text-[14px] leading-5 font-semibold transition-colors",
                  isActive ? "border-brand-text text-brand-text" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
