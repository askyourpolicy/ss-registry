"use client";

import { CaretLeftIcon, CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react";
import { useId, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

type PaginationVariant = "compact" | "pages";
type PaginationItem = number | "ellipsis";

type PaginationRange = {
  firstItem: number;
  lastItem: number;
  page: number;
  pageCount: number;
  totalItems: number;
};

type PaginationControlsProps = Omit<ComponentProps<"nav">, "onChange"> & {
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  page: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  siblingCount?: number;
  totalItems: number;
  variant?: PaginationVariant;
};

function getPageCount(totalItems: number, pageSize: number) {
  const safeTotal = toNonNegativeInteger(totalItems);
  const safePageSize = toPositiveInteger(pageSize);
  return safeTotal === 0 ? 0 : Math.ceil(safeTotal / safePageSize);
}

function clampPage(page: number, pageCount: number) {
  const safePageCount = toNonNegativeInteger(pageCount);
  if (safePageCount === 0) return 1;

  const integerPage = Number.isFinite(page) ? Math.floor(page) : 1;
  return Math.min(Math.max(integerPage, 1), safePageCount);
}

function getPaginationRange(page: number, pageSize: number, totalItems: number): PaginationRange {
  const safeTotal = toNonNegativeInteger(totalItems);
  const safePageSize = toPositiveInteger(pageSize);
  const pageCount = getPageCount(safeTotal, safePageSize);
  const safePage = clampPage(page, pageCount);

  if (safeTotal === 0) {
    return {
      firstItem: 0,
      lastItem: 0,
      page: safePage,
      pageCount,
      totalItems: safeTotal,
    };
  }

  return {
    firstItem: (safePage - 1) * safePageSize + 1,
    lastItem: Math.min(safePage * safePageSize, safeTotal),
    page: safePage,
    pageCount,
    totalItems: safeTotal,
  };
}

function getPaginationItems(page: number, pageCount: number, siblingCount = 1): PaginationItem[] {
  const safePageCount = toNonNegativeInteger(pageCount);
  if (safePageCount === 0) return [];

  const safePage = clampPage(page, safePageCount);
  const safeSiblingCount = toNonNegativeInteger(siblingCount);
  const visibleItemCount = safeSiblingCount * 2 + 5;

  if (safePageCount <= visibleItemCount) {
    return createRange(1, safePageCount);
  }

  const leftSiblingPage = Math.max(safePage - safeSiblingCount, 1);
  const rightSiblingPage = Math.min(safePage + safeSiblingCount, safePageCount);
  const showLeftEllipsis = leftSiblingPage > 3;
  const showRightEllipsis = rightSiblingPage < safePageCount - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = createRange(1, 3 + safeSiblingCount * 2);
    return [...leftRange, "ellipsis", safePageCount];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = createRange(safePageCount - (2 + safeSiblingCount * 2), safePageCount);
    return [1, "ellipsis", ...rightRange];
  }

  return [
    1,
    "ellipsis",
    ...createRange(leftSiblingPage, rightSiblingPage),
    "ellipsis",
    safePageCount,
  ];
}

function PaginationControls({
  "aria-label": ariaLabel = "Pagination",
  className,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  pageSizeOptions,
  siblingCount = 1,
  totalItems,
  variant = "pages",
  ...props
}: PaginationControlsProps) {
  const pageSizeId = useId();
  const range = getPaginationRange(page, pageSize, totalItems);
  const safePageSize = toPositiveInteger(pageSize);
  const options = getPageSizeOptions(safePageSize, pageSizeOptions);
  const canGoPrevious = range.pageCount > 0 && range.page > 1;
  const canGoNext = range.pageCount > 0 && range.page < range.pageCount;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex min-w-0 flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      data-slot="pagination-controls"
      data-variant={variant}
      {...props}
    >
      <span aria-live="polite" className="text-muted-foreground">
        {range.totalItems === 0
          ? "0 items"
          : `${range.firstItem}–${range.lastItem} of ${range.totalItems}`}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {onPageSizeChange && options.length > 0 ? (
          <div className="flex items-center gap-2 whitespace-nowrap text-muted-foreground">
            <label htmlFor={pageSizeId}>Items per page</label>
            <NativeSelect
              id={pageSizeId}
              onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
              size="sm"
              value={String(safePageSize)}
            >
              {options.map((option) => (
                <NativeSelectOption key={option} value={option}>
                  {option}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        ) : null}
        <ul className="flex min-w-0 items-center gap-1" data-slot="pagination-controls-list">
          <li>
            <Button
              aria-label="Go to previous page"
              disabled={!canGoPrevious}
              onClick={() => onPageChange(clampPage(range.page - 1, range.pageCount))}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <CaretLeftIcon />
            </Button>
          </li>
          {variant === "pages"
            ? getPaginationItems(range.page, range.pageCount, siblingCount).map((item, index) => (
                <li key={item === "ellipsis" ? `ellipsis-${index}` : item}>
                  {item === "ellipsis" ? (
                    <span
                      aria-hidden="true"
                      className="flex size-7 items-center justify-center text-muted-foreground [&_svg]:size-4"
                    >
                      <DotsThreeIcon />
                    </span>
                  ) : (
                    <Button
                      aria-current={item === range.page ? "page" : undefined}
                      aria-label={`Go to page ${item}`}
                      onClick={() => onPageChange(item)}
                      size="icon-sm"
                      type="button"
                      variant={item === range.page ? "outline" : "ghost"}
                    >
                      {item}
                    </Button>
                  )}
                </li>
              ))
            : null}
          <li>
            <Button
              aria-label="Go to next page"
              disabled={!canGoNext}
              onClick={() => onPageChange(clampPage(range.page + 1, range.pageCount))}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <CaretRightIcon />
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function createRange(start: number, end: number) {
  return Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index);
}

function toNonNegativeInteger(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function toPositiveInteger(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.max(1, Math.floor(value));
}

function getPageSizeOptions(pageSize: number, options?: readonly number[]) {
  if (!options) return [];

  const normalizedOptions = options
    .filter((option) => Number.isFinite(option) && option > 0)
    .map((option) => Math.floor(option));

  return [...new Set([pageSize, ...normalizedOptions])];
}

export {
  PaginationControls,
  clampPage,
  getPageCount,
  getPaginationItems,
  getPaginationRange,
  type PaginationControlsProps,
  type PaginationItem,
  type PaginationRange,
  type PaginationVariant,
};
