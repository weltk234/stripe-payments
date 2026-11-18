"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftRight,
  ChartColumn,
  ChevronDown,
  Clock,
  CreditCard,
  Ellipsis,
  FlaskConical,
  House,
  Landmark,
  Layers,
  Leaf,
  LogOut,
  Package,
  Pin,
  Plus,
  Receipt,
  ReceiptText,
  Settings,
  SquareTerminal,
  User,
  UserRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/Menu";
import { TRANSACTIONS_PATHS } from "@/lib/sections";

interface LinkItem {
  label: string;
  icon: LucideIcon;
  href: string;
  /** Extra path prefixes that mark the item as active. */
  match?: readonly string[];
}

interface GroupItem {
  label: string;
  icon: LucideIcon;
  children: { label: string; href: string }[];
}

type NavItemDef = LinkItem | GroupItem;

const isGroup = (item: NavItemDef): item is GroupItem => "children" in item;

const PRIMARY: LinkItem[] = [
  { label: "Home", icon: House, href: "/home" },
  { label: "Balances", icon: Landmark, href: "/balances" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/payments", match: TRANSACTIONS_PATHS },
  { label: "Customers", icon: User, href: "/customers" },
  { label: "Product catalog", icon: Package, href: "/product-catalog" },
];

const SHORTCUTS: LinkItem[] = [
  { label: "Payments analytics", icon: Pin, href: "/payments-analytics" },
  { label: "Reports", icon: Clock, href: "/reports" },
  { label: "Sigma", icon: Clock, href: "/sigma" },
  { label: "Radar", icon: Clock, href: "/radar" },
];

const PRODUCTS: GroupItem[] = [
  {
    label: "Connect",
    icon: Layers,
    children: [
      { label: "Overview", href: "/connect" },
      { label: "Connected accounts", href: "/connected-accounts" },
    ],
  },
  {
    label: "Payments",
    icon: CreditCard,
    children: [
      { label: "Disputes", href: "/disputes" },
      { label: "Radar", href: "/radar" },
      { label: "Payment links", href: "/payment-links" },
    ],
  },
  {
    label: "Billing",
    icon: ReceiptText,
    children: [
      { label: "Subscriptions", href: "/subscriptions" },
      { label: "Invoices", href: "/invoices" },
    ],
  },
  {
    label: "Reporting",
    icon: ChartColumn,
    children: [
      { label: "Reports", href: "/reports" },
      { label: "Revenue recognition", href: "/revenue-recognition" },
    ],
  },
];

const MORE_PRODUCTS = [
  { label: "Tax", icon: Receipt, href: "/tax" },
  { label: "Issuing", icon: WalletCards, href: "/issuing" },
  { label: "Climate", icon: Leaf, href: "/climate" },
] as const;

const isActivePath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

const ITEM_CLASS =
  "group flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[14px] leading-5 font-medium transition-colors";

function NavIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <Icon
      className={cn("size-4 shrink-0", active ? "text-brand-text" : "text-subdued")}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function NavLink({ item, pathname }: { item: LinkItem; pathname: string }) {
  const active = [item.href, ...(item.match ?? [])].some((p) => isActivePath(pathname, p));
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(ITEM_CLASS, active ? "text-brand-text" : "text-ink hover:bg-offset")}
    >
      <NavIcon icon={item.icon} active={active} />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  );
}

function NavGroup({ item, pathname }: { item: GroupItem; pathname: string }) {
  const containsActive = item.children.some((c) => isActivePath(pathname, c.href));
  const [open, setOpen] = useState(containsActive);
  const id = `nav-group-${item.label.toLowerCase()}`;
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(ITEM_CLASS, "text-ink hover:bg-offset")}
      >
        <NavIcon icon={item.icon} active={false} />
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronDown
          className={cn("size-3.5 text-subdued transition-transform", open && "rotate-180")}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open && (
        <ul id={id} className="flex flex-col gap-px pb-1">
          {item.children.map((child) => {
            const active = isActivePath(pathname, child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-7 items-center rounded-md pr-2 pl-8 text-[14px] leading-5 font-medium transition-colors",
                    active ? "text-brand-text" : "text-ink hover:bg-offset",
                  )}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Section({ title, items, pathname }: { title?: string; items: NavItemDef[]; pathname: string }) {
  return (
    <div>
      {title && <div className="px-2 pb-1 text-[12px] leading-4 font-medium text-subdued">{title}</div>}
      <ul className="flex flex-col gap-px">
        {items.map((item) => (
          <li key={item.label}>
            {isGroup(item) ? <NavGroup item={item} pathname={pathname} /> : <NavLink item={item} pathname={pathname} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MoreMenu({ pathname }: { pathname: string }) {
  const active = MORE_PRODUCTS.some((p) => isActivePath(pathname, p.href));
  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <button
          type="button"
          className={cn(
            ITEM_CLASS,
            active ? "text-brand-text" : "text-ink hover:bg-offset",
            "data-[state=open]:bg-offset",
          )}
        >
          <NavIcon icon={Ellipsis} active={active} />
          <span className="flex-1 truncate">More</span>
        </button>
      </MenuTrigger>
      <MenuContent side="right" align="start" className="min-w-[180px]">
        <MenuLabel>More products</MenuLabel>
        {MORE_PRODUCTS.map(({ label, icon: Icon, href }) => (
          <MenuItem key={href} asChild>
            <Link href={href}>
              <Icon className="size-4 text-subdued" aria-hidden /> {label}
            </Link>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
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

function AccountMenu() {
  return (
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
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-[228px] shrink-0 flex-col border-r border-border bg-white">
      <div className="flex h-14 items-center px-3">
        <AccountMenu />
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-8 overflow-y-auto px-3 pt-[19px]">
        <Section items={PRIMARY} pathname={pathname} />
        <Section title="Shortcuts" items={SHORTCUTS} pathname={pathname} />
        <div>
          <Section title="Products" items={PRODUCTS} pathname={pathname} />
          <MoreMenu pathname={pathname} />
        </div>
      </nav>

      <div className="px-3 py-2">
        <NavLink item={{ label: "Developers", icon: SquareTerminal, href: "/developers" }} pathname={pathname} />
      </div>
    </aside>
  );
}
