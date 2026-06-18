create type patient_status as enum ('active', 'inactive');

create table patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  preferred_name text not null,
  birthdate date not null,
  cpf text,
  email text,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  blood_type text,
  allergies text,
  chronic_conditions text,
  notes text,
  status patient_status not null default 'active',
  created_at timestamptz not null default now()
);

create index patients_status_idx on patients(status);

alter table patients enable row level security;
create policy "authenticated full access" on patients
  for all to authenticated using (true) with check (true);
