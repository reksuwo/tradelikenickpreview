-- One row per paid Stripe Checkout Session. Written by the server (webhook and
-- the return page) over DATABASE_URL; members can only read their own rows.
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_type text not null check (product_type in ('course', 'book')),
  product_id text not null,
  title text not null,
  amount_cents integer not null,
  currency text not null,
  stripe_session_id text not null unique,
  stripe_payment_intent text,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx on public.purchases (user_id);

alter table public.purchases enable row level security;

drop policy if exists "Members read their own purchases" on public.purchases;
create policy "Members read their own purchases"
  on public.purchases for select
  using ((select auth.uid()) = user_id);
