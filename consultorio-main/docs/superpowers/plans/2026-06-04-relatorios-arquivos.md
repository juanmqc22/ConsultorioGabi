# Relatórios, Detalhe de Consulta e Upload de Arquivos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar página de detalhe por consulta, exportação de PDF do missionário e por período, seção de relatórios com filtros, e upload de arquivos (exames/radiografias) anexados às consultas.

**Architecture:** Geração de PDF client-side com `@react-pdf/renderer` (sem rota de servidor). Arquivos armazenados no Supabase Storage (bucket privado `consultation-files`), metadados na nova tabela `consultation_files`. Reports page usa Server Component + URL searchParams para filtros.

**Tech Stack:** Next.js 16 App Router, Supabase (Postgres + Storage), `@react-pdf/renderer`, TypeScript, Tailwind CSS v4, Vitest + @testing-library/react.

---

## Mapa de arquivos

### Novos
| Arquivo | Responsabilidade |
|---------|-----------------|
| `supabase/migrations/005_consultation_files.sql` | Tabela consultation_files + RLS |
| `supabase/migrations/006_storage_consultation_files.sql` | Bucket Supabase Storage + policies |
| `lib/queries/consultations.ts` | getConsultationById, getConsultationsByFilters |
| `lib/actions/files.ts` | uploadConsultationFile, deleteConsultationFile |
| `components/consultations/file-attachments.tsx` | UI de upload/listagem de arquivos |
| `components/pdf/missionary-report.tsx` | Template PDF relatório completo do missionário |
| `components/pdf/period-report.tsx` | Template PDF relatório por período |
| `components/pdf/export-missionary-button.tsx` | Botão client-side download PDF missionário |
| `components/pdf/export-period-button.tsx` | Botão client-side download PDF período |
| `components/relatorios/report-filter-form.tsx` | Formulário de filtros (client component) |
| `app/consultas/[id]/page.tsx` | Página de detalhe da consulta |
| `app/relatorios/page.tsx` | Seção de relatórios |

### Modificados
| Arquivo | O que muda |
|---------|-----------|
| `lib/types.ts` | Adiciona ConsultationFile, ConsultationWithDetails, ConsultationFilterResult |
| `lib/queries/missionaries.ts` | Adiciona getMissionariesByMission |
| `lib/actions/consultations.ts` | Adiciona upload de arquivos + muda redirect para /consultas/[id] |
| `components/consultations/consultation-form.tsx` | Adiciona seção de anexos |
| `components/missionaries/consultation-history.tsx` | Items viram Link para /consultas/[id] |
| `app/missionaries/[id]/page.tsx` | Adiciona botão ExportMissionaryPdfButton |
| `components/layout/sidebar.tsx` | Adiciona item Relatórios |
| `components/layout/bottom-nav.tsx` | Adiciona item Relatórios |

---

## Task 1: Migração — tabela consultation_files

**Files:**
- Create: `supabase/migrations/005_consultation_files.sql`

- [ ] **Step 1: Criar o arquivo de migração**

```sql
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
```

- [ ] **Step 2: Aplicar a migração**

```bash
npx supabase db push
```

Esperado: output sem erros. Se Supabase CLI não estiver instalado, aplique o SQL manualmente no Supabase Dashboard → SQL Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/005_consultation_files.sql
git commit -m "feat: add consultation_files table migration"
```

---

## Task 2: Migração — Supabase Storage bucket

**Files:**
- Create: `supabase/migrations/006_storage_consultation_files.sql`

- [ ] **Step 1: Criar o arquivo de migração**

```sql
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
```

- [ ] **Step 2: Aplicar a migração**

```bash
npx supabase db push
```

Alternativa manual: Supabase Dashboard → Storage → New bucket, nome `consultation-files`, private. Depois aplique as policies no SQL Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/006_storage_consultation_files.sql
git commit -m "feat: add consultation-files storage bucket migration"
```

---

## Task 3: Tipos — ConsultationFile e tipos relacionados

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Adicionar os novos tipos ao final de `lib/types.ts`**

```typescript
export interface ConsultationFile {
  id: string
  consultation_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
  url?: string | null  // URL assinada gerada pelo servidor, não armazenada no banco
}

export interface ConsultationWithDetails extends Consultation {
  missionary: Pick<Missionary, 'id' | 'preferred_name' | 'full_name' | 'mission_id'> & {
    mission: Pick<Mission, 'short_name' | 'color'> | null
  }
  files: ConsultationFile[]
}

export interface ConsultationFilterResult {
  id: string
  consulted_at: string
  chief_complaint: string | null
  diagnosis: string | null
  status: ConsultationStatus
  missionary: {
    preferred_name: string
    full_name: string
    mission: Pick<Mission, 'short_name'> | null
  } | null
}
```

- [ ] **Step 2: Verificar que o TypeScript compila sem erros**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add ConsultationFile and related types"
```

---

## Task 4: Queries — lib/queries/consultations.ts

**Files:**
- Create: `lib/queries/consultations.ts`
- Modify: `lib/queries/missionaries.ts` (adicionar getMissionariesByMission)

- [ ] **Step 1: Criar `lib/queries/consultations.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { ConsultationStatus, ConsultationWithDetails, ConsultationFilterResult } from '@/lib/types'

export async function getConsultationById(id: string): Promise<ConsultationWithDetails> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      missionary:missionaries(id, preferred_name, full_name, mission_id, mission:missions(short_name, color)),
      files:consultation_files(id, file_name, file_path, file_type, file_size, created_at)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  const files = data.files ?? []
  const filesWithUrls = await Promise.all(
    files.map(async (file: { id: string; file_name: string; file_path: string; file_type: string; file_size: number; created_at: string }) => {
      const { data: urlData } = await supabase.storage
        .from('consultation-files')
        .createSignedUrl(file.file_path, 3600)
      return { ...file, url: urlData?.signedUrl ?? null }
    })
  )

  return { ...data, files: filesWithUrls } as ConsultationWithDetails
}

export async function getConsultationsByFilters({
  missionId,
  month,
  year,
  status,
  missionaryId,
}: {
  missionId: string
  month: number
  year: number
  status?: ConsultationStatus | 'all'
  missionaryId?: string
}): Promise<ConsultationFilterResult[]> {
  const supabase = await createClient()

  let missionaryQuery = supabase
    .from('missionaries')
    .select('id')
    .eq('mission_id', missionId)

  if (missionaryId) missionaryQuery = missionaryQuery.eq('id', missionaryId)

  const { data: missionaryData } = await missionaryQuery
  const missionaryIds = (missionaryData ?? []).map((m: { id: string }) => m.id)

  if (missionaryIds.length === 0) return []

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const daysInMonth = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}T23:59:59`

  let query = supabase
    .from('consultations')
    .select(`
      id, consulted_at, chief_complaint, diagnosis, status,
      missionary:missionaries(preferred_name, full_name, mission:missions(short_name))
    `)
    .in('missionary_id', missionaryIds)
    .gte('consulted_at', startDate)
    .lte('consulted_at', endDate)
    .order('consulted_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status as ConsultationStatus)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ConsultationFilterResult[]
}
```

- [ ] **Step 2: Adicionar `getMissionariesByMission` em `lib/queries/missionaries.ts`**

Adicionar ao final do arquivo existente:

```typescript
export async function getMissionariesByMission(missionId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('missionaries')
    .select('id, preferred_name')
    .eq('mission_id', missionId)
    .eq('status', 'active')
    .order('preferred_name')
  return data ?? []
}
```

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add lib/queries/consultations.ts lib/queries/missionaries.ts
git commit -m "feat: add consultation queries (getConsultationById, getConsultationsByFilters)"
```

---

## Task 5: Server Actions — lib/actions/files.ts

**Files:**
- Create: `lib/actions/files.ts`

- [ ] **Step 1: Criar `lib/actions/files.ts`**

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadConsultationFile(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  const consultationId = formData.get('consultationId') as string
  const missionaryId = formData.get('missionaryId') as string

  if (!file || file.size === 0) throw new Error('Arquivo inválido.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo deve ter no máximo 10MB.')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) throw new Error('Tipo de arquivo não suportado.')

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const path = `${missionaryId}/${consultationId}/${safeName}`

  const { error: storageError } = await supabase.storage
    .from('consultation-files')
    .upload(path, file)

  if (storageError) throw new Error(storageError.message)

  const { error: dbError } = await supabase.from('consultation_files').insert({
    consultation_id: consultationId,
    file_name: file.name,
    file_path: path,
    file_type: file.type,
    file_size: file.size,
  })

  if (dbError) {
    await supabase.storage.from('consultation-files').remove([path])
    throw new Error(dbError.message)
  }

  revalidatePath(`/consultas/${consultationId}`)
}

export async function deleteConsultationFile(
  fileId: string,
  filePath: string,
  consultationId: string
) {
  const supabase = await createClient()

  const { error: storageError } = await supabase.storage
    .from('consultation-files')
    .remove([filePath])

  if (storageError) throw new Error(storageError.message)

  const { error: dbError } = await supabase
    .from('consultation_files')
    .delete()
    .eq('id', fileId)

  if (dbError) throw new Error(dbError.message)

  revalidatePath(`/consultas/${consultationId}`)
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/actions/files.ts
git commit -m "feat: add uploadConsultationFile and deleteConsultationFile actions"
```

---

## Task 6: Componente FileAttachments

**Files:**
- Create: `components/consultations/file-attachments.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
'use client'
import { useState, useTransition } from 'react'
import { ConsultationFile } from '@/lib/types'
import { uploadConsultationFile, deleteConsultationFile } from '@/lib/actions/files'

interface Props {
  consultationId: string
  missionaryId: string
  initialFiles: ConsultationFile[]
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileAttachments({ consultationId, missionaryId, initialFiles }: Props) {
  const [files, setFiles] = useState<ConsultationFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    setUploading(true)
    setError(null)

    for (const file of selected) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('consultationId', consultationId)
      formData.append('missionaryId', missionaryId)
      try {
        await uploadConsultationFile(formData)
        setFiles(prev => [...prev, {
          id: crypto.randomUUID(),
          consultation_id: consultationId,
          file_name: file.name,
          file_path: '',
          file_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString(),
        }])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao fazer upload.')
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  function handleDelete(fileId: string, filePath: string) {
    startTransition(async () => {
      try {
        await deleteConsultationFile(fileId, filePath, consultationId)
        setFiles(prev => prev.filter(f => f.id !== fileId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao remover arquivo.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Anexos
        </span>
        <label
          className="text-xs px-3 py-1 rounded-lg cursor-pointer transition-colors"
          style={{
            background: 'rgba(124,58,237,0.15)',
            color: '#a78bfa',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          {uploading ? 'Enviando...' : '+ Adicionar'}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            disabled={uploading || isPending}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {files.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum anexo.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none flex-shrink-0">
                  {file.file_type.startsWith('image/') ? '🖼️' : '📄'}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium">{file.file_name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatFileSize(file.file_size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Abrir
                  </a>
                )}
                <button
                  onClick={() => handleDelete(file.id, file.file_path)}
                  disabled={isPending}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Escrever teste de renderização**

Criar `components/consultations/file-attachments.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileAttachments } from './file-attachments'

vi.mock('@/lib/actions/files', () => ({
  uploadConsultationFile: vi.fn(),
  deleteConsultationFile: vi.fn(),
}))

const baseProps = {
  consultationId: 'c-123',
  missionaryId: 'm-456',
}

describe('FileAttachments', () => {
  it('renders empty state when no files', () => {
    render(<FileAttachments {...baseProps} initialFiles={[]} />)
    expect(screen.getByText('Nenhum anexo.')).toBeInTheDocument()
  })

  it('renders file names when files are provided', () => {
    const files = [
      {
        id: 'f-1',
        consultation_id: 'c-123',
        file_name: 'radiografia.jpg',
        file_path: 'path/to/file.jpg',
        file_type: 'image/jpeg',
        file_size: 204800,
        created_at: '2026-04-20T10:00:00Z',
        url: 'https://example.com/signed-url',
      },
    ]
    render(<FileAttachments {...baseProps} initialFiles={files} />)
    expect(screen.getByText('radiografia.jpg')).toBeInTheDocument()
    expect(screen.getByText('200 KB')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Rodar os testes**

```bash
npx vitest run components/consultations/file-attachments.test.tsx
```

Esperado: 2 testes passando.

- [ ] **Step 4: Commit**

```bash
git add components/consultations/file-attachments.tsx components/consultations/file-attachments.test.tsx
git commit -m "feat: add FileAttachments component with upload and delete"
```

---

## Task 7: Atualizar ConsultationHistory com links

**Files:**
- Modify: `components/missionaries/consultation-history.tsx`

- [ ] **Step 1: Substituir o container `<div>` de cada item por `<Link>`**

No arquivo `components/missionaries/consultation-history.tsx`, localizar o `div` que renderiza cada item (começa em `consultations.map((c, i) => (`) e substituir o `<div key={c.id} className="px-4 py-3 text-sm" ...>` por `<Link>`:

Substituir o bloco `consultations.map(...)` completo por:

```tsx
{consultations.map((c, i) => (
  <Link
    key={c.id}
    href={`/consultas/${c.id}`}
    className="block px-4 py-3 text-sm hover:bg-white/5 transition-colors"
    style={{ borderBottom: i < consultations.length - 1 ? '1px solid var(--border)' : undefined }}
  >
    <div className="flex justify-between items-start gap-2">
      <div className="min-w-0">
        <div className="font-semibold truncate">{c.chief_complaint ?? c.diagnosis ?? 'Consulta'}</div>
        {c.diagnosis && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {c.diagnosis}{c.cid10 && ` · CID ${c.cid10}`}
          </div>
        )}
        {c.treatment && (
          <div className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>{c.treatment}</div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatDate(c.consulted_at.split('T')[0])}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : c.status === 'follow_up' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {STATUS_LABELS[c.status]}
        </span>
      </div>
    </div>
  </Link>
))}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/missionaries/consultation-history.tsx
git commit -m "feat: make consultation history items link to detail page"
```

---

## Task 8: Modificar createConsultation para upload de arquivos

**Files:**
- Modify: `lib/actions/consultations.ts`
- Modify: `components/consultations/consultation-form.tsx`

- [ ] **Step 1: Atualizar `lib/actions/consultations.ts`**

Substituir o arquivo inteiro:

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createConsultation(formData: FormData) {
  const supabase = await createClient()
  const missionaryId = formData.get('missionary_id') as string

  if (!missionaryId?.trim()) throw new Error('Missionário não selecionado.')
  const consulted_at = formData.get('consulted_at') as string
  if (!consulted_at) throw new Error('Data da consulta é obrigatória.')

  const { data, error } = await supabase.from('consultations').insert({
    missionary_id: missionaryId,
    appointment_id: formData.get('appointment_id') as string || null,
    consulted_at,
    chief_complaint: formData.get('chief_complaint') as string || null,
    vital_bp: formData.get('vital_bp') as string || null,
    vital_temp: formData.get('vital_temp') ? parseFloat(formData.get('vital_temp') as string) : null,
    vital_hr: formData.get('vital_hr') ? parseInt(formData.get('vital_hr') as string) : null,
    vital_spo2: formData.get('vital_spo2') ? parseInt(formData.get('vital_spo2') as string) : null,
    vital_weight: formData.get('vital_weight') ? parseFloat(formData.get('vital_weight') as string) : null,
    clinical_notes: formData.get('clinical_notes') as string || null,
    diagnosis: formData.get('diagnosis') as string || null,
    cid10: formData.get('cid10') as string || null,
    treatment: formData.get('treatment') as string || null,
    follow_up_date: formData.get('follow_up_date') as string || null,
    status: formData.get('status') as string || 'resolved',
  }).select('id').single()

  if (error) throw new Error(error.message)

  const consultationId = data.id

  // Upload arquivos anexados
  const files = formData.getAll('files') as File[]
  const validFiles = files.filter(f => f.size > 0)

  for (const file of validFiles) {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const path = `${missionaryId}/${consultationId}/${safeName}`

    const { error: storageError } = await supabase.storage
      .from('consultation-files')
      .upload(path, file)

    if (!storageError) {
      await supabase.from('consultation_files').insert({
        consultation_id: consultationId,
        file_name: file.name,
        file_path: path,
        file_type: file.type,
        file_size: file.size,
      })
    }
  }

  revalidatePath(`/missionaries/${missionaryId}`)
  redirect(`/consultas/${consultationId}`)
}
```

- [ ] **Step 2: Adicionar seção de anexos em `components/consultations/consultation-form.tsx`**

Adicionar o seguinte bloco ANTES do botão `Guardar Consulta` (antes do `<button type="submit" ...>`):

```tsx
{/* Bloco de anexos — adicionar antes do botão final */}
<div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-overlay)' }}>
  <label className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
    Anexos (opcional)
  </label>
  <label
    className="flex flex-col items-center justify-center gap-2 rounded-lg py-6 text-sm cursor-pointer transition-colors"
    style={{
      border: '1px dashed rgba(124,58,237,0.4)',
      color: 'var(--text-muted)',
    }}
  >
    <span className="text-2xl">📎</span>
    <span>Clique para selecionar arquivos</span>
    <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
      PDF, JPG, PNG · máx 10MB cada
    </span>
    <input
      type="file"
      name="files"
      multiple
      accept="image/jpeg,image/png,image/webp,application/pdf"
      className="hidden"
    />
  </label>
</div>
```

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add lib/actions/consultations.ts components/consultations/consultation-form.tsx
git commit -m "feat: add file upload to consultation creation + redirect to detail page"
```

---

## Task 9: Página de detalhe da consulta

**Files:**
- Create: `app/consultas/[id]/page.tsx`

- [ ] **Step 1: Criar a pasta e o arquivo**

```bash
mkdir -p "app/consultas/[id]"
```

- [ ] **Step 2: Criar `app/consultas/[id]/page.tsx`**

```tsx
import { AppShell } from '@/components/layout/app-shell'
import { getConsultationById } from '@/lib/queries/consultations'
import { FileAttachments } from '@/components/consultations/file-attachments'
import { formatDate } from '@/lib/utils'
import { ConsultationStatus } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  resolved: 'Resuelto',
  follow_up: 'Seguimiento',
  referral: 'Derivación',
}

const STATUS_COLORS: Record<ConsultationStatus, string> = {
  resolved: 'bg-emerald-500/20 text-emerald-400',
  follow_up: 'bg-amber-500/20 text-amber-400',
  referral: 'bg-blue-500/20 text-blue-400',
}

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const consultation = await getConsultationById(id).catch(() => null)
  if (!consultation) notFound()

  const missionary = consultation.missionary
  const missionaryId = missionary?.id ?? ''

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/missionaries" className="hover:text-white transition-colors">Misioneros</Link>
          <span>›</span>
          <Link href={`/missionaries/${missionaryId}`} className="hover:text-white transition-colors">
            {missionary?.preferred_name}
          </Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>
            Consulta {formatDate(consultation.consulted_at.split('T')[0])}
          </span>
          {/* botão editar fora do escopo deste plano */}
        </div>

        <div className="flex flex-col gap-4">
          {/* Cabeçalho */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--bg-overlay)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold">
                  {consultation.chief_complaint ?? consultation.diagnosis ?? 'Consulta'}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(consultation.consulted_at.split('T')[0])}
                  {' · '}
                  {missionary?.preferred_name}
                  {missionary?.mission && ` · ${missionary.mission.short_name}`}
                </p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[consultation.status]}`}
              >
                {STATUS_LABELS[consultation.status]}
              </span>
            </div>
          </div>

          {/* Sinais Vitais */}
          {(consultation.vital_bp || consultation.vital_hr || consultation.vital_temp || consultation.vital_spo2 || consultation.vital_weight) && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
              <h2 className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                Sinais Vitais
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {consultation.vital_bp && <VitalItem label="Pressão Arterial" value={consultation.vital_bp} />}
                {consultation.vital_hr && <VitalItem label="Freq. Cardíaca" value={`${consultation.vital_hr} bpm`} />}
                {consultation.vital_temp && <VitalItem label="Temperatura" value={`${consultation.vital_temp}°C`} />}
                {consultation.vital_spo2 && <VitalItem label="SpO2" value={`${consultation.vital_spo2}%`} />}
                {consultation.vital_weight && <VitalItem label="Peso" value={`${consultation.vital_weight} kg`} />}
              </div>
            </div>
          )}

          {/* Clínica */}
          <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
            <h2 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Consulta
            </h2>
            {consultation.chief_complaint && (
              <ClinicalField label="Motivo de consulta" value={consultation.chief_complaint} />
            )}
            {consultation.clinical_notes && (
              <ClinicalField label="Notas clínicas" value={consultation.clinical_notes} />
            )}
            {consultation.diagnosis && (
              <ClinicalField
                label="Diagnóstico"
                value={consultation.cid10 ? `${consultation.diagnosis} (${consultation.cid10})` : consultation.diagnosis}
              />
            )}
            {consultation.treatment && (
              <ClinicalField label="Tratamento / Medicação" value={consultation.treatment} />
            )}
            {consultation.follow_up_date && (
              <ClinicalField
                label="Data de seguimento"
                value={formatDate(consultation.follow_up_date)}
              />
            )}
          </div>

          {/* Anexos */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
            <FileAttachments
              consultationId={id}
              missionaryId={missionaryId}
              initialFiles={consultation.files}
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function VitalItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}

function ClinicalField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="text-sm whitespace-pre-wrap">{value}</div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/consultas/[id]/page.tsx"
git commit -m "feat: add consultation detail page at /consultas/[id]"
```

---

## Task 10: Instalar @react-pdf/renderer e template PDF do missionário

**Files:**
- Create: `components/pdf/missionary-report.tsx`
- Create: `components/pdf/export-missionary-button.tsx`

- [ ] **Step 1: Instalar a dependência**

```bash
npm install @react-pdf/renderer
npm install --save-dev @types/react-pdf 2>/dev/null || true
```

> **Nota SSR:** `@react-pdf/renderer` usa APIs do browser. Os templates (`MissionaryReport`, `PeriodReport`) são componentes React puros passados ao `pdf()` — não precisam de `'use client'`. Mas se o Next.js lançar erros de SSR ao importar o pacote em um Server Component, adicione `import dynamic from 'next/dynamic'` no botão de exportação e use `dynamic(() => import('./missionary-report'), { ssr: false })`. Os botões de exportação já são `'use client'`, então o problema normalmente não ocorre.

- [ ] **Step 2: Criar `components/pdf/missionary-report.tsx`**

```tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { ConsultationStatus, Missionary, Mission, Consultation, ConsultationFile } from '@/lib/types'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  resolved: 'Resuelto',
  follow_up: 'Seguimiento',
  referral: 'Derivación',
}

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: '2px solid #7c3aed', paddingBottom: 12 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666' },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#7c3aed',
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.5,
  },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  infoItem: { width: '45%' },
  infoLabel: { fontSize: 8, color: '#888', marginBottom: 1 },
  infoValue: { fontSize: 10 },
  consultationCard: {
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  consultationTitle: { fontSize: 11, fontWeight: 'bold', flex: 1 },
  badge: {
    fontSize: 8,
    padding: '2 6',
    borderRadius: 10,
    color: '#555',
    border: '1px solid #ccc',
  },
  vitalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  vitalChip: { fontSize: 9, color: '#555' },
  field: { marginBottom: 4 },
  fieldLabel: { fontSize: 8, color: '#888', marginBottom: 1 },
  fieldValue: { fontSize: 9 },
  attachmentsList: { fontSize: 8, color: '#888', marginTop: 4 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: 'center',
    fontSize: 8,
    color: '#aaa',
    borderTop: '1px solid #eee',
    paddingTop: 6,
  },
  noConsultations: { fontSize: 10, color: '#999', fontStyle: 'italic' },
})

export interface MissionaryReportData {
  missionary: Missionary & { mission?: Mission | null }
  consultations: (Consultation & { files?: ConsultationFile[] })[]
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

export function MissionaryReport({ data }: { data: MissionaryReportData }) {
  const { missionary, consultations } = data
  const today = new Date().toLocaleDateString('pt-BR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.name}>{missionary.full_name}</Text>
          <Text style={styles.subtitle}>
            {missionary.mission?.name ?? ''} · {missionary.current_area ?? ''}
          </Text>
        </View>

        {/* Informações pessoais */}
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nome preferido</Text>
            <Text style={styles.infoValue}>{missionary.preferred_name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>País de origem</Text>
            <Text style={styles.infoValue}>{missionary.country_of_origin}</Text>
          </View>
          {missionary.phone && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{missionary.phone}</Text>
            </View>
          )}
          {missionary.companion_name && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Companheiro(a)</Text>
              <Text style={styles.infoValue}>{missionary.companion_name}</Text>
            </View>
          )}
        </View>

        {/* Informações médicas */}
        <Text style={styles.sectionTitle}>Informações Médicas</Text>
        <View style={styles.infoGrid}>
          {missionary.blood_type && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo sanguíneo</Text>
              <Text style={styles.infoValue}>{missionary.blood_type}</Text>
            </View>
          )}
          {missionary.allergies && (
            <View style={{ width: '100%' }}>
              <Text style={styles.infoLabel}>Alergias</Text>
              <Text style={styles.infoValue}>{missionary.allergies}</Text>
            </View>
          )}
          {missionary.chronic_conditions && (
            <View style={{ width: '100%' }}>
              <Text style={styles.infoLabel}>Condições crônicas</Text>
              <Text style={styles.infoValue}>{missionary.chronic_conditions}</Text>
            </View>
          )}
        </View>

        {/* Histórico de consultas */}
        <Text style={styles.sectionTitle}>
          Histórico de Consultas ({consultations.length})
        </Text>

        {consultations.length === 0 ? (
          <Text style={styles.noConsultations}>Sem consultas registradas.</Text>
        ) : (
          consultations.map(c => (
            <View key={c.id} style={styles.consultationCard}>
              <View style={styles.consultationHeader}>
                <Text style={styles.consultationTitle}>
                  {formatDate(c.consulted_at)} — {c.chief_complaint ?? c.diagnosis ?? 'Consulta'}
                </Text>
                <Text style={styles.badge}>{STATUS_LABELS[c.status]}</Text>
              </View>

              {(c.vital_bp || c.vital_hr || c.vital_temp || c.vital_spo2 || c.vital_weight) && (
                <View style={styles.vitalsRow}>
                  {c.vital_bp && <Text style={styles.vitalChip}>PA: {c.vital_bp}</Text>}
                  {c.vital_hr && <Text style={styles.vitalChip}>FC: {c.vital_hr} bpm</Text>}
                  {c.vital_temp && <Text style={styles.vitalChip}>Temp: {c.vital_temp}°C</Text>}
                  {c.vital_spo2 && <Text style={styles.vitalChip}>SpO2: {c.vital_spo2}%</Text>}
                  {c.vital_weight && <Text style={styles.vitalChip}>Peso: {c.vital_weight} kg</Text>}
                </View>
              )}

              {c.diagnosis && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Diagnóstico</Text>
                  <Text style={styles.fieldValue}>
                    {c.diagnosis}{c.cid10 ? ` (${c.cid10})` : ''}
                  </Text>
                </View>
              )}
              {c.treatment && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Tratamento</Text>
                  <Text style={styles.fieldValue}>{c.treatment}</Text>
                </View>
              )}
              {c.clinical_notes && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Notas clínicas</Text>
                  <Text style={styles.fieldValue}>{c.clinical_notes}</Text>
                </View>
              )}
              {c.follow_up_date && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Seguimento</Text>
                  <Text style={styles.fieldValue}>{formatDate(c.follow_up_date)}</Text>
                </View>
              )}
              {c.files && c.files.length > 0 && (
                <Text style={styles.attachmentsList}>
                  Anexos: {c.files.map(f => f.file_name).join(', ')}
                </Text>
              )}
            </View>
          ))
        )}

        {/* Rodapé */}
        <Text style={styles.footer}>
          Gerado em {today} — Consultório Médico Misional
        </Text>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 3: Criar `components/pdf/export-missionary-button.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { MissionaryReport, MissionaryReportData } from './missionary-report'

export function ExportMissionaryPdfButton({ data }: { data: MissionaryReportData }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const blob = await pdf(<MissionaryReport data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${data.missionary.preferred_name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
      style={{
        background: 'rgba(16,185,129,0.15)',
        color: '#34d399',
        border: '1px solid rgba(16,185,129,0.3)',
      }}
    >
      {loading ? 'Gerando...' : 'Exportar PDF'}
    </button>
  )
}
```

- [ ] **Step 4: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/pdf/missionary-report.tsx components/pdf/export-missionary-button.tsx
git commit -m "feat: add missionary PDF report template and export button"
```

---

## Task 11: Adicionar botão de exportação na página do missionário

**Files:**
- Modify: `app/missionaries/[id]/page.tsx`
- Modify: `lib/queries/missionaries.ts` (getConsultationHistory precisa incluir arquivos)

- [ ] **Step 1: Atualizar `getConsultationHistory` para incluir arquivos**

Em `lib/queries/missionaries.ts`, na função `getConsultationHistory`, atualizar o select:

```typescript
export async function getConsultationHistory(missionaryId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('consultations')
    .select(`
      id, consulted_at, chief_complaint, diagnosis, cid10, treatment,
      status, follow_up_date, clinical_notes, vital_bp, vital_hr,
      vital_temp, vital_spo2, vital_weight,
      files:consultation_files(id, file_name, file_path, file_type, file_size, created_at)
    `)
    .eq('missionary_id', missionaryId)
    .order('consulted_at', { ascending: false })
  return data ?? []
}
```

- [ ] **Step 2: Atualizar `app/missionaries/[id]/page.tsx`**

Adicionar o import do botão e passá-lo na página. O arquivo atual termina o breadcrumb com links de Editar e Delete. Adicionar o botão de exportação:

```tsx
// Adicionar import no topo:
import { ExportMissionaryPdfButton } from '@/components/pdf/export-missionary-button'
import type { MissionaryReportData } from '@/components/pdf/missionary-report'

// No JSX, substituir o div do breadcrumb que contém os botões:
<div className="ml-auto flex items-center gap-2">
  <ExportMissionaryPdfButton
    data={{
      missionary: missionary as any,
      consultations: consultations as any,
    }}
  />
  <Link href={`/missionaries/${id}/edit`} className="text-violet-400 hover:text-violet-300 text-xs">Editar</Link>
  <DeleteMissionaryButton id={id} name={missionary.preferred_name} />
</div>
```

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "app/missionaries/[id]/page.tsx" lib/queries/missionaries.ts
git commit -m "feat: add export PDF button to missionary profile page"
```

---

## Task 12: Template PDF de período e botão de exportação

**Files:**
- Create: `components/pdf/period-report.tsx`
- Create: `components/pdf/export-period-button.tsx`

- [ ] **Step 1: Criar `components/pdf/period-report.tsx`**

```tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { ConsultationStatus, ConsultationFilterResult } from '@/lib/types'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  resolved: 'Resuelto',
  follow_up: 'Seguimiento',
  referral: 'Derivación',
}

const MONTHS_ES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: '2px solid #7c3aed', paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666' },
  table: { marginTop: 12 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: '6 8',
    borderBottom: '1px solid #e0e0e0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5 8',
    borderBottom: '1px solid #f0f0f0',
  },
  colMissionary: { width: '25%', fontSize: 9 },
  colDate: { width: '12%', fontSize: 9 },
  colComplaint: { width: '28%', fontSize: 9 },
  colDiagnosis: { width: '25%', fontSize: 9 },
  colStatus: { width: '10%', fontSize: 9 },
  headerText: { fontSize: 8, fontWeight: 'bold', color: '#666', textTransform: 'uppercase' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: 'center',
    fontSize: 8,
    color: '#aaa',
    borderTop: '1px solid #eee',
    paddingTop: 6,
  },
  summary: { fontSize: 10, color: '#666', marginBottom: 12 },
})

export interface PeriodReportData {
  missionName: string
  month: number
  year: number
  consultations: ConsultationFilterResult[]
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

export function PeriodReport({ data }: { data: PeriodReportData }) {
  const { missionName, month, year, consultations } = data
  const today = new Date().toLocaleDateString('pt-BR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Relatório de Consultas — {MONTHS_ES[month]} {year}
          </Text>
          <Text style={styles.subtitle}>{missionName}</Text>
        </View>

        <Text style={styles.summary}>
          {consultations.length} consulta{consultations.length !== 1 ? 's' : ''} encontrada{consultations.length !== 1 ? 's' : ''} no período.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colMissionary, styles.headerText]}>Misionero</Text>
            <Text style={[styles.colDate, styles.headerText]}>Data</Text>
            <Text style={[styles.colComplaint, styles.headerText]}>Motivo</Text>
            <Text style={[styles.colDiagnosis, styles.headerText]}>Diagnóstico</Text>
            <Text style={[styles.colStatus, styles.headerText]}>Status</Text>
          </View>

          {consultations.map((c, i) => (
            <View key={c.id} style={[styles.tableRow, i % 2 === 0 ? {} : { backgroundColor: '#fafafa' }]}>
              <Text style={styles.colMissionary}>
                {c.missionary?.preferred_name ?? '—'}
              </Text>
              <Text style={styles.colDate}>
                {formatDate(c.consulted_at)}
              </Text>
              <Text style={styles.colComplaint}>
                {c.chief_complaint ?? '—'}
              </Text>
              <Text style={styles.colDiagnosis}>
                {c.diagnosis ?? '—'}
              </Text>
              <Text style={styles.colStatus}>
                {STATUS_LABELS[c.status]}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Gerado em {today} — Consultório Médico Misional
        </Text>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Criar `components/pdf/export-period-button.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { PeriodReport, PeriodReportData } from './period-report'

const MONTHS_ES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function ExportPeriodPdfButton({ data }: { data: PeriodReportData }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const blob = await pdf(<PeriodReport data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${MONTHS_ES[data.month]}-${data.year}.pdf`.toLowerCase()
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading || data.consultations.length === 0}
      className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-40"
      style={{ background: '#7c3aed', color: 'white' }}
    >
      {loading ? 'Gerando PDF...' : `Gerar PDF (${data.consultations.length})`}
    </button>
  )
}
```

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/pdf/period-report.tsx components/pdf/export-period-button.tsx
git commit -m "feat: add period report PDF template and export button"
```

---

## Task 13: Componente ReportFilterForm

**Files:**
- Create: `components/relatorios/report-filter-form.tsx`

- [ ] **Step 1: Criar `components/relatorios/report-filter-form.tsx`**

```tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Mission } from '@/lib/types'

interface Props {
  missions: Mission[]
  missionaries: { id: string; preferred_name: string }[]
  currentMissionId: string
}

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 4 }, (_, i) => currentYear - i)

export function ReportFilterForm({ missions, missionaries, currentMissionId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset missionary when mission changes
      if (key === 'missionId') params.delete('missionaryId')
      router.push(`/relatorios?${params.toString()}`)
    },
    [router, searchParams]
  )

  const selectClass =
    'w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500'
  const selectStyle = {
    background: 'var(--bg-base)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  }

  return (
    <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
      <h2 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Filtros
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Missão *
          </label>
          <select
            value={searchParams.get('missionId') ?? ''}
            onChange={e => updateParam('missionId', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">Selecionar missão...</option>
            {missions.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Mês *
          </label>
          <select
            value={searchParams.get('month') ?? String(new Date().getMonth() + 1)}
            onChange={e => updateParam('month', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Ano *
          </label>
          <select
            value={searchParams.get('year') ?? String(currentYear)}
            onChange={e => updateParam('year', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Status
          </label>
          <select
            value={searchParams.get('status') ?? 'all'}
            onChange={e => updateParam('status', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="all">Todos</option>
            <option value="resolved">Resuelto</option>
            <option value="follow_up">Seguimiento</option>
            <option value="referral">Derivación</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Misionero
          </label>
          <select
            value={searchParams.get('missionaryId') ?? ''}
            onChange={e => updateParam('missionaryId', e.target.value)}
            disabled={!currentMissionId}
            className={selectClass}
            style={{ ...selectStyle, opacity: !currentMissionId ? 0.5 : 1 }}
          >
            <option value="">Todos</option>
            {missionaries.map(m => (
              <option key={m.id} value={m.id}>{m.preferred_name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/relatorios/report-filter-form.tsx
git commit -m "feat: add ReportFilterForm client component"
```

---

## Task 14: Página de Relatórios

**Files:**
- Create: `app/relatorios/page.tsx`

- [ ] **Step 1: Criar `app/relatorios/page.tsx`**

```tsx
import { AppShell } from '@/components/layout/app-shell'
import { getMissions, getMissionariesByMission } from '@/lib/queries/missionaries'
import { getConsultationsByFilters } from '@/lib/queries/consultations'
import { ReportFilterForm } from '@/components/relatorios/report-filter-form'
import { ExportPeriodPdfButton } from '@/components/pdf/export-period-button'
import { formatDate } from '@/lib/utils'
import { ConsultationStatus, ConsultationFilterResult } from '@/lib/types'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  resolved: 'Resuelto',
  follow_up: 'Seguimiento',
  referral: 'Derivación',
}

const STATUS_COLORS: Record<ConsultationStatus, string> = {
  resolved: 'text-emerald-400',
  follow_up: 'text-amber-400',
  referral: 'text-blue-400',
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{
    missionId?: string
    month?: string
    year?: string
    status?: string
    missionaryId?: string
  }>
}) {
  const params = await searchParams
  const missions = await getMissions()

  const missionId = params.missionId ?? ''
  const month = parseInt(params.month ?? String(new Date().getMonth() + 1))
  const year = parseInt(params.year ?? String(new Date().getFullYear()))
  const status = (params.status ?? 'all') as ConsultationStatus | 'all'
  const missionaryId = params.missionaryId ?? ''

  const [missionaries, consultations] = await Promise.all([
    missionId ? getMissionariesByMission(missionId) : Promise.resolve([]),
    missionId
      ? getConsultationsByFilters({ missionId, month, year, status, missionaryId: missionaryId || undefined })
      : Promise.resolve([]),
  ])

  const selectedMission = missions.find(m => m.id === missionId)

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <h1 className="text-xl font-bold mb-5">Relatórios</h1>

        <div className="flex flex-col gap-4">
          <ReportFilterForm
            missions={missions}
            missionaries={missionaries}
            currentMissionId={missionId}
          />

          {missionId && (
            <>
              {/* Prévia */}
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                <div
                  className="px-4 py-3 flex justify-between items-center text-xs uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
                >
                  <span>Prévia</span>
                  <span>{consultations.length} consulta{consultations.length !== 1 ? 's' : ''} encontrada{consultations.length !== 1 ? 's' : ''}</span>
                </div>

                {consultations.length === 0 ? (
                  <p className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nenhuma consulta encontrada para os filtros selecionados.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          className="text-xs uppercase tracking-wide"
                          style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
                        >
                          <th className="px-4 py-2 text-left font-normal">Misionero</th>
                          <th className="px-4 py-2 text-left font-normal">Data</th>
                          <th className="px-4 py-2 text-left font-normal">Motivo</th>
                          <th className="px-4 py-2 text-left font-normal">Diagnóstico</th>
                          <th className="px-4 py-2 text-left font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consultations.map((c: ConsultationFilterResult, i: number) => (
                          <tr
                            key={c.id}
                            style={{ borderBottom: i < consultations.length - 1 ? '1px solid var(--border)' : undefined }}
                          >
                            <td className="px-4 py-2.5">{c.missionary?.preferred_name ?? '—'}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
                              {formatDate(c.consulted_at.split('T')[0])}
                            </td>
                            <td className="px-4 py-2.5 text-xs">{c.chief_complaint ?? '—'}</td>
                            <td className="px-4 py-2.5 text-xs">{c.diagnosis ?? '—'}</td>
                            <td className={`px-4 py-2.5 text-xs ${STATUS_COLORS[c.status]}`}>
                              {STATUS_LABELS[c.status]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Botão gerar PDF */}
              <ExportPeriodPdfButton
                data={{
                  missionName: selectedMission?.name ?? '',
                  month,
                  year,
                  consultations,
                }}
              />
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/relatorios/page.tsx
git commit -m "feat: add reports section with filters, preview table, and PDF export"
```

---

## Task 15: Navegação — adicionar Relatórios

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/bottom-nav.tsx`

- [ ] **Step 1: Atualizar `components/layout/sidebar.tsx`**

Localizar o array `NAV_ITEMS` e adicionar o item de Relatórios ao final:

```typescript
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: '📋' },
  { href: '/missionaries', label: 'Misioneros', icon: '👤' },
  { href: '/agenda', label: 'Agenda', icon: '📅' },
  { href: '/consultas/nova', label: 'Nueva Consulta', icon: '📝' },
  { href: '/relatorios', label: 'Relatórios', icon: '📊' },
]
```

- [ ] **Step 2: Atualizar `components/layout/bottom-nav.tsx`**

Localizar o array `NAV_ITEMS` e substituir pelo seguinte (mantendo 5 itens no mobile):

```typescript
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: '📋' },
  { href: '/missionaries', label: 'Misioneros', icon: '👤' },
  { href: '/agenda', label: 'Agenda', icon: '📅' },
  { href: '/consultas/nova', label: 'Consulta', icon: '📝' },
  { href: '/relatorios', label: 'Relatórios', icon: '📊' },
]
```

- [ ] **Step 3: Verificar que compila**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/sidebar.tsx components/layout/bottom-nav.tsx
git commit -m "feat: add Relatórios to sidebar and bottom navigation"
```

---

## Task 16: Verificação final

- [ ] **Step 1: Rodar todos os testes**

```bash
npx vitest run
```

Esperado: todos os testes passando (incluindo os novos de FileAttachments).

- [ ] **Step 2: Verificar compilação TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Testar o fluxo completo manualmente**

```bash
npm run dev
```

Verificar:
1. Criar uma consulta → redireciona para `/consultas/[id]`
2. Na página de detalhe, fazer upload de um arquivo
3. No perfil de um missionário, clicar numa consulta do histórico → abre detalhe
4. Clicar em "Exportar PDF" no perfil → PDF baixado com histórico completo
5. Acessar `/relatorios`, selecionar missão + mês → prévia aparece
6. Clicar "Gerar PDF" → PDF baixado com tabela de consultas
7. Navegação: "Relatórios" aparece no menu lateral e no bottom nav

- [ ] **Step 4: Commit final se necessário**

```bash
git status
# Se houver arquivos não commitados:
git add -A
git commit -m "chore: final cleanup after reports and file upload implementation"
```
