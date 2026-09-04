-- Replace the old 3-goal-type system with a daily-task / weekly-deliverable
-- model: the Winter Arc plan is now a fixed sequence of weeks, each with
-- daily tasks (day_number 1-7) and weekly deliverables (day_number null).

drop table if exists goal_entries;
drop table if exists arc_goals;
drop type if exists goal_type;

create type task_category as enum (
  'ui_practice',
  'connection',
  'learn_explain',
  'rotating_lens',
  'build_public',
  'reflection'
);

-- Per-week metadata: rest weeks have no tasks, active weeks carry a
-- connection goal (how many of that week's connection tasks count as "done").
create table weeks (
  id uuid primary key default gen_random_uuid(),
  arc_id uuid not null references arcs(id) on delete cascade,
  week_number int not null,
  is_rest_week boolean not null default false,
  connection_goal int,
  unique (arc_id, week_number)
);

-- A single task. day_number 1-7 = a daily task for that day of the week;
-- null = a weekly deliverable. `weight` lets one task count for more than
-- one unit of progress (e.g. Week 12's "Reconnect, Twice").
create table tasks (
  id uuid primary key default gen_random_uuid(),
  arc_id uuid not null references arcs(id) on delete cascade,
  week_number int not null,
  day_number int check (day_number between 1 and 7),
  category task_category not null,
  heading text not null,
  subcontent text not null,
  requires_proof boolean not null default false,
  weight int not null default 1,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- A user's completion of a task. `note` carries the submitted link/note for
-- proof-required tasks.
create table task_entries (
  id uuid primary key default gen_random_uuid(),
  user_arc_id uuid not null references user_arcs(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  completed boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create unique index task_entries_uidx on task_entries (user_arc_id, task_id);
alter table task_entries add constraint task_entries_unique
  unique using index task_entries_uidx;

create index tasks_arc_week_idx on tasks (arc_id, week_number, sort_order);
create index weeks_arc_idx on weeks (arc_id, week_number);
create index task_entries_user_arc_idx on task_entries (user_arc_id);

-- Row Level Security --------------------------------------------------------

alter table weeks enable row level security;
alter table tasks enable row level security;
alter table task_entries enable row level security;

create policy "Weeks are publicly readable"
  on weeks for select
  to anon, authenticated
  using (true);

create policy "Tasks are publicly readable"
  on tasks for select
  to anon, authenticated
  using (true);

create policy "Users can view their own task entries"
  on task_entries for select
  to authenticated
  using (
    exists (
      select 1 from user_arcs
      where user_arcs.id = task_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  );

create policy "Users can create their own task entries"
  on task_entries for insert
  to authenticated
  with check (
    exists (
      select 1 from user_arcs
      where user_arcs.id = task_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  );

create policy "Users can update their own task entries"
  on task_entries for update
  to authenticated
  using (
    exists (
      select 1 from user_arcs
      where user_arcs.id = task_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from user_arcs
      where user_arcs.id = task_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  );

create policy "Users can delete their own task entries"
  on task_entries for delete
  to authenticated
  using (
    exists (
      select 1 from user_arcs
      where user_arcs.id = task_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  );
