"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinArcAction } from "@/lib/actions";
import { track } from "@/lib/analytics";

/**
 * Shared "join the arc" behavior for an already-signed-in user (SiteHeader's
 * "Join" button, Sidebar's join card): calls the join action and refreshes,
 * turning a failure into an inline message instead of an uncaught throw that
 * would otherwise crash the page (see src/app/error.tsx).
 */
export function useJoinArc(loggedIn: boolean, onOpenAuth: () => void) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleJoinClick() {
    if (!loggedIn) {
      onOpenAuth();
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await joinArcAction();
        track("arc_joined");
        router.refresh();
      } catch {
        setError("Couldn't join right now, please try again.");
      }
    });
  }

  return { pending, error, handleJoinClick };
}
