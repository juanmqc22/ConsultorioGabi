create type missionary_status as enum ('active', 'transferred', 'released', 'medical_leave');

create table missionaries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  preferred_name text not null,
  birthdate date not null,
  country_of_origin text not null default 'Brasil',
  mission_id uuid not null references missions(id),
  current_area text,
  companion_name text,
  mission_start_date date,
  mission_expected_end date,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  blood_type text,
  allergies text,
  chronic_conditions text,
  notes text,
  status missionary_status not null default 'active',
  created_at timestamptz not null default now()
);

create index missionaries_mission_id_idx on missionaries(mission_id);
create index missionaries_status_idx on missionaries(status);

alter table missionaries enable row level security;
create policy "authenticated full access" on missionaries
  for all to authenticated using (true) with check (true);
