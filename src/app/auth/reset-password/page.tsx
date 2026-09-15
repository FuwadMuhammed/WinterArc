import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Choose a new password for your Winter Arc account.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-14">
      <div className="flex justify-center">
        <Logo className="h-6 w-auto text-ink" />
      </div>

      {user ? (
        <>
          <h1 className="mt-4 text-center text-lg font-semibold text-ink">Set a new password</h1>
          <p className="mt-1 text-center text-sm text-ink-muted">
            Choose a new password for your account.
          </p>
          <ResetPasswordForm />
        </>
      ) : (
        <>
          <h1 className="mt-4 text-center text-lg font-semibold text-ink">Link expired</h1>
          <p className="mt-1 text-center text-sm text-ink-muted">
            This password reset link is invalid or has expired. Go back and request a new one from
            the sign-in screen.
          </p>
        </>
      )}
    </main>
  );
}
