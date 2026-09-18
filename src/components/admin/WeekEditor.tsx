"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TaskFormSheet, INPUT_CLASS, LABEL_CLASS } from "@/components/admin/TaskFormSheet";
import { CATEGORY_LABEL } from "@/lib/constants";
import type { Week } from "@/lib/database.types";
import type { TaskWithStats } from "@/lib/admin/tasks-data";
import {
  createTaskAction,
  deleteTaskAction,
  moveTaskAction,
  updateTaskAction,
  updateWeekAction,
  type TaskInput,
} from "@/lib/admin/task-actions";

type Result = { error: string | null; message?: string | null };
type Editing = { mode: "create" } | { mode: "edit"; task: TaskWithStats } | null;

export function WeekEditor({ week, tasks }: { week: Week; tasks: TaskWithStats[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<TaskWithStats | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  // Week settings are controlled so the save button can reflect dirty state.
  const [isRest, setIsRest] = useState(week.is_rest_week);
  const [goal, setGoal] = useState(week.connection_goal === null ? "" : String(week.connection_goal));
  const [weekStatus, setWeekStatus] = useState<Result | null>(null);
  const weekDirty =
    isRest !== week.is_rest_week || goal !== (week.connection_goal === null ? "" : String(week.connection_goal));

  function saveWeek(e: React.FormEvent) {
    e.preventDefault();
    setWeekStatus(null);
    startTransition(async () => {
      const result = await updateWeekAction(week.id, {
        is_rest_week: isRest,
        connection_goal: goal.trim() === "" ? null : Number(goal),
      });
      setWeekStatus(result);
      if (!result.error) router.refresh();
    });
  }

  function submitTask(input: TaskInput) {
    if (!editing) return;
    setFormError(null);
    startTransition(async () => {
      const result =
        editing.mode === "create"
          ? await createTaskAction(week.week_number, input)
          : await updateTaskAction(editing.task.id, input);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  function runListAction(action: () => Promise<Result>) {
    setListError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setListError(result.error);
        return;
      }
      setDeleting(null);
      router.refresh();
    });
  }

  const groups: { key: string; label: string; tasks: TaskWithStats[] }[] = [
    ...[1, 2, 3, 4, 5, 6, 7].map((d) => ({
      key: `day-${d}`,
      label: `Day ${d}`,
      tasks: tasks.filter((t) => t.day_number === d),
    })),
    { key: "weekly", label: "Weekly deliverable", tasks: tasks.filter((t) => t.day_number === null) },
  ].filter((g) => g.tasks.length > 0);

  return (
    <div className="space-y-6">
      <form onSubmit={saveWeek} className="rounded-3xl border border-border bg-panel px-6 py-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Week {week.week_number} settings
            </h2>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={isRest}
                onChange={(e) => setIsRest(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Rest week
            </label>
          </div>
          <div>
            <label htmlFor="week-goal" className={LABEL_CLASS}>
              Connection goal
            </label>
            <input
              id="week-goal"
              type="number"
              min={0}
              max={50}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="None"
              className={`${INPUT_CLASS} w-28`}
            />
          </div>
          <button
            type="submit"
            disabled={pending || !weekDirty}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-40"
          >
            Save
          </button>
          {weekStatus?.error && <p className="text-sm text-red">{weekStatus.error}</p>}
          {weekStatus && !weekStatus.error && !weekDirty && (
            <p className="text-sm text-green">{weekStatus.message}</p>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {tasks.length} task{tasks.length === 1 ? "" : "s"} ·{" "}
          {tasks.reduce((s, t) => s + t.weight, 0)} units
        </p>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setEditing({ mode: "create" });
          }}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-check hover:opacity-90"
        >
          + Add task
        </button>
      </div>

      {listError && (
        <p className="rounded-xl border border-red/20 bg-red-soft px-4 py-2 text-sm text-red">{listError}</p>
      )}

      {groups.length === 0 && (
        <p className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-sm text-ink-muted">
          No tasks this week yet.
        </p>
      )}

      {groups.map((g) => (
        <section key={g.key} className="overflow-hidden rounded-3xl border border-border bg-panel">
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-sm font-semibold text-ink">{g.label}</p>
            <p className="text-xs text-ink-faint">{g.tasks.length}</p>
          </div>
          <ul className="divide-y divide-border border-t border-border">
            {g.tasks.map((t, i) => {
              const label = CATEGORY_LABEL[t.category] ?? t.category;
              return (
                <li key={t.id} className={`flex items-start gap-4 px-6 py-4 ${pending ? "opacity-70" : ""}`}>
                  <CategoryIcon category={label} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      {t.heading}
                      {t.weight > 1 && (
                        <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                          ×{t.weight}
                        </span>
                      )}
                      {t.requires_proof && (
                        <span className="ml-2 rounded-full bg-blue-soft px-2 py-0.5 text-[10px] font-semibold text-blue">
                          Proof
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">{t.subcontent}</p>
                    <p className="mt-1 text-xs text-ink-faint">
                      {label} · {t.entryCount} member {t.entryCount === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={pending || i === 0}
                      onClick={() => runListAction(() => moveTaskAction(t.id, "up"))}
                      className="rounded-full px-2 py-1 text-xs text-ink-muted transition-check hover:bg-surface hover:text-ink disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={pending || i === g.tasks.length - 1}
                      onClick={() => runListAction(() => moveTaskAction(t.id, "down"))}
                      className="rounded-full px-2 py-1 text-xs text-ink-muted transition-check hover:bg-surface hover:text-ink disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setFormError(null);
                        setEditing({ mode: "edit", task: t });
                      }}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted transition-check hover:bg-surface hover:text-ink"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setDeleting(t)}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-red transition-check hover:bg-red-soft"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <TaskFormSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        task={editing?.mode === "edit" ? editing.task : null}
        weekNumber={week.week_number}
        onSubmit={submitTask}
        pending={pending}
        error={formError}
      />

      <ConfirmSheet
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete this task?"
        description={
          deleting
            ? `"${deleting.heading}" will be removed from week ${week.week_number}. ${
                deleting.entryCount > 0
                  ? `${deleting.entryCount} member ${deleting.entryCount === 1 ? "entry" : "entries"} for it will be deleted too.`
                  : "No member has an entry for it yet."
              } This can't be undone.`
            : undefined
        }
        confirmLabel="Delete task"
        onConfirm={() => deleting && runListAction(() => deleteTaskAction(deleting.id))}
        pending={pending}
      />
    </div>
  );
}
