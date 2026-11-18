"use client";

import { Copy, Ellipsis, ExternalLink, RotateCcw, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/Menu";
import type { Payment } from "@/lib/types";
import { copyText } from "./cells/CopyId";

export function RowActions({ payment }: { payment: Payment }) {
  const router = useRouter();
  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for payment ${payment.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-5 w-6 items-center justify-center rounded text-subdued hover:bg-offset-strong hover:text-ink data-[state=open]:bg-offset-strong"
        >
          <Ellipsis className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </MenuTrigger>
      <MenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <MenuItem onSelect={() => router.push(`/payments/${payment.id}`)}>
          <ExternalLink className="size-4 text-subdued" aria-hidden /> View payment details
        </MenuItem>
        <MenuItem onSelect={() => void copyText(payment.id)}>
          <Copy className="size-4 text-subdued" aria-hidden /> Copy payment ID
        </MenuItem>
        <MenuItem onSelect={() => void copyText(payment.customer.email)}>
          <UserRound className="size-4 text-subdued" aria-hidden /> Copy customer email
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          disabled={payment.status !== "succeeded"}
          className="data-[disabled]:cursor-default data-[disabled]:text-faint"
        >
          <RotateCcw className="size-4" aria-hidden /> Refund payment…
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
