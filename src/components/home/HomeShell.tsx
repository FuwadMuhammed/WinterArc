"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { TabBar, type TabKey } from "./TabBar";
import { Sidebar } from "./Sidebar";
import { SiteFooter } from "@/components/SiteFooter";
import { PostHogUser } from "@/components/PostHogUser";
import { AuthModal } from "./AuthModal";
import { ProfileModal } from "./ProfileModal";
import { WelcomeModal, useWelcomeSeen } from "./WelcomeModal";
import { TaskEntryOverrideProvider } from "./TaskEntryOverride";
import { OverviewTab } from "./tabs/OverviewTab";
import { DailyTab } from "./tabs/DailyTab";
import { WeeklyTab } from "./tabs/WeeklyTab";
import { getCurrentWeek, type PlanDay } from "@/lib/arc-logic";
import type { HomeData } from "@/lib/arc-data";
import type { TaskEntry } from "@/lib/database.types";

export function HomeShell({ authError, ...data }: HomeData & { authError: string | null }) {
  const { arc, weeks, tasks, userArc, userEmail, userAvatarUrl } = data;
  const joined = userArc !== null;
  const loggedIn = data.userId !== null;

  // Mirrors data.entries, but a TaskCard can patch it instantly on toggle
  // (see TaskEntryOverride) instead of every reader waiting on the debounced
  // write + router.refresh() that eventually brings fresh entries down. Reset
  // during render (not in an effect) whenever the server sends a new array,
  // the standard way to keep local state in sync with a prop.
  const [entries, setEntries] = useState(data.entries);
  const [syncedServerEntries, setSyncedServerEntries] = useState(data.entries);
  if (data.entries !== syncedServerEntries) {
    setSyncedServerEntries(data.entries);
    setEntries(data.entries);
  }

  const applyLocalEntry = useCallback(
    (taskId: string, patch: { completed: boolean; note: string }) => {
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.task_id === taskId);
        if (idx === -1) {
          const placeholder: TaskEntry = {
            id: `local-${taskId}`,
            user_arc_id: userArc?.id ?? "",
            task_id: taskId,
            completed: patch.completed,
            note: patch.note || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return [...prev, placeholder];
        }
        const next = [...prev];
        next[idx] = { ...next[idx], completed: patch.completed, note: patch.note || next[idx].note };
        return next;
      });
    },
    [userArc?.id],
  );

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
  // null follows the current week (so a rollover mid-session moves with it);
  // the clamp keeps a stale pick from pointing at a locked future week.
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const viewWeek = Math.min(selectedWeek ?? currentWeek, currentWeek);
  // Set by "jump to where you left off"; DailyTab scrolls to it and clears it.
  const [jumpTo, setJumpTo] = useState<PlanDay | null>(null);
  function goToPlanDay(target: PlanDay) {
    setTab("daily");
    setSelectedWeek(target.week);
    setJumpTo(target);
  }

  // First visit after joining: nothing ticked yet and not dismissed on this device.
  const { seen: welcomeSeen, markSeen: markWelcomeSeen } = useWelcomeSeen(userArc?.id ?? null);
  const welcomeOpen = joined && entries.length === 0 && !welcomeSeen && !authOpen && !profileOpen;

  const joinedLabel = userArc
    ? new Date(userArc.joined_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <TaskEntryOverrideProvider apply={applyLocalEntry}>
      <div className="min-h-screen">
        <PostHogUser userId={data.userId} email={userEmail} joinedAt={userArc?.joined_at ?? null} />
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

        <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
          <h1 className="font-heading text-4xl leading-[1.05] text-ink sm:text-5xl">
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
                  onGoToPlanDay={goToPlanDay}
                />
              )}
              {tab === "daily" && (
                <DailyTab
                  arc={arc}
                  weeks={weeks}
                  tasks={tasks}
                  entries={entries}
                  userArc={userArc}
                  selectedWeek={viewWeek}
                  onSelectWeek={setSelectedWeek}
                  onOpenAuth={() => setAuthOpen(true)}
                  jumpTo={jumpTo}
                  onJump={goToPlanDay}
                  onJumpDone={() => setJumpTo(null)}
                />
              )}
              {tab === "weekly" && (
                <WeeklyTab
                  arc={arc}
                  weeks={weeks}
                  tasks={tasks}
                  entries={entries}
                  userArc={userArc}
                  selectedWeek={viewWeek}
                  onSelectWeek={setSelectedWeek}
                  onOpenAuth={() => setAuthOpen(true)}
                />
              )}
            </div>

            <Sidebar
              arc={arc}
              userArc={userArc}
              tasks={tasks}
              entries={entries}
              loggedIn={loggedIn}
              onOpenAuth={() => setAuthOpen(true)}
            />
          </div>
        </main>
        <SiteFooter />

        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        <WelcomeModal
          open={welcomeOpen}
          durationWeeks={arc.duration_weeks}
          onStart={() => {
            markWelcomeSeen();
            setTab("daily");
          }}
          onClose={markWelcomeSeen}
        />
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
    </TaskEntryOverrideProvider>
  );
}
