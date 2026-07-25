import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "copied" | "error" | "idle";

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
        copied = false;
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
