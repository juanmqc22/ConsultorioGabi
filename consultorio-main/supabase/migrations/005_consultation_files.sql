-- supabase/migrations/005_consultation_files.sql
create table consultation_files (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer not null,
  created_at timestamptz not null default now()
);

create index consultation_files_consultation_id_idx on consultation_files(consultation_id);

alter table consultation_files enable row level security;
create policy "authenticated full access" on consultation_files
  for all to authenticated using (true) with check (true);
