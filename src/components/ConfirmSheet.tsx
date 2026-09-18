"use client";

import { useEffect } from "react";

/**
 * A confirmation surface for options/destructive actions: a bottom sheet on
 * mobile, a centered dialog on wider screens. Backdrop-dismissible, closes
 * on Escape, and keeps the destructive action last and separated from Cancel
 * per the action-sheet pattern (heading, description, destructive action,
 * cancel).
 */
export function ConfirmSheet({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="backdrop-enter fixed inset-0 bg-ink/40"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-sheet-title"
        className="sheet-enter relative w-full max-w-sm rounded-t-3xl border border-border bg-panel p-6 pb-8 shadow-xl sm:rounded-3xl sm:pb-6"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />
        <h2 id="confirm-sheet-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="w-full rounded-full bg-red py-3 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Please wait…" : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-border py-3 text-sm font-semibold text-ink transition-check hover:bg-page"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
