-- Admin panel support for purchases.
--
-- source       'stripe' for a paid Checkout Session, 'grant' for access an admin
--              gave by hand (no payment, so no Stripe session).
-- refunded_at  set when the order is refunded; refunded rows no longer unlock anything.
-- granted_by   the admin who gave a grant.
alter table public.purchases alter column stripe_session_id drop not null;

alter table public.purchases
  add column if not exists source text not null default 'stripe',
  add column if not exists refunded_at timestamptz,
  add column if not exists granted_by uuid references auth.users (id) on delete set null;

alter table public.purchases drop constraint if exists purchases_source_check;
alter table public.purchases
  add constraint purchases_source_check check (
    (source = 'stripe' and stripe_session_id is not null) or (source = 'grant')
  );

create index if not exists purchases_created_at_idx on public.purchases (created_at desc);
create index if not exists purchases_payment_intent_idx on public.purchases (stripe_payment_intent);
