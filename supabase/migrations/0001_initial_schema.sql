-- Winter Arc: core schema
create extension if not exists "pgcrypto";

create type goal_type as enum ('recurring_weekly', 'milestone_track', 'tally_counter');
create type user_arc_status as enum ('active', 'completed', 'abandoned');

-- A challenge program, e.g. the 16-week Winter Arc.
create table arcs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  duration_weeks int not null check (duration_weeks > 0),
  created_at timestamptz not null default now()
);

-- A goal within an arc. `config` carries type-specific settings:
--   recurring_weekly: { "totalWeeks": 16 }
--   milestone_track:  { "steps": [{ "key", "label", "weekStart", "weekEnd" }, ...] }
--   tally_counter:    { "totalTarget": 50, "periods": [{ "key", "label", "target", "dueDate" }, ...] }
create table arc_goals (
  id uuid primary key default gen_random_uuid(),
  arc_id uuid not null references arcs(id) on delete cascade,
  type goal_type not null,
  name text not null,
  category text not null,
  sort_order int not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- A user's membership in an arc.
create table user_arcs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  arc_id uuid not null references arcs(id) on delete cascade,
  joined_at timestamptz not null default now(),
  status user_arc_status not null default 'active',
  unique (user_id, arc_id)
);

-- Progress entries against a goal. Shape depends on the goal's type:
--   recurring_weekly: one row per week_number, `completed` + optional `note`
--   milestone_track:  one row per step_key, `completed` marks the step done
--   tally_counter:    one row per log (a +1 or manual count), `count` + optional `note`,
--                      `period_key` records which period the log counts toward
create table goal_entries (
  id uuid primary key default gen_random_uuid(),
  user_arc_id uuid not null references user_arcs(id) on delete cascade,
  goal_id uuid not null references arc_goals(id) on delete cascade,
  week_number int,
  step_key text,
  period_key text,
  completed boolean not null default false,
  count integer,
  note text,
  created_at timestamptz not null default now()
);

-- Plain (non-partial) unique constraints: Postgres treats every NULL as
-- distinct, so tally rows (week_number/step_key both null) never collide,
-- while still enforcing one row per week/step. Non-partial constraints are
-- also required for Supabase's upsert(onConflict:) inference to work.
create unique index goal_entries_weekly_uidx on goal_entries (user_arc_id, goal_id, week_number);
alter table goal_entries add constraint goal_entries_weekly_unique
  unique using index goal_entries_weekly_uidx;

create unique index goal_entries_step_uidx on goal_entries (user_arc_id, goal_id, step_key);
alter table goal_entries add constraint goal_entries_step_unique
  unique using index goal_entries_step_uidx;

create index goal_entries_tally_idx on goal_entries (user_arc_id, goal_id, period_key)
  where period_key is not null;

create index arc_goals_arc_idx on arc_goals (arc_id, sort_order);
create index user_arcs_user_idx on user_arcs (user_id);
create index goal_entries_user_arc_idx on goal_entries (user_arc_id);

-- Row Level Security --------------------------------------------------------

alter table arcs enable row level security;
alter table arc_goals enable row level security;
alter table user_arcs enable row level security;
alter table goal_entries enable row level security;

create policy "Arcs are readable by authenticated users"
  on arcs for select
  to authenticated
  using (true);

create policy "Arc goals are readable by authenticated users"
  on arc_goals for select
  to authenticated
  using (true);

create policy "Users can view their own arc memberships"
  on user_arcs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can join an arc"
  on user_arcs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own arc membership"
  on user_arcs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can leave/reset their own arc membership"
  on user_arcs for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can view their own goal entries"
  on goal_entries for select
  to authenticated
  using (
    exists (
      select 1 from user_arcs
      where user_arcs.id = goal_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  );

create policy "Users can create their own goal entries"
  on goal_entries for insert
  to authenticated
  with check (
    exists (
      select 1 from user_arcs
      where user_arcs.id = goal_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  );

create policy "Users can update their own goal entries"
  on goal_entries for update
  to authenticated
  using (
    exists (
      select 1 from user_arcs
      where user_arcs.id = goal_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from user_arcs
      where user_arcs.id = goal_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  );

create policy "Users can delete their own goal entries"
  on goal_entries for delete
  to authenticated
  using (
    exists (
      select 1 from user_arcs
      where user_arcs.id = goal_entries.user_arc_id
        and user_arcs.user_id = auth.uid()
    )
  );
