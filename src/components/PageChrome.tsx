"use client";

import { useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthModal } from "@/components/home/AuthModal";
import { ProfileModal } from "@/components/home/ProfileModal";
import { getCurrentWeek } from "@/lib/arc-logic";
import type { HomeData } from "@/lib/arc-data";

/** Header, footer and the auth/profile sheets for every page that isn't the
 * home tracker. Pages pass their own content as children. */
export function PageChrome({ children, ...data }: HomeData & { children: ReactNode }) {
  const { arc, userArc, userEmail, userAvatarUrl } = data;
  const joined = userArc !== null;
  const loggedIn = data.userId !== null;

  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14">{children}</main>
      <SiteFooter />

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
