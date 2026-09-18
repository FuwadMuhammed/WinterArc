"use client";

import { resetUser, track } from "@/lib/analytics";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmPanel } from "@/components/ConfirmPanel";
import { ChangePasswordPanel } from "@/components/home/ChangePasswordPanel";
import { deleteAccountAction, resetArcProgress, signOutAction } from "@/lib/actions";

export function ProfileModal({
  open,
  onClose,
  userEmail,
  userAvatarUrl,
  currentWeek,
  durationWeeks,
  joinedLabel,
  arcName,
  status,
}: {
  open: boolean;
  onClose: () => void;
  userEmail: string | null;
  userAvatarUrl: string | null;
  currentWeek: number;
  durationWeeks: number;
  joinedLabel: string;
  arcName: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  // One sheet, swapped content: sub-flows replace the profile view instead
  // of stacking a second sheet and backdrop on top.
  const [view, setView] = useState<"profile" | "password" | "reset" | "signout" | "delete">("profile");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  function close() {
    setView("profile");
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // Escape steps back one level: sub-flow -> profile -> closed.
      if (view === "profile") onClose();
      else setView("profile");
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, view]);

  if (!open) return null;

  function doReset() {
    startTransition(async () => {
      await resetArcProgress();
      track("progress_reset");
      router.refresh();
      setView("profile");
    });
  }

  function doDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      track("account_deleted");
      resetUser();
      router.refresh();
      close();
    });
  }

  function doSignOut() {
    startTransition(async () => {
      await signOutAction();
      resetUser();
      router.refresh();
      close();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={close}
        className="backdrop-enter fixed inset-0 bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="sheet-enter relative w-full max-w-sm rounded-t-3xl border border-border bg-panel p-6 pb-8 shadow-xl sm:rounded-3xl sm:pb-6"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />

        {view === "password" && (
          <div key="password" className="panel-enter">
            <ChangePasswordPanel onBack={() => setView("profile")} />
          </div>
        )}

        {view === "reset" && (
          <div key="reset" className="panel-enter">
            <ConfirmPanel
              title="Reset all progress?"
              description={`Every checked task and note will be cleared, and your ${durationWeeks} weeks restart from today as Day 1. This can't be undone.`}
              confirmLabel="Reset progress"
              onConfirm={doReset}
              onCancel={() => setView("profile")}
              pending={pending}
            />
          </div>
        )}

        {view === "signout" && (
          <div key="signout" className="panel-enter">
            <ConfirmPanel
              title="Sign out?"
              description="Your progress is saved. Sign back in anytime to pick up where you left off."
              confirmLabel="Sign out"
              onConfirm={doSignOut}
              onCancel={() => setView("profile")}
              pending={pending}
            />
          </div>
        )}

        {view === "delete" && (
          <div key="delete" className="panel-enter">
            <ConfirmPanel
              title="Delete your account?"
              description="Your account, all progress and notes will be permanently deleted. This can't be undone."
              confirmLabel="Delete account"
              onConfirm={doDelete}
              onCancel={() => {
                setDeleteError(null);
                setView("profile");
              }}
              pending={pending}
            />
            {deleteError && <p className="mt-3 text-center text-sm text-red">{deleteError}</p>}
          </div>
        )}

        {view === "profile" && (
          <div key="profile" className="panel-enter">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-base font-medium text-white">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (userEmail ?? "?").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {userEmail}
                </p>
                <p className="text-xs text-ink-muted">
                  Week {currentWeek} of {durationWeeks} · started {joinedLabel}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-page px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Arc
              </p>
              <p className="mt-1 text-sm text-ink">{arcName}</p>
              <p className="text-xs text-ink-muted">Status: {status}</p>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setView("password")}
                className="w-full rounded-full border border-border bg-panel py-3 text-sm font-medium text-ink transition-check hover:border-primary disabled:opacity-60"
              >
                Change password
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setView("reset")}
                className="w-full rounded-full border border-border bg-panel py-3 text-sm font-medium text-ink transition-check hover:border-primary disabled:opacity-60"
              >
                Reset progress
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setView("signout")}
                className="w-full rounded-full py-3 text-sm font-medium text-red transition-check hover:opacity-80 disabled:opacity-60"
              >
                Sign out
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setView("delete")}
                className="w-full py-2 text-xs font-medium text-ink-faint transition-check hover:text-red disabled:opacity-60"
              >
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
