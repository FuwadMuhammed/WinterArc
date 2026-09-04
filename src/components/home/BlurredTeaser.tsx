function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="2.5" y="5.25" width="7" height="5.25" rx="1.25" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4 5.25V3.75a2 2 0 0 1 4 0v1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BlurredTeaser({
  children,
  message = "Join to see more",
  onJoinClick,
}: {
  children: React.ReactNode;
  message?: string;
  onJoinClick?: () => void;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[3px]">{children}</div>
      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-panel via-panel/80 to-transparent pb-4">
        <button
          type="button"
          onClick={onJoinClick}
          className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-check hover:opacity-90"
        >
          <LockIcon />
          {message}
        </button>
      </div>
    </div>
  );
}
