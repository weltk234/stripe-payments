"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/Menu";
import { PAGE_SIZES, type PageSize } from "@/lib/filters";

interface TablePaginationProps {
  page: number;
  pageSize: PageSize;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

const count = new Intl.NumberFormat("en-US");

export function TablePagination({
  page,
  pageSize,
  pageCount,
  total,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex h-12 items-center justify-between">
      <p className="text-[13px] text-ink" aria-live="polite">
        {total === 0 ? (
          <>
            <span className="font-semibold">0</span> results
          </>
        ) : (
          <>
            Viewing{" "}
            <span className="font-semibold">
              {count.format(start)}–{count.format(end)}
            </span>{" "}
            of <span className="font-semibold">{count.format(total)}</span> results
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Menu modal={false}>
          <MenuTrigger asChild>
            <button
              type="button"
              aria-label={`Rows per page: ${pageSize}`}
              className="flex h-7 items-center gap-1 rounded-md px-2 text-[13px] text-ink hover:bg-offset data-[state=open]:bg-offset"
            >
              {pageSize} per page
              <ChevronDown className="size-3.5 text-subdued" strokeWidth={2} aria-hidden />
            </button>
          </MenuTrigger>
          <MenuContent align="end" className="min-w-[140px]">
            {PAGE_SIZES.map((size) => (
              <MenuItem
                key={size}
                onSelect={() => onPageSizeChange(size)}
                className={size === pageSize ? "font-semibold text-brand-text" : ""}
              >
                {size} per page
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
        <Button
          size="sm"
          className="h-[26px] px-2 text-[13px]"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          className="h-[26px] px-2 text-[13px]"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
