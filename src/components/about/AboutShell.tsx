"use client";

import { INSTAGRAM_URL, LINKEDIN_URL } from "@/lib/constants";
import { useState } from "react";
import Image from "next/image";
import { PageChrome } from "@/components/PageChrome";
import { QrModal } from "@/components/about/QrModal";
import { InstagramIcon, LinkedInIcon } from "@/components/icons";
import type { HomeData } from "@/lib/arc-data";
import { CONTACT_EMAIL } from "@/lib/constants";

const BMC_URL = "https://buymeacoffee.com/fuwad";
const TOPMATE_URL = "https://topmate.io/fuwad";

const AKASH_URL = "https://www.linkedin.com/in/noakash/";
const ASHFAQE_URL = "https://www.linkedin.com/in/ashfaqe/";

const INLINE_LINK =
  "font-medium text-ink underline decoration-border underline-offset-4 transition-check hover:decoration-ink";

function MakerPhoto({ size = 56 }: { size?: number }) {
  return (
    <Image
      src="/fuwad.png"
      alt="Fuwad"
      width={size}
      height={size}
      className="shrink-0 rounded-full"
    />
  );
}

function BmcIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#FFDD00" />
      <path
        d="M7 10h9v4a3.5 3.5 0 0 1-3.5 3.5h-2A3.5 3.5 0 0 1 7 14v-4Z"
        stroke="#0D0C22"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16 11h1a1.6 1.6 0 0 1 0 3.2h-1"
        stroke="#0D0C22"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d="M9.5 6.2c0 .8-.8.8-.8 1.6M12.5 6.2c0 .8-.8.8-.8 1.6"
        stroke="#0D0C22"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect x="5.3" y="5.3" width="2.4" height="2.4" fill="currentColor" />
      <rect x="16.3" y="5.3" width="2.4" height="2.4" fill="currentColor" />
      <rect x="5.3" y="16.3" width="2.4" height="2.4" fill="currentColor" />
      <rect x="14" y="14" width="3" height="3" fill="currentColor" />
      <rect x="18" y="14" width="3" height="3" fill="currentColor" />
      <rect x="14" y="18" width="3" height="3" fill="currentColor" />
      <rect x="18" y="18" width="3" height="3" fill="currentColor" />
    </svg>
  );
}

export function AboutShell(data: HomeData) {
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <PageChrome {...data}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        About
      </p>
      <h1 className="mt-2 font-heading text-4xl leading-[1.05] text-ink sm:text-5xl">
        The story <span className="text-ink-faint">behind Winter Arc</span>
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="self-start rounded-3xl border border-border bg-panel px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Story by the maker
          </p>
          <h2 className="mt-3 font-heading text-2xl text-ink">
            Why I built this
          </h2>

          <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-muted">
            <p>
              Winter Arc started from a simple observation: we all want to
              become better designers, but staying consistent is hard.
              There&apos;s always another tutorial to watch or case study to
              save for later. We keep learning, and rarely get around to doing.
            </p>
            <p>
              So this is a 12-week challenge that gives you a reason to show up
              every day, not to be perfect, but to keep moving. Small, practical
              activities each week: design a screen, study a real product, learn
              a concept, build your own idea, share your progress, talk to
              another designer. And room to pause, because growth isn&apos;t
              being productive every single day.
            </p>
            <p>
              Start the winter with an intention, stay consistent, and finish
              with something you&apos;re proud of. This is your winter to
              practice, grow, connect, and build.
            </p>
            <p>
              A big thank you to{" "}
              <a
                href={AKASH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={INLINE_LINK}
              >
                Akash
              </a>{" "}
              and{" "}
              <a
                href={ASHFAQE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={INLINE_LINK}
              >
                Ashfaqe
              </a>{" "}
              for helping shape this.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
            <MakerPhoto size={64} />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg text-ink">Fuwad</p>
              <p className="text-sm text-ink-muted">Maker of Winter Arc</p>
            </div>
            <a
              href={TOPMATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="order-last basis-full rounded-full border border-border bg-panel px-4 py-2 text-center text-sm font-medium text-ink transition-check hover:border-primary sm:order-none sm:basis-auto"
            >
              Book a 1:1 call
            </a>
            <div className="flex shrink-0 gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fuwad on Instagram"
                title="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-check hover:opacity-80"
              >
                <InstagramIcon size={26} />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fuwad on LinkedIn"
                title="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-check hover:opacity-80"
              >
                <LinkedInIcon size={26} />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-panel px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              How it works
            </p>
            <ul className="mt-3 space-y-3 text-sm text-ink-muted">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                Tick off daily tasks, most need no proof, a few ask for a link
                or note.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                Make real connections, a few genuine conversations each week,
                not busywork.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                Ship a weekly deliverable, a screen, a concept, a breakdown, or
                a build step.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-panel px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Support the project
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Winter Arc is free to use. If it&apos;s helping your practice, a
              coffee keeps it going.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href={BMC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90"
              >
                <BmcIcon />
                Buy me a coffee
              </a>
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                aria-label="Show QR code"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-panel text-ink transition-check hover:border-primary"
              >
                <QrIcon />
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-panel px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Sponsor this project
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Want your brand in front of designers showing up every day for 12
              weeks?
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Sponsoring%20Winter%20Arc`}
              className="mt-4 flex w-full items-center justify-center rounded-full border border-border bg-panel py-3 text-sm font-medium text-ink transition-check hover:border-primary"
            >
              Talk to me
            </a>
          </div>
        </div>
      </div>
      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} url={BMC_URL} />
    </PageChrome>
  );
}
