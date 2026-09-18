"use client";

import { useState, useTransition } from "react";
import { updatePasswordAction } from "@/lib/actions";

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-page px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary";

/** Change-password content that swaps into the profile sheet. Mount it only
 * while shown so the fields start empty each time. */
export function ChangePasswordPanel({ onBack }: { onBack: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError("Must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    startTransition(async () => {
      const result = await updatePasswordAction(newPassword);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <>
        <h2 className="text-lg font-semibold text-ink">Password updated</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Use your new password the next time you sign in.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90"
        >
          Done
        </button>
      </>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-ink">Change password</h2>
      <form onSubmit={submit} noValidate className="mt-4 space-y-2">
        <input
          type="password"
          autoFocus
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className={INPUT_CLASS}
        />
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className={INPUT_CLASS}
        />
        {error && <p className="text-sm text-red">{error}</p>}
        <div className="flex flex-col gap-2 pt-4">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save new password"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onBack}
            className="w-full rounded-full border border-border py-3 text-sm font-semibold text-ink transition-check hover:bg-page disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
