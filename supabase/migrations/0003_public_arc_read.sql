-- The arc and its goals are shown on the public landing page before sign-in,
-- so anonymous visitors need read access too (non-sensitive program data).

drop policy if exists "Arcs are readable by authenticated users" on arcs;
create policy "Arcs are publicly readable"
  on arcs for select
  to anon, authenticated
  using (true);

drop policy if exists "Arc goals are readable by authenticated users" on arc_goals;
create policy "Arc goals are publicly readable"
  on arc_goals for select
  to anon, authenticated
  using (true);
