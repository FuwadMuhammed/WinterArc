"use client";

import { useState } from "react";
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

export function HomeShell(data: HomeData) {
  const { arc, weeks, tasks, entries, userArc, userEmail } = data;
  const joined = userArc !== null;
  const loggedIn = data.userId !== null;

  const [tab, setTab] = useState<TabKey>("overview");
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
                joined={joined}
                onOpenAuth={() => setAuthOpen(true)}
              />
            )}
            {tab === "daily" && (
              <DailyTab
                arc={arc}
                weeks={weeks}
                tasks={tasks}
                entries={entries}
                joined={joined}
                onOpenAuth={() => setAuthOpen(true)}
              />
            )}
            {tab === "weekly" && (
              <WeeklyTab
                arc={arc}
                weeks={weeks}
                tasks={tasks}
                entries={entries}
                joined={joined}
                onOpenAuth={() => setAuthOpen(true)}
              />
            )}
          </div>

          <Sidebar
            arc={arc}
            joined={joined}
            loggedIn={loggedIn}
            onOpenAuth={() => setAuthOpen(true)}
          />
        </div>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
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
