"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { setTaskEntry } from "@/lib/actions";
import { track } from "@/lib/analytics";
import { CATEGORY_LABEL, CATEGORY_EMOJI, NOTE_MAX_LENGTH, taskCardColor } from "@/lib/constants";
import type { Task, TaskEntry } from "@/lib/database.types";

function CheckMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6.2 5 9l5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function celebrate(origin?: { x: number; y: number }) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(15);
  }
  confetti({
    particleCount: 32,
    spread: 55,
    startVelocity: 28,
    scalar: 0.75,
    ticks: 150,
    gravity: 1.1,
    origin: origin ?? { x: 0.5, y: 0.5 },
  });
}

export function TaskCard({
  task,
  entry,
  index = 0,
  readOnly = false,
}: {
  task: Task;
  entry: TaskEntry | undefined;
  /** Picks this card's pastel background from the palette. */
  index?: number;
  /** Guests can preview a task but can't act on it until they join. */
  readOnly?: boolean;
}) {
  const [completed, setCompleted] = useState(entry?.completed ?? false);
  const [note, setNote] = useState(entry?.note ?? "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const checkRef = useRef<HTMLButtonElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const toggleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestCompletedRef = useRef(completed);

  useEffect(() => {
    return () => {
      if (toggleDebounceRef.current) clearTimeout(toggleDebounceRef.current);
    };
  }, []);

  const label = CATEGORY_LABEL[task.category] ?? task.category;
  const emoji = CATEGORY_EMOJI[label] ?? "✅";
  const taskProps = {
    task_id: task.id,
    heading: task.heading,
    category: task.category,
    week: task.week_number,
    day: task.day_number,
    requires_proof: task.requires_proof,
  };

  function originFor(el: HTMLElement | null) {
    if (!el) return undefined;
    const rect = el.getBoundingClientRect();
    return {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
  }

  /** Instant, unblocked toggling: the checkbox never waits on the network.
   * Rapid clicks only update local state; the write to the server is
   * debounced so a flurry of clicks collapses into one request for
   * whatever the final state ends up being. */
  function toggle() {
    const next = !completed;
    setCompleted(next);
    latestCompletedRef.current = next;
    if (next) celebrate(originFor(checkRef.current));
    track(next ? "task_completed" : "task_uncompleted", taskProps);

    if (toggleDebounceRef.current) clearTimeout(toggleDebounceRef.current);
    toggleDebounceRef.current = setTimeout(() => {
      startTransition(async () => {
        await setTaskEntry(task.id, latestCompletedRef.current, note);
        router.refresh();
      });
    }, 500);
  }

  function submitProof() {
    if (!note.trim()) return;
    setCompleted(true);
    celebrate(originFor(submitRef.current));
    track("proof_submitted", { ...taskProps, note_length: note.trim().length });
    startTransition(async () => {
      await setTaskEntry(task.id, true, note);
      router.refresh();
    });
  }

  function undoProof() {
    setCompleted(false);
    track("task_uncompleted", taskProps);
    startTransition(async () => {
      await setTaskEntry(task.id, false, note);
      router.refresh();
    });
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-3xl px-5 py-4 transition-opacity duration-300 ${
        completed ? "opacity-80" : "opacity-100"
      }`}
      style={{ backgroundColor: taskCardColor(index) }}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-2xl leading-none">
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-base font-medium transition-check ${
            completed ? "text-ink-muted line-through" : "text-ink"
          }`}
        >
          {task.heading}
        </p>
        <p className="mt-0.5 text-sm text-ink-muted">{task.subcontent}</p>

        {task.requires_proof && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              data-ph-mask
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Paste a link, or a short note…"
              maxLength={NOTE_MAX_LENGTH}
              disabled={completed || readOnly}
              className="w-full rounded-full border border-border bg-white px-3.5 py-1.5 text-sm text-ink outline-none focus:border-primary disabled:opacity-60"
            />
            {!readOnly &&
              (!completed ? (
                <button
                  ref={submitRef}
                  type="button"
                  onClick={submitProof}
                  disabled={pending || !note.trim()}
                  className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-check hover:opacity-90 disabled:opacity-40"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={undoProof}
                  disabled={pending}
                  className="shrink-0 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-ink-muted transition-check hover:text-ink disabled:opacity-40"
                >
                  Undo
                </button>
              ))}
          </div>
        )}
      </div>

      {!task.requires_proof && (
        <button
          ref={checkRef}
          type="button"
          onClick={toggle}
          disabled={readOnly}
          aria-pressed={completed}
          aria-label={completed ? `Mark ${task.heading} incomplete` : `Mark ${task.heading} complete`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-check disabled:cursor-not-allowed ${
            readOnly ? "opacity-40" : ""
          } ${completed ? "bg-primary text-white" : "bg-white text-transparent"}`}
        >
          <CheckMark />
        </button>
      )}
    </div>
  );
}
