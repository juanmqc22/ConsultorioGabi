create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');

create table appointments (
  id uuid primary key default gen_random_uuid(),
  missionary_id uuid not null references missionaries(id) on delete cascade,
  scheduled_at timestamptz not null,
  reason text,
  status appointment_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);

create index appointments_missionary_id_idx on appointments(missionary_id);
create index appointments_scheduled_at_idx on appointments(scheduled_at);

alter table appointments enable row level security;
create policy "authenticated full access" on appointments
  for all to authenticated using (true) with check (true);
