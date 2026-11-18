"use client";

import * as RadixPopover from "@radix-ui/react-popover";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "./cn";

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverClose = RadixPopover.Close;

export function PopoverContent({
  className,
  children,
  align = "start",
  sideOffset = 6,
  ...props
}: ComponentPropsWithoutRef<typeof RadixPopover.Content> & { children: ReactNode }) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          "animate-popover-in z-50 rounded-lg bg-white text-ink shadow-[var(--shadow-popover)] outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}
