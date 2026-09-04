"use client";

import { useEffect } from "react";
import QRCode from "react-qr-code";

export function QrModal({
  open,
  onClose,
  url,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
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
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="backdrop-enter fixed inset-0 bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="sheet-enter relative w-full max-w-xs rounded-t-3xl border border-border bg-panel p-6 pb-8 text-center shadow-xl sm:rounded-3xl sm:pb-6"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />
        <p className="text-sm font-semibold text-ink">Scan to buy me a coffee</p>
        <div className="mt-4 flex justify-center">
          <div className="rounded-2xl border border-border bg-white p-4">
            <QRCode value={url} size={176} />
          </div>
        </div>
        <p className="mt-4 break-all text-xs text-ink-faint">{url}</p>
      </div>
    </div>
  );
}
