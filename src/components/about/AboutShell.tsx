"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/home/SiteHeader";
import { AuthModal } from "@/components/home/AuthModal";
import { ProfileModal } from "@/components/home/ProfileModal";
import { QrModal } from "@/components/about/QrModal";
import { getCurrentWeek } from "@/lib/arc-logic";
import type { HomeData } from "@/lib/arc-data";

const BMC_URL = "https://buymeacoffee.com/fuwad";
const INSTAGRAM_URL = "https://www.instagram.com/fuwad.design";
const LINKEDIN_URL = "https://www.linkedin.com/in/fuwad/";

function MakerBadge({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="shrink-0">
      <circle cx="50" cy="50" r="44" fill="#F2EEDC" stroke="#1c1812" strokeWidth="3" />
      <rect x="44" y="1" width="12" height="12" fill="white" stroke="#1c1812" strokeWidth="2.5" />
      <rect x="87" y="44" width="12" height="12" fill="white" stroke="#1c1812" strokeWidth="2.5" />
      <rect x="44" y="87" width="12" height="12" fill="white" stroke="#1c1812" strokeWidth="2.5" />
      <rect x="1" y="44" width="12" height="12" fill="white" stroke="#1c1812" strokeWidth="2.5" />
      <text x="24" y="63" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="34" fill="#33302b">
        Fu
      </text>
      <rect x="70" y="55" width="8" height="8" fill="#e2572b" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#FEE411" />
          <stop offset="20%" stopColor="#FEDA77" />
          <stop offset="40%" stopColor="#F58529" />
          <stop offset="60%" stopColor="#DD2A7B" />
          <stop offset="80%" stopColor="#8134AF" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="16.4" cy="7.6" r="1" fill="white" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
      <path
        d="M7.6 9.8h2.6v8.4H7.6V9.8Zm1.3-4.2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 9.8h2.5v1.2h.03c.35-.66 1.2-1.36 2.47-1.36 2.64 0 3.13 1.74 3.13 4v4.56h-2.6v-4.04c0-.96-.02-2.2-1.34-2.2-1.34 0-1.55 1.05-1.55 2.13v4.11H12V9.8Z"
        fill="white"
      />
    </svg>
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
      <path d="M16 11h1a1.6 1.6 0 0 1 0 3.2h-1" stroke="#0D0C22" strokeWidth="1.4" fill="none" />
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
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
  const { arc, userArc, userEmail } = data;
  const joined = userArc !== null;
  const loggedIn = data.userId !== null;

  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const currentWeek = getCurrentWeek(arc);
  const joinedLabel = userArc
    ? new Date(userArc.joined_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen">
      <SiteHeader
        joined={joined}
        loggedIn={loggedIn}
        userEmail={userEmail}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="mx-auto w-full max-w-5xl px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">About</p>
        <h1 className="mt-2 font-heading text-5xl leading-[1.05] text-ink">
          The story <span className="text-ink-faint">behind Winter Arc</span>
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-border bg-panel px-8 py-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Story by the maker
            </p>
            <h2 className="mt-3 font-heading text-2xl text-ink">Why I built this</h2>

            <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-muted">
              <p>
                Winter Challenge, Designers Edition was born from a simple observation: we all want
                to become better designers, but staying consistent is hard.
              </p>
              <p>
                There&apos;s always another tutorial to watch, another case study to read, or another
                idea to save for later. We keep learning, but sometimes never get around to actually
                doing.
              </p>
              <p>So we wanted to make something different.</p>
              <p>
                A 12-week challenge that gives designers a reason to show up every day, not to become
                perfect, but to keep moving. Each week brings small, practical activities across
                design practice, learning, product thinking, building, sharing, and connecting with
                other people.
              </p>
              <p>
                Some days you&apos;ll design a screen. Some days you&apos;ll study how a real product
                works. You might learn a new concept, work on your own idea, share your progress, or
                simply talk to another designer.
              </p>
              <p>
                And there&apos;s room to pause too. Because growth doesn&apos;t mean being productive
                every single day.
              </p>
              <p>
                The goal is simple: start the winter with an intention, stay consistent through the
                journey, and finish it with something you can be proud of.
              </p>
              <p>This is your winter to practice, grow, connect, and build.</p>
            </div>

            <div className="mt-8 flex items-start gap-4 border-t border-border pt-6">
              <MakerBadge />
              <div className="min-w-0">
                <p className="font-heading text-lg text-ink">Fuwad</p>
                <p className="text-sm text-ink-muted">Maker of Winter Arc</p>
                <div className="mt-2 flex gap-3">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-ink-muted transition-check hover:text-ink"
                  >
                    <InstagramIcon />
                    Instagram
                  </a>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-ink-muted transition-check hover:text-ink"
                  >
                    <LinkedInIcon />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>

            <p className="mt-6 font-heading text-3xl italic text-ink-faint">Fuwad</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-panel px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                How it works
              </p>
              <ul className="mt-3 space-y-3 text-sm text-ink-muted">
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Tick off daily tasks, most need no proof, a few ask for a link or note.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Hit each week&apos;s connection goal, a few real conversations, not busywork.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Ship a weekly deliverable, a screen, a concept, a breakdown, or a build step.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-panel px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Support the project
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Winter Arc is free to use. If it&apos;s helping your practice, a coffee keeps it going.
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
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Facts</p>
              <dl className="mt-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-ink-muted">Duration</dt>
                  <dd className="font-medium text-ink">{arc.duration_weeks} weeks</dd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-ink-muted">Starts</dt>
                  <dd className="font-medium text-ink">
                    {new Date(arc.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-ink-muted">Built by</dt>
                  <dd className="font-medium text-ink">One person</dd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-ink-muted">Cost</dt>
                  <dd className="font-medium text-ink">Free</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} url={BMC_URL} />
      {userArc && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          userEmail={userEmail}
          currentWeek={currentWeek}
          durationWeeks={arc.duration_weeks}
          joinedLabel={joinedLabel}
          arcName={arc.name}
          status={userArc.status}
        />
      )}
    </div>
  );
}
