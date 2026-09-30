"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useJoinArc } from "@/lib/useJoinArc";

export function SiteHeader({
  joined,
  loggedIn,
  userEmail,
  userAvatarUrl,
  onOpenAuth,
  onOpenProfile,
}: {
  joined: boolean;
  loggedIn: boolean;
  userEmail: string | null;
  userAvatarUrl: string | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}) {
  const { pending, error, handleJoinClick } = useJoinArc(loggedIn, onOpenAuth);
  const initials = (userEmail ?? "?").slice(0, 2).toUpperCase();

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
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink text-xs font-medium text-white"
            >
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </button>
          ) : (
            <span className="relative inline-flex">
              <button
                type="button"
                onClick={handleJoinClick}
                disabled={pending}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Joining…" : "Join"}
              </button>
              {error && (
                <span
                  role="alert"
                  className="absolute right-0 top-full mt-2 w-max max-w-[220px] rounded-xl border border-red/20 bg-red-soft px-3 py-1.5 text-xs font-medium text-red shadow-sm"
                >
                  {error}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
