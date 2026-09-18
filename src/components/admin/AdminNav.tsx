"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { adminLogoutAction } from "@/lib/admin/actions";

const NAV: { label: string; href: string; soon?: boolean }[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Tasks & Weeks", href: "/admin/tasks" },
  { label: "Members", href: "/admin/members" },
  { label: "Submissions", href: "/admin/submissions" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-panel px-4 py-6">
      <div className="flex items-center gap-2 px-2">
        <Link href="/" aria-label="Back to site">
          <Logo className="h-5 w-auto text-ink" />
        </Link>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Admin
        </span>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          if (item.soon) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-faint"
              >
                {item.label}
                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  Soon
                </span>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2 text-sm transition-check ${
                active ? "bg-primary font-semibold text-white" : "text-ink hover:bg-surface"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={adminLogoutAction} className="mt-auto">
        <button
          type="submit"
          className="w-full rounded-full border border-border bg-page py-2.5 text-sm font-medium text-ink transition-check hover:border-primary"
        >
          Log out
        </button>
      </form>
    </aside>
  );
}
