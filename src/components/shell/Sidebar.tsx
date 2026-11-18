"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  ChartColumn,
  ChevronDown,
  Clock,
  CreditCard,
  Ellipsis,
  FlaskConical,
  LogOut,
  Plus,
  Settings,
  UserRound,
  House,
  Landmark,
  Layers,
  Package,
  Pin,
  ReceiptText,
  SquareTerminal,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/Menu";

interface NavItemDef {
  label: string;
  icon: LucideIcon;
  /** Only routes that exist in this demo get an href. */
  href?: string;
  /** Path prefixes that mark the item as active. */
  match?: string[];
  expandable?: boolean;
}

const PRIMARY: NavItemDef[] = [
  { label: "Home", icon: House },
  { label: "Balances", icon: Landmark },
  { label: "Transactions", icon: ArrowLeftRight, href: "/payments", match: ["/payments"] },
  { label: "Customers", icon: User },
  { label: "Product catalog", icon: Package },
];

const SHORTCUTS: NavItemDef[] = [
  { label: "Payments analytics", icon: Pin },
  { label: "Reports", icon: Clock },
  { label: "Sigma", icon: Clock },
  { label: "Radar", icon: Clock },
];

const PRODUCTS: NavItemDef[] = [
  { label: "Connect", icon: Layers, expandable: true },
  { label: "Payments", icon: CreditCard, expandable: true },
  { label: "Billing", icon: ReceiptText, expandable: true },
  { label: "Reporting", icon: ChartColumn, expandable: true },
  { label: "More", icon: Ellipsis },
];

function NavItem({ item, active }: { item: NavItemDef; active: boolean }) {
  const Icon = item.icon;
  const className = cn(
    "group flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[14px] leading-5 font-medium transition-colors",
    active ? "text-brand-text" : "text-ink hover:bg-offset",
  );
  const content = (
    <>
      <Icon
        className={cn("size-4 shrink-0", active ? "text-brand-text" : "text-subdued")}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.expandable && <ChevronDown className="size-3.5 text-subdued" strokeWidth={2} aria-hidden />}
    </>
  );
  return item.href ? (
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className}>
      {content}
    </button>
  );
}

function Section({ title, items, pathname }: { title?: string; items: NavItemDef[]; pathname: string }) {
  return (
    <div>
      {title && <div className="px-2 pb-1 text-[12px] leading-4 font-medium text-subdued">{title}</div>}
      <ul className="flex flex-col gap-px">
        {items.map((item) => (
          <li key={item.label}>
            <NavItem item={item} active={Boolean(item.match?.some((m) => pathname.startsWith(m)))} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccountMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[5px] bg-[#cfc8ff] font-bold text-[#3b2fc9]",
        size === "sm" ? "size-[22px] text-[7px]" : "size-8 text-[9px]",
      )}
    >
      cmly
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-[228px] shrink-0 flex-col border-r border-border bg-white">
      <div className="flex h-14 items-center px-3">
        <Menu>
          <MenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left hover:bg-offset data-[state=open]:bg-offset"
            >
              <AccountMark />
              <span className="flex-1 truncate text-[14px] font-semibold text-ink-strong">cramly.ai</span>
              <ChevronDown className="size-3.5 text-subdued" strokeWidth={2} aria-hidden />
            </button>
          </MenuTrigger>
          <MenuContent className="w-[260px]">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <AccountMark size="lg" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold text-ink-strong">cramly.ai</div>
                <div className="truncate text-[12px] text-subdued">acct_1NxCramlyAi8Kp2</div>
              </div>
            </div>
            <MenuSeparator />
            <MenuItem>
              <Settings className="size-4 text-subdued" aria-hidden /> Settings
            </MenuItem>
            <MenuItem>
              <FlaskConical className="size-4 text-subdued" aria-hidden /> Switch to sandbox
            </MenuItem>
            <MenuSeparator />
            <MenuLabel>Accounts</MenuLabel>
            <MenuItem>
              <Plus className="size-4 text-subdued" aria-hidden /> Create account
            </MenuItem>
            <MenuSeparator />
            <MenuLabel>Personal</MenuLabel>
            <MenuItem>
              <UserRound className="size-4 text-subdued" aria-hidden /> Profile
            </MenuItem>
            <MenuItem destructive>
              <LogOut className="size-4" aria-hidden /> Sign out
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-8 overflow-y-auto px-3 pt-[19px]">
        <Section items={PRIMARY} pathname={pathname} />
        <Section title="Shortcuts" items={SHORTCUTS} pathname={pathname} />
        <Section title="Products" items={PRODUCTS} pathname={pathname} />
      </nav>

      <div className="px-3 py-2">
        <NavItem item={{ label: "Developers", icon: SquareTerminal }} active={false} />
      </div>
    </aside>
  );
}
