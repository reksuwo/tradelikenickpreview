-- The course catalogue, managed from the admin panel. Members, the marketing
-- pages and checkout all read it; prices here are what Stripe charges.
-- Written and read by the server over DATABASE_URL; RLS is on with no member
-- policies, so nothing here is reachable with the publishable key.

create table if not exists public.courses (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), -- the slug in /browse/watch/<id>
  title text not null,
  category text not null,
  level text not null default 'All levels',
  hours text not null default '',          -- shown as written, e.g. "62 hrs"
  lessons text not null default '',        -- shown as written, e.g. "148 lessons"
  price_cents integer check (price_cents is null or price_cents >= 50), -- null = included for every member
  blurb text not null default '',
  poster smallint not null default 0 check (poster between 0 and 8), -- artwork variant in components/poster.tsx
  badge text,
  rating text not null default '',
  position integer not null default 0,     -- catalogue order
  published boolean not null default true, -- hidden courses stay watchable for people who own them
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_position_idx on public.courses (position);

alter table public.courses enable row level security;

-- The nine courses that used to live in lib/courses.ts.
insert into public.courses (id, title, category, level, hours, lessons, price_cents, blurb, poster, badge, rating, position)
values
  ('complete-system', 'The Complete Trading System', 'Foundations', 'All levels', '62 hrs', '148 lessons', 69700, 'The flagship series. Three setups, one risk model and a review habit, assembled into a written plan you can trade tomorrow.', 0, 'Flagship', '4.9', 1),
  ('first-90', 'The First 90 Minutes', 'Foundations', 'Beginner', '7 hrs', '22 lessons', 11900, 'Everything that happens between the bell and 11am, and why most of a day''s opportunity lives there.', 1, null, '4.8', 2),
  ('price-no-indicators', 'Reading Price Without Indicators', 'Technique', 'Intermediate', '14 hrs', '41 lessons', 24900, 'Levels, structure and participation. Learn to describe what a chart is doing before you look for a signal.', 2, null, '4.9', 3),
  ('position-sizing', 'Position Sizing Masterclass', 'Risk', 'Essential', '9 hrs', '26 lessons', 14900, 'The course that keeps accounts alive. Fixed fractional sizing, daily stops and knowing when to cut size in half.', 3, 'Most watched', '5.0', 4),
  ('journal-bootcamp', 'The Trading Journal Bootcamp', 'Habits', 'Beginner', '5 hrs', '18 lessons', 9900, 'Two weeks to a journal you will actually keep, and a Friday review that finds the leaks for you.', 4, null, '4.7', 5),
  ('rules-over-feelings', 'Rules Over Feelings', 'Psychology', 'All levels', '8 hrs', '24 lessons', 12900, 'Revenge trades, size creep and the frozen trigger finger, treated as process problems rather than character flaws.', 5, null, '4.8', 6),
  ('backtesting', 'Backtesting Without Fooling Yourself', 'Technique', 'Advanced', '6 hrs', '19 lessons', 13900, 'How to test an idea over 200 sessions so the result means something when real money is on it.', 6, null, '4.6', 7),
  ('prop-firm', 'Prop Firm Evaluation Playbook', 'Advanced', 'Advanced', '11 hrs', '31 lessons', 19900, 'Daily loss limits, consistency rules and the pacing that gets you from evaluation to a first payout.', 7, null, '4.8', 8),
  ('live-archive', 'Trading Live With Nick', 'Live', 'All levels', '40+ hrs', 'New episodes weekly', null, 'Unedited sessions with the microphone on. Every decision narrated in real time, losers included.', 8, 'New episodes', '4.9', 9)
on conflict (id) do nothing;
