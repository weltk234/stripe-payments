import Link from "next/link";
import { cn } from "@/components/ui/cn";

const TABS = ["Payments", "Payouts", "Top-ups", "Collected fees", "Transfers", "All activity"] as const;

export function SubTabs({ active = "Payments" }: { active?: (typeof TABS)[number] }) {
  return (
    <nav aria-label="Transactions" className="mt-3 border-b border-border">
      <ul className="flex gap-6">
        {TABS.map((tab) => {
          const isActive = tab === active;
          return (
            <li key={tab}>
              <Link
                href={tab === "Payments" ? "/payments" : "#"}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative -mb-px inline-flex h-[30px] items-start border-b-2 text-[14px] leading-5 font-semibold transition-colors",
                  isActive ? "border-brand-text text-brand-text" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {tab}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
