"use client";

import { useEffect } from "react";

/** Modal shell for admin forms: bottom sheet on mobile, centered dialog on
 * wider screens. Same chrome as ConfirmSheet, but takes arbitrary content. */
export function AdminSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-sheet-title"
        className="sheet-enter relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-panel p-6 pb-8 shadow-xl sm:rounded-3xl sm:pb-6"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />
        <h2 id="admin-sheet-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
