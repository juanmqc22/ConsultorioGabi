# Design: Relatórios, Detalhe de Consulta e Upload de Arquivos

**Data:** 2026-06-04  
**Status:** Aprovado

---

## Resumo

Quatro melhorias relacionadas ao fluxo clínico do consultório:

1. **Página de detalhe da consulta** — cada consulta tem sua própria página com todos os campos
2. **Exportar PDF do missionário** — botão no perfil gera relatório completo
3. **Seção de Relatórios** — nova rota com filtros para gerar PDFs por período/missão
4. **Upload de arquivos nas consultas** — radiografias e exames anexados a cada consulta

---

## Arquitetura Geral

### Novas rotas

| Rota | Descrição |
|------|-----------|
| `/consultas/[id]` | Detalhe completo de uma consulta |
| `/relatorios` | Filtros + prévia + geração de PDF |

### Nova dependência

- `@react-pdf/renderer` — geração de PDF no cliente (browser), sem servidor

### Nova tabela no banco

```sql
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

### Supabase Storage

- Bucket: `consultation-files` (privado, acesso autenticado)
- Caminho dos arquivos: `{missionary_id}/{consultation_id}/{filename}`

### Novos arquivos

```
app/
  consultas/
    [id]/
      page.tsx                      ← página de detalhe da consulta
  relatorios/
    page.tsx                        ← seção de relatórios

components/
  consultations/
    consultation-detail.tsx         ← layout do detalhe
    file-attachments.tsx            ← upload + lista de arquivos (reutilizável)
  pdf/
    missionary-report.tsx           ← template PDF relatório do missionário
    period-report.tsx               ← template PDF relatório por período
  relatorios/
    report-filters.tsx              ← filtros + prévia em tabela

lib/
  actions/
    files.ts                        ← uploadConsultationFile, deleteConsultationFile
  queries/
    consultations.ts                ← getConsultationById, getConsultationsByFilters
```

---

## Seção 1: Página de detalhe da consulta

**Rota:** `/consultas/[id]`

### Mudança no componente existente

`components/missionaries/consultation-history.tsx`: cada item vira `<Link href={/consultas/${c.id}}>` em vez de `<div>`.

### Layout da página

```
Breadcrumb: Misioneros › [Nome] › Consulta [Data]          [Editar] [PDF ↓]

┌─ Cabeçalho ────────────────────────────────────────────────┐
│  Motivo principal          Status (badge)                   │
│  Data e hora da consulta                                    │
├─ Sinais Vitais ─────────────────────────────────────────────┤
│  PA  ·  FC  ·  Temperatura  ·  SpO2  ·  Peso               │
├─ Clínica ───────────────────────────────────────────────────┤
│  Motivo de consulta                                         │
│  Notas clínicas                                             │
│  Diagnóstico · CIE-10                                       │
│  Tratamento / Medicação                                     │
│  Data de seguimento                                         │
├─ Anexos ────────────────────────────────────────────────────┤
│  [lista de arquivos]                    [+ Adicionar]       │
└─────────────────────────────────────────────────────────────┘
```

### Queries necessárias

- `getConsultationById(id)` — consulta + missionário + missão + arquivos
- Adicionar `consultation_files` ao join existente em `getConsultationHistory`

### Botão "PDF ↓" na consulta individual

Gera PDF de uma única consulta (útil para encaminhar ao especialista). Usa o mesmo template de relatório completo, filtrado para uma consulta.

---

## Seção 2: PDF com `@react-pdf/renderer`

### Template 1 — Relatório completo do missionário

**Arquivo:** `components/pdf/missionary-report.tsx`  
**Acionado por:** botão "Exportar Relatório" no perfil do missionário (`/missionaries/[id]`)

**Conteúdo:**
- Cabeçalho: nome completo, missão, área, status, data de nascimento, país de origem
- Bloco médico: tipo sanguíneo, alergias, condições crônicas, observações
- Histórico de consultas: para cada consulta — data, motivo, sinais vitais, diagnóstico, CIE-10, tratamento, notas clínicas, status, data de seguimento, nomes dos anexos
- Rodapé: "Gerado em [data] — Consultório Médico Misional"

### Template 2 — Relatório por período

**Arquivo:** `components/pdf/period-report.tsx`  
**Acionado por:** botão "Gerar PDF" na seção `/relatorios`

**Conteúdo:**
- Cabeçalho: missão + período (ex: "Março 2026")
- Tabela: Missionário · Data · Motivo · Diagnóstico · Status
- Total de consultas no rodapé

### Mecanismo de download (client-side)

```tsx
import { pdf } from '@react-pdf/renderer'

async function handleExport() {
  const blob = await pdf(<MissionaryReport data={data} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio-${missionaryName}-${date}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
```

Nenhuma rota de servidor necessária.

---

## Seção 3: Seção de Relatórios (`/relatorios`)

**Posição no menu:** último item, após Consultas.

### Filtros

| Filtro | Tipo | Obrigatório |
|--------|------|-------------|
| Missão | Dropdown | Sim |
| Mês | Dropdown (Jan–Dez) | Sim |
| Ano | Dropdown (anos disponíveis) | Sim |
| Status | Dropdown (Todos / Resuelto / Seguimiento / Derivación) | Não |
| Missionário | Dropdown (depende da missão selecionada) | Não |

### Comportamento

- A prévia em tabela atualiza automaticamente quando os filtros mudam (sem botão separado para buscar)
- O botão "Gerar PDF" fica desabilitado quando não há resultados
- Contador: "X consultas encontradas"

### Queries necessárias

- `getMissions()` — já existe em `lib/queries/missionaries.ts`
- `getMissionariesByMission(missionId)` — nova query para popular dropdown de missionários
- `getConsultationsByFilters({ missionId, month, year, status?, missionaryId? })` — nova query com joins

---

## Seção 4: Upload de arquivos

### Componente `file-attachments.tsx`

Reutilizável em dois contextos:
- `mode="create"` — arquivos ficam em estado local até a consulta ser salva
- `mode="edit"` — upload direto ao Supabase Storage via Server Action

### Regras

- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Tamanho máximo: 10MB por arquivo
- Múltiplos arquivos ao mesmo tempo

### Fluxo no formulário de criação

1. Usuário seleciona arquivos (ficam em estado `File[]` local)
2. Formulário é submetido → consulta criada → `consultation_id` retornado
3. Server action faz upload dos arquivos com o `consultation_id`
4. Se upload falhar: consulta existe, usuário pode adicionar arquivos depois na página de detalhe

### Fluxo na página de detalhe

- Botão `+ Adicionar` abre seletor de arquivo
- Upload imediato via Server Action `uploadConsultationFile`
- Cada arquivo tem botão de remoção (apaga do Storage + da tabela)

### Server Actions (`lib/actions/files.ts`)

```typescript
uploadConsultationFile(consultationId: string, file: File): Promise<void>
deleteConsultationFile(fileId: string, filePath: string): Promise<void>
```

### No PDF do missionário

Cada consulta lista os nomes dos anexos (ex: "Anexos: radiografia.jpg, exame_sangue.pdf"). As imagens não são incorporadas no PDF.

---

## Migração do banco de dados

Um único arquivo de migração novo:

```
supabase/migrations/YYYYMMDDHHMMSS_consultation_files.sql
```

Contendo:
1. Criação da tabela `consultation_files`
2. Index em `consultation_id`
3. RLS policy

---

## Fora do escopo

- Visualizador de imagem inline no app (só download/abertura em nova aba)
- Imagens incorporadas no PDF
- Assinatura digital no PDF
- Controle de versões de arquivos
