export function FieldTooltip({ message }: { message: string }) {
  return (
    <div className="tooltip-enter relative mt-2 w-fit">
      <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-l border-t border-red/20 bg-red-soft" />
      <div className="flex items-center gap-1.5 rounded-lg border border-red/20 bg-red-soft px-3 py-1.5 text-xs font-medium text-red shadow-sm">
        <WarningIcon />
        {message}
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <rect x="9" y="5" width="2" height="6" rx="1" fill="var(--color-red-soft)" />
      <rect x="9" y="13" width="2" height="2" rx="1" fill="var(--color-red-soft)" />
    </svg>
  );
}
