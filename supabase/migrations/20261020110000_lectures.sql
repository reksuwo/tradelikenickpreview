-- Course lectures, managed from the admin panel, and what each member has watched.
-- Written and read by the server over DATABASE_URL; RLS is on with no member
-- policies, so nothing here is reachable with the publishable key.

create table if not exists public.lectures (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,                  -- an id in lib/courses.ts
  position integer not null,                -- watch order within the course, from 1
  title text not null,
  description text not null default '',
  seconds integer not null default 0,       -- running time of the uploaded video
  video_key text,                           -- object key in the private R2 bucket
  thumbnail text,                           -- a /public path, or an R2 key under Thumbnails/
  preview text,                             -- short silent clip in /public for the browse hero
  free boolean not null default false,      -- watchable without buying the course
  published boolean not null default false, -- drafts are hidden from members
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lectures_course_position_idx on public.lectures (course_id, position);

alter table public.lectures enable row level security;

-- The five lectures that used to live in lib/lectures.ts.
insert into public.lectures (course_id, position, title, description, seconds, video_key, thumbnail, preview, free, published)
select * from (values
  ('complete-system', 1, 'Finding the Trade',
   'Patterns, support and resistance, and trend: how to spot an opportunity worth taking.',
   353, 'Lectures/lecture-01.mp4', '/thumbnails/lecture-01.webp', '/previews/lecture-01.mp4', true, true),
  ('complete-system', 2, 'Building the Trade',
   'Match the strategy to your outlook, then set risk and reward before anything is placed.',
   627, 'Lectures/lecture-02.mp4', '/thumbnails/lecture-02.webp', null, true, true),
  ('complete-system', 3, 'Executing the Trade',
   'Entering cleanly, sizing the position, choosing order types and managing risk once you are in.',
   649, 'Lectures/lecture-03.mp4', '/thumbnails/lecture-03.webp', null, false, true),
  ('complete-system', 4, 'Tracking the Trade',
   'Trading journal essentials: entry, exit, time in trade, profit or loss, and the notes that matter.',
   226, 'Lectures/lecture-04.mp4', '/thumbnails/lecture-04.webp', null, false, true),
  ('complete-system', 5, 'Review, Revise, Repeat',
   'Find what worked, fix what did not, tighten your rules and run the process again.',
   523, 'Lectures/lecture-05.mp4', '/thumbnails/lecture-05.webp', null, false, true)
) as seed (course_id, position, title, description, seconds, video_key, thumbnail, preview, free, published)
where not exists (select 1 from public.lectures where course_id = 'complete-system');

-- Where each member is in each lecture. One row per member per lecture.
create table if not exists public.lecture_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lecture_id uuid not null references public.lectures (id) on delete cascade,
  position_seconds integer not null default 0, -- where they stopped, for resuming
  furthest_seconds integer not null default 0, -- the furthest point they reached
  watched_seconds integer not null default 0,  -- total time spent playing
  completed_at timestamptz,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lecture_id)
);

create index if not exists lecture_progress_lecture_idx on public.lecture_progress (lecture_id);
create index if not exists lecture_progress_updated_idx on public.lecture_progress (updated_at desc);

alter table public.lecture_progress enable row level security;

-- Seconds watched per member, lecture and day, for the analytics charts.
create table if not exists public.watch_activity (
  user_id uuid not null references auth.users (id) on delete cascade,
  lecture_id uuid not null references public.lectures (id) on delete cascade,
  day date not null default current_date,
  seconds integer not null default 0,
  primary key (user_id, lecture_id, day)
);

create index if not exists watch_activity_day_idx on public.watch_activity (day);

alter table public.watch_activity enable row level security;
