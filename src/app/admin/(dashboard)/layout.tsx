import { requireAdmin } from "@/lib/admin/dal";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
