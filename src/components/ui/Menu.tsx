"use client";

import * as RadixMenu from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "./cn";

export const Menu = RadixMenu.Root;
export const MenuTrigger = RadixMenu.Trigger;

export function MenuContent({
  className,
  children,
  align = "start",
  ...props
}: ComponentPropsWithoutRef<typeof RadixMenu.Content> & { children: ReactNode }) {
  return (
    <RadixMenu.Portal>
      <RadixMenu.Content
        align={align}
        sideOffset={6}
        collisionPadding={12}
        className={cn(
          "animate-popover-in z-50 min-w-[200px] rounded-lg bg-white py-1 text-[14px] text-ink shadow-[var(--shadow-popover)] outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </RadixMenu.Content>
    </RadixMenu.Portal>
  );
}

export function MenuItem({
  className,
  destructive,
  ...props
}: ComponentPropsWithoutRef<typeof RadixMenu.Item> & { destructive?: boolean }) {
  return (
    <RadixMenu.Item
      className={cn(
        "mx-1 flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 outline-none select-none data-[highlighted]:bg-offset",
        destructive ? "text-danger-text" : "text-ink",
        className,
      )}
      {...props}
    />
  );
}

export const MenuLabel = ({ className, ...props }: ComponentPropsWithoutRef<typeof RadixMenu.Label>) => (
  <RadixMenu.Label className={cn("px-3 pt-1.5 pb-1 text-[12px] font-medium text-subdued", className)} {...props} />
);

export const MenuSeparator = () => <RadixMenu.Separator className="my-1 h-px bg-border" />;
