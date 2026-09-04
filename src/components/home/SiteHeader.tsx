"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { joinArcAction } from "@/lib/actions";

export function SiteHeader({
  joined,
  loggedIn,
  userEmail,
  onOpenAuth,
  onOpenProfile,
}: {
  joined: boolean;
  loggedIn: boolean;
  userEmail: string | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const initials = (userEmail ?? "?").slice(0, 2).toUpperCase();

  function handleJoinClick() {
    if (loggedIn) {
      startTransition(async () => {
        await joinArcAction();
        router.refresh();
      });
    } else {
      onOpenAuth();
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-tint/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href="/" aria-label="Home">
          <Logo className="h-7 w-auto text-ink" />
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-sm font-medium text-ink-muted transition-check hover:text-ink"
          >
            About
          </Link>

          {joined ? (
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-medium text-white"
            >
              {initials}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleJoinClick}
              disabled={pending}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Joining…" : "Join"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
