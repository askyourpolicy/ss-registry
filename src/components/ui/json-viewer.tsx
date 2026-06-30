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

type JsonViewerProps = {
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
  const [copied, setCopied] = React.useState(false);
  const dataType = getJsonType(data);
  const expandable = dataType === "object" || dataType === "array";
  const entries = expandable ? getEntries(data) : [];

  async function copyToClipboard(event: React.MouseEvent) {
    event.stopPropagation();
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={cn("min-w-0 pl-3", level > 0 && "border-l")}>
      <div
        className={cn(
          "-ml-3 flex min-w-0 cursor-default items-center gap-1 rounded-md px-1 py-px leading-4 transition-colors group/property",
          expandable && "cursor-pointer hover:bg-muted/60",
          isRoot && "font-medium",
        )}
        onClick={expandable ? () => setExpanded((current) => !current) : undefined}
      >
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
        <Button
          aria-label={`Copy ${name}`}
          className="ml-auto size-5 opacity-0 transition-opacity group-hover/property:opacity-100"
          onClick={(event) => void copyToClipboard(event)}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          {copied ? (
            <CheckIcon className="size-3.5 text-emerald-600" weight="bold" />
          ) : (
            <CopyIcon className="size-3.5 text-muted-foreground" />
          )}
        </Button>
      </div>
      {expandable && expanded ? (
        <div className="pl-4">
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
            <CaretUpIcon className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover/value:opacity-100" />
          ) : (
            <DotsThreeIcon className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover/value:opacity-100" />
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
