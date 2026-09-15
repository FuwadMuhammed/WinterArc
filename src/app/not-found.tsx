import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Logo className="h-7 w-auto text-ink" />

      <p className="mt-10 font-heading text-7xl text-ink">404</p>
      <h1 className="mt-3 text-lg font-semibold text-ink">Page not found</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist, or may have moved.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-check hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
