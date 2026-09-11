"use client";

import { useState } from "react";
import { AdminSheet } from "@/components/admin/AdminSheet";
import { CATEGORY_LABEL } from "@/lib/constants";
import type { Task, TaskCategory } from "@/lib/database.types";
import type { TaskInput } from "@/lib/admin/task-actions";

export const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary";
export const LABEL_CLASS = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint";

const CATEGORIES = Object.keys(CATEGORY_LABEL) as TaskCategory[];

export function TaskFormSheet({
  open,
  onClose,
  task,
  weekNumber,
  onSubmit,
  pending,
  error,
}: {
  open: boolean;
  onClose: () => void;
  /** Editing an existing task, or null when creating. */
  task: Task | null;
  weekNumber: number;
  onSubmit: (input: TaskInput) => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <AdminSheet
      open={open}
      onClose={onClose}
      title={task ? "Edit task" : `Add task to week ${weekNumber}`}
    >
      {open && (
        <TaskFields key={task?.id ?? "new"} task={task} onSubmit={onSubmit} onCancel={onClose} pending={pending} error={error} />
      )}
    </AdminSheet>
  );
}

/** Keyed on task id by the parent so state resets when switching tasks. */
function TaskFields({
  task,
  onSubmit,
  onCancel,
  pending,
  error,
}: {
  task: Task | null;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
  pending: boolean;
  error: string | null;
}) {
  const [heading, setHeading] = useState(task?.heading ?? "");
  const [subcontent, setSubcontent] = useState(task?.subcontent ?? "");
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? "ui_practice");
  const [day, setDay] = useState<string>(task ? String(task.day_number ?? "weekly") : "1");
  const [requiresProof, setRequiresProof] = useState(task?.requires_proof ?? false);
  const [weight, setWeight] = useState(String(task?.weight ?? 1));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      heading,
      subcontent,
      category,
      day_number: day === "weekly" ? null : Number(day),
      requires_proof: requiresProof,
      weight: Number(weight),
    });
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5 space-y-4">
      <div>
        <label htmlFor="task-heading" className={LABEL_CLASS}>
          Heading
        </label>
        <input
          id="task-heading"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Study the Screens"
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor="task-subcontent" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="task-subcontent"
          value={subcontent}
          onChange={(e) => setSubcontent(e.target.value)}
          rows={3}
          placeholder="What exactly should they do?"
          className={`${INPUT_CLASS} resize-y`}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-category" className={LABEL_CLASS}>
            Category
          </label>
          <select
            id="task-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className={INPUT_CLASS}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-day" className={LABEL_CLASS}>
            When
          </label>
          <select id="task-day" value={day} onChange={(e) => setDay(e.target.value)} className={INPUT_CLASS}>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={d}>
                Day {d}
              </option>
            ))}
            <option value="weekly">Weekly deliverable</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-weight" className={LABEL_CLASS}>
            Weight
          </label>
          <input
            id="task-weight"
            type="number"
            min={1}
            max={20}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 self-end rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={requiresProof}
            onChange={(e) => setRequiresProof(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Requires proof
        </label>
      </div>

      {error && <p className="text-sm text-red">{error}</p>}

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : task ? "Save changes" : "Add task"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-full border border-border py-3 text-sm font-semibold text-ink transition-check hover:bg-page"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
