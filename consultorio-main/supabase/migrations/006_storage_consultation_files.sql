-- supabase/migrations/006_storage_consultation_files.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'consultation-files',
  'consultation-files',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "authenticated users can upload consultation files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'consultation-files');

create policy "authenticated users can read consultation files"
  on storage.objects for select to authenticated
  using (bucket_id = 'consultation-files');

create policy "authenticated users can delete consultation files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'consultation-files');
