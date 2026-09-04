-- Seed the pre-built 16-week Winter Arc. Fixed ids keep this migration
-- idempotent (re-running `db push` won't duplicate rows).

insert into arcs (id, name, description, start_date, duration_weeks)
values (
  '11111111-1111-1111-1111-111111111111',
  'Winter Arc',
  'A 16-week personal-growth challenge for designers: build a weekly design practice, ship one product from scratch, and make meaningful connections.',
  '2026-09-01',
  16
)
on conflict (id) do nothing;

insert into arc_goals (id, arc_id, type, name, category, sort_order, config)
values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'recurring_weekly',
    'UI Exploration',
    'UI Exploration',
    1,
    '{"totalWeeks": 16, "description": "One exploration per week"}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'recurring_weekly',
    'Product Breakdown',
    'Product Breakdown',
    2,
    '{"totalWeeks": 16, "description": "Study one real product"}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'recurring_weekly',
    'Product-Thinking Lesson',
    'Product-Thinking Lesson',
    3,
    '{"totalWeeks": 16, "description": "Article or video + reflection"}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'milestone_track',
    'Ship One Product',
    'Ship One Product',
    4,
    '{
      "steps": [
        {"key": "find-problem",      "label": "Find the problem",              "weekStart": 1,  "weekEnd": 2},
        {"key": "validate",          "label": "Validate assumptions",          "weekStart": 3,  "weekEnd": 3},
        {"key": "define-mvp",        "label": "Define MVP",                    "weekStart": 4,  "weekEnd": 5},
        {"key": "design",            "label": "Design",                        "weekStart": 6,  "weekEnd": 7},
        {"key": "build",             "label": "Build",                         "weekStart": 8,  "weekEnd": 11},
        {"key": "launch",            "label": "Launch",                        "weekStart": 12, "weekEnd": 12},
        {"key": "get-users",         "label": "Get users",                     "weekStart": 13, "weekEnd": 14},
        {"key": "analyse-feedback",  "label": "Analyse behaviour & feedback",  "weekStart": 15, "weekEnd": 15},
        {"key": "ship-v2",           "label": "Ship V2",                       "weekStart": 16, "weekEnd": 16}
      ]
    }'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'tally_counter',
    'Meaningful Connections',
    'Connections',
    5,
    '{
      "totalTarget": 50,
      "periods": [
        {"key": "2026-09", "label": "September", "target": 10, "dueDate": "2026-09-10"},
        {"key": "2026-10", "label": "October",   "target": 15, "dueDate": "2026-10-15"},
        {"key": "2026-11", "label": "November",  "target": 15, "dueDate": "2026-11-15"},
        {"key": "2026-12", "label": "December",  "target": 10, "dueDate": "2026-12-10"}
      ]
    }'::jsonb
  )
on conflict (id) do nothing;
