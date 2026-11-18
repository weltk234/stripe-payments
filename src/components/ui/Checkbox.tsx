"use client";

import * as RadixCheckbox from "@radix-ui/react-checkbox";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export function Checkbox({ className, ...props }: ComponentPropsWithoutRef<typeof RadixCheckbox.Root>) {
  return (
    <RadixCheckbox.Root
      className={cn(
        "flex size-[14px] shrink-0 items-center justify-center rounded-[4px] bg-white shadow-[inset_0_0_0_1px_var(--color-border-strong)] transition-colors",
        "hover:shadow-[inset_0_0_0_1px_#a3acba] data-[state=checked]:bg-brand data-[state=checked]:shadow-none data-[state=indeterminate]:bg-brand data-[state=indeterminate]:shadow-none",
        "disabled:bg-offset-strong disabled:shadow-[inset_0_0_0_1px_var(--color-offset-strong)]",
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator className="text-white">
        {props.checked === "indeterminate" ? (
          <svg width="8" height="2" viewBox="0 0 8 2" aria-hidden>
            <rect width="8" height="2" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="10" height="8" viewBox="0 0 10 8" aria-hidden>
            <path
              d="M1 4l2.6 2.6L9 1.2"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
