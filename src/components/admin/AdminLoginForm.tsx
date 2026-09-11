"use client";

import { useActionState, useState } from "react";
import { adminLoginAction } from "@/lib/admin/actions";
import { FieldTooltip } from "@/components/FieldTooltip";

const INPUT =
  "w-full rounded-xl border bg-page px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, undefined);
  const [fieldError, setFieldError] = useState<{ username?: string; password?: string }>({});

  function validate(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const next: typeof fieldError = {};
    if (!String(data.get("username") ?? "").trim()) next.username = "Enter your username.";
    if (!String(data.get("password") ?? "")) next.password = "Enter your password.";
    setFieldError(next);
    if (next.username || next.password) e.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={validate} noValidate className="mt-6 space-y-3">
      <div>
        <input
          name="username"
          type="text"
          autoComplete="username"
          placeholder="Username"
          onChange={() => setFieldError((f) => ({ ...f, username: undefined }))}
          className={`${INPUT} ${fieldError.username ? "border-red" : "border-border"}`}
        />
        {fieldError.username && <FieldTooltip message={fieldError.username} />}
      </div>
      <div>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          onChange={() => setFieldError((f) => ({ ...f, password: undefined }))}
          className={`${INPUT} ${fieldError.password ? "border-red" : "border-border"}`}
        />
        {fieldError.password && <FieldTooltip message={fieldError.password} />}
      </div>

      {state?.error && <p className="text-sm text-red">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
