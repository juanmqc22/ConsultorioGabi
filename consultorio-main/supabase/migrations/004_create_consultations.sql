create type consultation_status as enum ('resolved', 'follow_up', 'referral');

create table consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  consulted_at timestamptz not null default now(),
  chief_complaint text,
  vital_bp text,
  vital_temp numeric(4,1),
  vital_hr integer,
  vital_spo2 integer,
  vital_weight numeric(5,1),
  clinical_notes text,
  diagnosis text,
  cid10 text,
  treatment text,
  follow_up_date date,
  status consultation_status not null default 'resolved',
  created_at timestamptz not null default now()
);

create index consultations_patient_id_idx on consultations(patient_id);
create index consultations_consulted_at_idx on consultations(consulted_at);

alter table consultations enable row level security;
create policy "authenticated full access" on consultations
  for all to authenticated using (true) with check (true);
