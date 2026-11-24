import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "copied" | "error" | "idle";

/**
 * Copies through a selected, hidden textarea. Embedded browsers that refuse the async clipboard
 * (NotAllowedError) often still allow this older path during a click.
 */
function copyThroughSelection(value: string): boolean {
  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    return false;
  }
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  // Inside a modal dialog, so its focus trap lets the textarea take the selection.
  const host = active?.closest("dialog, [role='dialog']") ?? document.body;
  const selection = document.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index))
    : [];
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
  host.append(textarea);
  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (selection) {
      selection.removeAllRanges();
      for (const range of ranges) {
        selection.addRange(range);
      }
    }
    active?.focus({ preventScroll: true });
  }
}

export function useCopyToClipboard({ resetAfter = 1600 }: { resetAfter?: number } = {}) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const copy = useCallback(
    async (value: string) => {
      clearTimer();
      let copied = true;
      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard access is unavailable.");
        }
        await navigator.clipboard.writeText(value);
      } catch {
        copied = copyThroughSelection(value);
      }

      setStatus(copied ? "copied" : "error");
      timer.current = window.setTimeout(() => {
        setStatus("idle");
        timer.current = null;
      }, resetAfter);
      return copied;
    },
    [clearTimer, resetAfter],
  );

  return { copy, status };
}
