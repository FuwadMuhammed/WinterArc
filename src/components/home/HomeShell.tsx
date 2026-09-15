"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { TabBar, type TabKey } from "./TabBar";
import { Sidebar } from "./Sidebar";
import { AuthModal } from "./AuthModal";
import { ProfileModal } from "./ProfileModal";
import { OverviewTab } from "./tabs/OverviewTab";
import { DailyTab } from "./tabs/DailyTab";
import { WeeklyTab } from "./tabs/WeeklyTab";
import { getCurrentWeek } from "@/lib/arc-logic";
import type { HomeData } from "@/lib/arc-data";

export function HomeShell({ authError, ...data }: HomeData & { authError: string | null }) {
  const { arc, weeks, tasks, entries, userArc, userEmail, userAvatarUrl } = data;
  const joined = userArc !== null;
  const loggedIn = data.userId !== null;

  const [tab, setTab] = useState<TabKey>("overview");
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [error, setError] = useState(authError);
  const router = useRouter();

  useEffect(() => {
    if (authError) {
      // Strip ?authError= from the URL so a refresh doesn't re-show it.
      router.replace("/", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authError]);

  const currentWeek = getCurrentWeek(arc, userArc);
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
        userAvatarUrl={userAvatarUrl}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {error && (
        <div className="mx-auto mt-4 flex w-full max-w-5xl items-start justify-between gap-3 rounded-2xl border border-red/20 bg-red-soft px-4 py-3 text-sm text-red">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss"
            className="shrink-0 text-red/70 transition-check hover:text-red"
          >
            ✕
          </button>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl px-6 py-14">
        <h1 className="font-heading text-5xl leading-[1.05] text-ink">
          {arc.name} <span className="text-ink-faint">for designers</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">{arc.description}</p>

        <div className="mt-8 max-w-md">
          <TabBar active={tab} onChange={setTab} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            {tab === "overview" && (
              <OverviewTab
                arc={arc}
                weeks={weeks}
                tasks={tasks}
                entries={entries}
                userArc={userArc}
                onOpenAuth={() => setAuthOpen(true)}
              />
            )}
            {tab === "daily" && (
              <DailyTab
                arc={arc}
                weeks={weeks}
                tasks={tasks}
                entries={entries}
                userArc={userArc}
                onOpenAuth={() => setAuthOpen(true)}
              />
            )}
            {tab === "weekly" && (
              <WeeklyTab
                arc={arc}
                weeks={weeks}
                tasks={tasks}
                entries={entries}
                userArc={userArc}
                onOpenAuth={() => setAuthOpen(true)}
              />
            )}
          </div>

          <Sidebar arc={arc} userArc={userArc} loggedIn={loggedIn} onOpenAuth={() => setAuthOpen(true)} />
        </div>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      {userArc && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          userEmail={userEmail}
          userAvatarUrl={userAvatarUrl}
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
