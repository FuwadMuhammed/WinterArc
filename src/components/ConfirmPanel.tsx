"use client";

/**
 * Confirmation content for a destructive action, meant to swap into an
 * already-open sheet rather than stack a second one. Keeps the destructive
 * action last and separated from Cancel per the action-sheet pattern.
 */
export function ConfirmPanel({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  pending = false,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending?: boolean;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
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
          disabled={pending}
          onClick={onCancel}
          className="w-full rounded-full border border-border py-3 text-sm font-semibold text-ink transition-check hover:bg-page disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </>
  );
}
