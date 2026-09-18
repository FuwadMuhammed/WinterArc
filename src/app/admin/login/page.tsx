import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  // The proxy already redirects signed-in admins, this is belt and braces.
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-14">
      <div className="flex justify-center">
        <Logo className="h-6 w-auto text-ink" />
      </div>
      <h1 className="mt-4 text-center text-lg font-semibold text-ink">Admin sign in</h1>
      <p className="mt-1 text-center text-sm text-ink-muted">
        This area is for Winter Arc organisers only.
      </p>
      <AdminLoginForm />
    </main>
  );
}
