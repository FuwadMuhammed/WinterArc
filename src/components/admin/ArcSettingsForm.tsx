"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateArcAction } from "@/lib/admin/task-actions";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/admin/TaskFormSheet";
import type { Arc } from "@/lib/database.types";

export function ArcSettingsForm({ arc }: { arc: Arc }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error: string | null; message?: string | null } | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setStatus(null);
    startTransition(async () => {
      const result = await updateArcAction(formData);
      setStatus(result);
      if (!result.error) router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-border bg-panel px-6 py-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Arc settings</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="arc-name" className={LABEL_CLASS}>
            Name
          </label>
          <input id="arc-name" name="name" defaultValue={arc.name} className={INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="arc-start" className={LABEL_CLASS}>
            Start date
          </label>
          <input
            id="arc-start"
            name="start_date"
            type="date"
            defaultValue={arc.start_date}
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="arc-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="arc-description"
          name="description"
          rows={2}
          defaultValue={arc.description ?? ""}
          className={`${INPUT_CLASS} resize-y`}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {status?.error && <p className="text-sm text-red">{status.error}</p>}
        {status && !status.error && <p className="text-sm text-green">{status.message}</p>}
        <p className="ml-auto text-xs text-ink-faint">{arc.duration_weeks} weeks · changing the start date shifts every week</p>
      </div>
    </form>
  );
}
