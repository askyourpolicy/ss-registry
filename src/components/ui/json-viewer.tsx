"use client";

import * as React from "react";
import {
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckIcon,
  CopyIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type JsonViewerProps = {
  className?: string;
  data?: unknown;
  defaultExpanded?: boolean;
  maxHeight?: string;
  rootName?: string;
  value?: unknown;
};

export function JsonViewer({
  className,
  data,
  defaultExpanded = false,
  maxHeight = "max-h-72",
  rootName = "root",
  value,
}: JsonViewerProps) {
  const source = value !== undefined ? value : data;

  return (
    <TooltipProvider>
      <div
        data-slot="json-viewer"
        className={cn(
          maxHeight,
          "space-y-1.5 overflow-auto rounded-lg border bg-background p-2",
          className,
        )}
      >
        <div className="max-w-full">
          <div className="w-max min-w-full whitespace-nowrap font-mono text-[11px]">
            <JsonNode
              data={source}
              defaultExpanded={defaultExpanded}
              isRoot
              level={0}
              name={rootName}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

type JsonNodeProps = {
  data: unknown;
  defaultExpanded: boolean;
  isRoot?: boolean;
  level: number;
  name: string;
};

function JsonNode({ data, defaultExpanded, isRoot = false, level, name }: JsonNodeProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">("idle");
  const copyStateTimer = React.useRef<number | null>(null);
  const contentId = React.useId();
  const dataType = getJsonType(data);
  const expandable = dataType === "object" || dataType === "array";
  const entries = expandable ? getEntries(data) : [];

  React.useEffect(
    () => () => {
      if (copyStateTimer.current !== null) {
        window.clearTimeout(copyStateTimer.current);
      }
    },
    [],
  );

  async function copyToClipboard(event: React.MouseEvent) {
    event.stopPropagation();

    if (copyStateTimer.current !== null) {
      window.clearTimeout(copyStateTimer.current);
    }

    try {
      const serialized = JSON.stringify(data, null, 2) ?? String(data);
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }
      await navigator.clipboard.writeText(serialized);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    copyStateTimer.current = window.setTimeout(() => {
      setCopyState("idle");
      copyStateTimer.current = null;
    }, 1600);
  }

  const rowContent = (
    <>
      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
        {expandable ? (
          expanded ? (
            <CaretDownIcon className="size-3.5" weight="bold" />
          ) : (
            <CaretRightIcon className="size-3.5" weight="bold" />
          )
        ) : null}
      </span>
      <span className="text-primary">{name}</span>
      <span className="text-muted-foreground">
        {expandable ? (
          <>
            {dataType === "array" ? "[" : "{"}
            {!expanded ? (
              <>
                {" "}
                {entries.length} {entries.length === 1 ? "item" : "items"}{" "}
                {dataType === "array" ? "]" : "}"}
              </>
            ) : null}
          </>
        ) : (
          ":"
        )}
      </span>
      {!expandable ? <JsonValue data={data} /> : null}
    </>
  );

  return (
    <div className={cn("min-w-0 pl-3", level > 0 && "border-l border-border-subtle")}>
      <div
        className={cn(
          "-ml-3 flex min-w-0 cursor-default items-center rounded-md transition-colors group/property",
          expandable && "hover:bg-muted/60",
          isRoot && "font-medium",
        )}
      >
        {expandable ? (
          <button
            aria-controls={contentId}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${name}`}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-md px-1 py-px text-left leading-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            {rowContent}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-1 px-1 py-px leading-4">
            {rowContent}
          </div>
        )}
        <Button
          aria-label={
            copyState === "copied"
              ? `${name} copied`
              : copyState === "error"
                ? `Copy ${name} failed. Try again`
                : `Copy ${name}`
          }
          className="ml-auto size-5 shrink-0 opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          onClick={(event) => void copyToClipboard(event)}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          {copyState === "copied" ? (
            <CheckIcon className="size-3.5 text-status-success" weight="bold" />
          ) : (
            <CopyIcon
              className={cn(
                "size-3.5 text-muted-foreground",
                copyState === "error" && "text-destructive",
              )}
            />
          )}
        </Button>
        <span aria-live="polite" className="sr-only" role="status">
          {copyState === "copied"
            ? `${name} copied to clipboard.`
            : copyState === "error"
              ? `${name} could not be copied. Try again.`
              : ""}
        </span>
      </div>
      {expandable && expanded ? (
        <div id={contentId} className="pl-4">
          {entries.map(([key, entry]) => (
            <JsonNode data={entry} defaultExpanded={false} key={key} level={level + 1} name={key} />
          ))}
          <div className="py-px pl-4 leading-4 text-muted-foreground">
            {dataType === "array" ? "]" : "}"}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function JsonValue({ data }: { data: unknown }) {
  const [expanded, setExpanded] = React.useState(false);
  const textLimit = 80;

  if (data === null) {
    return <span className="text-destructive">null</span>;
  }
  if (data === undefined) {
    return <span className="text-muted-foreground">undefined</span>;
  }
  if (data instanceof Date) {
    return <span className="text-purple-700 dark:text-purple-300">{data.toISOString()}</span>;
  }
  if (typeof data === "string") {
    if (data.length > textLimit) {
      const displayValue = expanded ? data : `${data.slice(0, textLimit)}...`;
      return (
        <button
          aria-expanded={expanded}
          className="group/value inline-flex items-center gap-1 text-left whitespace-nowrap text-emerald-700 dark:text-emerald-300"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
          type="button"
        >
          <span>"</span>
          {expanded ? (
            <span>{displayValue}</span>
          ) : (
            <Tooltip>
              <TooltipTrigger render={<span />}>{displayValue}</TooltipTrigger>
              <TooltipContent className="max-w-md break-words text-left" side="bottom">
                {data}
              </TooltipContent>
            </Tooltip>
          )}
          <span>"</span>
          {expanded ? (
            <CaretUpIcon className="size-3 text-muted-foreground opacity-60 transition-opacity group-hover/value:opacity-100 group-focus-visible/value:opacity-100" />
          ) : (
            <DotsThreeIcon className="size-3 text-muted-foreground opacity-60 transition-opacity group-hover/value:opacity-100 group-focus-visible/value:opacity-100" />
          )}
        </button>
      );
    }
    return <span className="text-emerald-700 dark:text-emerald-300">{`"${data}"`}</span>;
  }
  if (typeof data === "number") {
    return <span className="text-amber-700 dark:text-amber-300">{data}</span>;
  }
  if (typeof data === "boolean") {
    return <span className="text-blue-700 dark:text-blue-300">{String(data)}</span>;
  }
  return <span>{String(data)}</span>;
}

function getJsonType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  return typeof value;
}

function getEntries(value: unknown): [string, unknown][] {
  if (Array.isArray(value)) return value.map((entry, index) => [String(index), entry]);
  if (value && typeof value === "object") return Object.entries(value);
  return [];
}
