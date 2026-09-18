-- The heatmap/streak attribute a completion to the day it happened using
-- task_entries.created_at, but that's only ever set once at row creation.
-- Toggling a task off and back on later (a re-completion) left the entry
-- stuck on its original day, silently corrupting the heatmap and streak.
-- Track updated_at instead, auto-maintained on every row change, and use
-- that for date attribution.

alter table task_entries add column updated_at timestamptz not null default now();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger task_entries_set_updated_at
  before update on task_entries
  for each row
  execute function set_updated_at();
