"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInAction,
  signUpAction,
  signInWithGoogleAction,
  requestPasswordResetAction,
  resendConfirmationAction,
} from "@/lib/actions";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [pending, startTransition] = useTransition();
  const [resendPending, startResendTransition] = useTransition();
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

  function switchMode(next: "signin" | "signup" | "forgot") {
    setMode(next);
    setError(null);
    setMessage(null);
    setAwaitingConfirmation(false);
    setFieldError({});
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setAwaitingConfirmation(false);

    const nextFieldError: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextFieldError.email = "Please fill in this field.";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextFieldError.email = "Enter a valid email address.";
    }
    if (mode !== "forgot") {
      if (!password) {
        nextFieldError.password = "Please fill in this field.";
      } else if (password.length < 6) {
        nextFieldError.password = "Must be at least 6 characters.";
      }
    }
    setFieldError(nextFieldError);
    if (nextFieldError.email || nextFieldError.password) return;

    startTransition(async () => {
      if (mode === "forgot") {
        const result = await requestPasswordResetAction(email);
        if (result.error) {
          setError(result.error);
          return;
        }
        setMessage(result.message ?? null);
        return;
      }

      const action = mode === "signin" ? signInAction : signUpAction;
      const result = await action(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.message) {
        setMessage(result.message);
        setAwaitingConfirmation(mode === "signup");
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function resend() {
    setError(null);
    startResendTransition(async () => {
      const result = await resendConfirmationAction(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? null);
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

        <h2 className="text-lg font-semibold text-ink">
          {mode === "forgot" ? "Reset your password" : "Join the Winter Arc"}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {mode === "forgot"
            ? "Enter your email and we'll send you a reset link."
            : "Sign in to start tracking your 12-week challenge."}
        </p>

        {mode !== "forgot" && (
          <div className="mt-5 flex gap-1 rounded-full bg-surface p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 rounded-full py-2 transition-check ${
                mode === "signin" ? "bg-panel text-ink shadow-sm" : "text-ink-muted"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-full py-2 transition-check ${
                mode === "signup" ? "bg-panel text-ink shadow-sm" : "text-ink-muted"
              }`}
            >
              Sign up
            </button>
          </div>
        )}

        <form onSubmit={submit} noValidate className="mt-4 space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError.email) setFieldError((f) => ({ ...f, email: undefined }));
              }}
              placeholder="Email"
              className={`w-full rounded-xl border bg-page px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary ${
                fieldError.email ? "border-red" : "border-border"
              }`}
            />
            {fieldError.email && <FieldTooltip message={fieldError.email} />}
          </div>

          {mode !== "forgot" && (
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldError.password) setFieldError((f) => ({ ...f, password: undefined }));
                }}
                placeholder="Password"
                className={`w-full rounded-xl border bg-page px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary ${
                  fieldError.password ? "border-red" : "border-border"
                }`}
              />
              {fieldError.password && <FieldTooltip message={fieldError.password} />}
            </div>
          )}

          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-xs font-medium text-ink-muted transition-check hover:text-ink"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red">{error}</p>}
          {message && <p className="text-sm text-green">{message}</p>}

          {awaitingConfirmation && (
            <button
              type="button"
              onClick={resend}
              disabled={resendPending}
              className="text-xs font-medium text-ink-muted underline transition-check hover:text-ink disabled:opacity-60"
            >
              {resendPending ? "Resending…" : "Didn't get it? Resend confirmation email"}
            </button>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
          >
            {pending
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in & join"
                : mode === "signup"
                  ? "Create account & join"
                  : "Send reset link"}
          </button>

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="w-full text-center text-xs font-medium text-ink-muted transition-check hover:text-ink"
            >
              Back to sign in
            </button>
          )}
        </form>

        {mode !== "forgot" && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wide text-ink-faint">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form action={signInWithGoogleAction}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-page py-3 text-sm font-medium text-ink transition-check hover:border-primary"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-relaxed text-ink-faint">
              By continuing you agree to the{" "}
              <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-ink">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-ink">
                Privacy Policy
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.1-5l-6.5-5.5C29.6 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.8 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.5 5.5C41.9 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
