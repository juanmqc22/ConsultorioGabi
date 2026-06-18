create table missions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  color text not null default '#7c3aed',
  created_at timestamptz not null default now()
);

alter table missions enable row level security;
create policy "authenticated full access" on missions
  for all to authenticated using (true) with check (true);

insert into missions (name, short_name, color) values
  ('Missão Brasil São Paulo Norte', 'SP Norte', '#7c3aed'),
  ('Missão Brasil São Paulo Sul', 'SP Sul', '#10b981'),
  ('Missão Brasil São Paulo Leste', 'SP Leste', '#06b6d4');
