"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * Catches any error thrown while rendering a page or a Client Component
 * beneath it (including one that escapes a `startTransition` server-action
 * call, e.g. joining the arc or ticking a task) so it lands on a page that
 * still looks like the app, instead of a bare framework error screen.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <Logo className="h-7 w-auto text-ink" />

      <p className="mt-10 text-3xl" aria-hidden="true">
        ⚠️
      </p>
      <h1 className="mt-3 text-lg font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
        That&apos;s on us, not you. Your progress is safe, give it another try.
      </p>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-check hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-border bg-panel px-6 py-3 text-sm font-medium text-ink transition-check hover:border-primary"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
