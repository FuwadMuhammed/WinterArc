"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { resetArcProgress, leaveArc, signOutAction, updatePasswordAction } from "@/lib/actions";

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
  const [sheet, setSheet] = useState<"reset" | "leave" | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwPending, startPwTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function doReset() {
    startTransition(async () => {
      await resetArcProgress();
      router.refresh();
      setSheet(null);
    });
  }

  function doLeave() {
    startTransition(async () => {
      await leaveArc();
      router.refresh();
      setSheet(null);
      onClose();
    });
  }

  function doSignOut() {
    startTransition(async () => {
      await signOutAction();
      router.refresh();
      onClose();
    });
  }

  function toggleChangePassword() {
    setChangingPassword((v) => !v);
    setNewPassword("");
    setConfirmPassword("");
    setPwError(null);
    setPwSuccess(false);
  }

  function doChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);

    if (newPassword.length < 6) {
      setPwError("Must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match.");
      return;
    }

    startPwTransition(async () => {
      const result = await updatePasswordAction(newPassword);
      if (result.error) {
        setPwError(result.error);
        return;
      }
      setPwSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    });
  }

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
        className="sheet-enter relative w-full max-w-sm rounded-t-3xl border border-border bg-panel p-6 pb-8 shadow-xl sm:rounded-3xl sm:pb-6"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />

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
            <p className="truncate text-sm font-medium text-ink">{userEmail}</p>
            <p className="text-xs text-ink-muted">
              Week {currentWeek} of {durationWeeks} · joined {joinedLabel}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-page px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Arc</p>
          <p className="mt-1 text-sm text-ink">{arcName}</p>
          <p className="text-xs text-ink-muted">Status: {status}</p>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={toggleChangePassword}
            className="w-full rounded-full border border-border bg-panel py-3 text-sm font-medium text-ink transition-check hover:border-primary"
          >
            {changingPassword ? "Cancel" : "Change password"}
          </button>

          {changingPassword && (
            <form onSubmit={doChangePassword} noValidate className="mt-3 space-y-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary"
              />
              {pwError && <p className="text-sm text-red">{pwError}</p>}
              {pwSuccess && <p className="text-sm text-green">Password updated.</p>}
              <button
                type="submit"
                disabled={pwPending}
                className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
              >
                {pwPending ? "Saving…" : "Save new password"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => setSheet("reset")}
            className="w-full rounded-full border border-border bg-panel py-3 text-sm font-medium text-ink transition-check hover:border-primary disabled:opacity-60"
          >
            Reset progress
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setSheet("leave")}
            className="w-full rounded-full border border-red/30 bg-red-soft/40 py-3 text-sm font-medium text-red transition-check hover:border-red disabled:opacity-60"
          >
            Leave the Winter Arc
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={doSignOut}
            className="w-full rounded-full py-3 text-sm font-medium text-ink-muted transition-check hover:text-ink disabled:opacity-60"
          >
            Sign out
          </button>
        </div>
      </div>

      <ConfirmSheet
        open={sheet === "reset"}
        onClose={() => setSheet(null)}
        title="Reset all progress?"
        description="Every checked task, milestone, and logged connection for the Winter Arc will be cleared. This can't be undone."
        confirmLabel="Reset progress"
        onConfirm={doReset}
        pending={pending}
      />
      <ConfirmSheet
        open={sheet === "leave"}
        onClose={() => setSheet(null)}
        title="Leave the Winter Arc?"
        description="You'll lose your progress and need to rejoin from scratch."
        confirmLabel="Leave the Winter Arc"
        onConfirm={doLeave}
        pending={pending}
      />
    </div>
  );
}
