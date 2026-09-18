import Link from "next/link";

const LINK_CLASS = "transition-check hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-5 pb-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-6 text-xs text-ink-faint">
        <p>© {new Date().getFullYear()} Winter Arc · Made by Fuwad</p>
        <nav className="flex gap-4">
          <Link href="/about" className={LINK_CLASS}>
            About
          </Link>
          <Link href="/privacy" className={LINK_CLASS}>
            Privacy
          </Link>
          <Link href="/terms" className={LINK_CLASS}>
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
