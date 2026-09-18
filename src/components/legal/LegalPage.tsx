import type { ReactNode } from "react";

/** Shared framing for the privacy and terms pages: eyebrow, title, date, and
 * the same card the About story uses. Content is plain semantic HTML styled
 * by the wrappers below. */
export function LegalPage({
  eyebrow,
  title,
  titleAccent,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  titleAccent: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{eyebrow}</p>
      <h1 className="mt-2 font-heading text-4xl leading-[1.05] text-ink sm:text-5xl">
        {title} <span className="text-ink-faint">{titleAccent}</span>
      </h1>
      <p className="mt-3 text-sm text-ink-muted">Last updated {updated}</p>

      <div className="mt-8 max-w-3xl rounded-3xl border border-border bg-panel px-5 py-6 sm:px-8 sm:py-8">
        <div className="space-y-4 text-base leading-relaxed text-ink-muted [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:decoration-ink">
          {children}
        </div>
      </div>
    </>
  );
}
