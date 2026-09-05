"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction } from "@/lib/actions";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await updatePasswordAction(password);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    });
  }

  if (done) {
    return (
      <p className="mt-6 text-center text-sm text-green">
        Password updated. Taking you back to the Winter Arc…
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-3">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary"
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary"
      />

      {error && <p className="text-sm text-red">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
