import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe("ConfirmDialog", () => {
  it("shows pending feedback and closes after async confirmation succeeds", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred();
    const onConfirm = vi.fn(() => deferred.promise);

    render(
      <ConfirmDialog
        confirmLabel="Archive"
        description="This can be restored later."
        onConfirm={onConfirm}
        pendingLabel="Archiving…"
        title="Archive item?"
        trigger={<Button>Open confirmation</Button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open confirmation" }));
    await user.click(screen.getByRole("button", { name: "Archive" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Archiving…" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    deferred.resolve();

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("keeps failures open, shows the error, and allows retry", async () => {
    const user = userEvent.setup();
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("The service is unavailable."))
      .mockResolvedValueOnce();

    render(
      <ConfirmDialog
        confirmLabel="Delete"
        onConfirm={onConfirm}
        title="Delete item?"
        trigger={<Button>Open confirmation</Button>}
        variant="destructive"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open confirmation" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The service is unavailable.");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("clears failures when a controlled dialog is closed externally", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("Try again."));
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ConfirmDialog
        confirmLabel="Save"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        open
        title="Save changes?"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Try again.");

    rerender(
      <ConfirmDialog
        confirmLabel="Save"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        open={false}
        title="Save changes?"
      />,
    );
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    rerender(
      <ConfirmDialog
        confirmLabel="Save"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        open
        title="Save changes?"
      />,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
