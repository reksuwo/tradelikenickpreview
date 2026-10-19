-- In-app notifications for the header bell. A row with a user_id is for that
-- member only; a row with a null user_id is an announcement for every member.
-- Written by the server over DATABASE_URL; members can only read their own rows.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  kind text not null check (kind in ('purchase', 'course', 'live', 'announcement')),
  title text not null,
  body text,
  href text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Members read their own notifications" on public.notifications;
create policy "Members read their own notifications"
  on public.notifications for select
  using (user_id is null or (select auth.uid()) = user_id);

-- When each member last opened the bell. Anything newer counts as unread.
create table if not exists public.notification_reads (
  user_id uuid primary key references auth.users (id) on delete cascade,
  seen_at timestamptz not null default now()
);

alter table public.notification_reads enable row level security;

drop policy if exists "Members read their own notification state" on public.notification_reads;
create policy "Members read their own notification state"
  on public.notification_reads for select
  using ((select auth.uid()) = user_id);
