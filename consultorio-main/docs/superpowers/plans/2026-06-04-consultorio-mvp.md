# Consultório Médico Missionário — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive web app for a solo general practitioner managing LDS missionary health records across 2–3 missions, replacing paper/spreadsheet/WhatsApp with a single free-hosted system.

**Architecture:** Next.js 15 App Router with Server Components for data fetching and Server Actions for mutations. Supabase handles PostgreSQL database and authentication. All state is server-side — no client state management library needed.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), Vercel (hosting), Vitest (unit tests)

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                    # Root HTML shell, loads fonts
│   ├── page.tsx                      # Redirect → /dashboard
│   ├── login/page.tsx                # Login screen (client component)
│   ├── dashboard/page.tsx            # Dashboard (server component)
│   ├── missionaries/
│   │   ├── page.tsx                  # Missionary list (server component)
│   │   ├── new/page.tsx              # New missionary form
│   │   └── [id]/
│   │       ├── page.tsx              # Missionary profile (server component)
│   │       └── edit/page.tsx         # Edit missionary form
│   ├── consultas/
│   │   └── nova/page.tsx             # New consultation form
│   └── agenda/page.tsx               # Agenda (server component)
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx             # Wraps pages with sidebar + bottom nav
│   │   ├── sidebar.tsx               # Desktop sidebar navigation
│   │   └── bottom-nav.tsx            # Mobile bottom navigation
│   ├── dashboard/
│   │   ├── stats-row.tsx             # 4 metric cards
│   │   └── todays-appointments.tsx   # Today's appointment list
│   ├── missionaries/
│   │   ├── missionary-card.tsx       # Card in the list view
│   │   ├── mission-filter.tsx        # Chip filters by mission
│   │   ├── health-status-badge.tsx   # Saudável/Acompanhamento/Alergia chip
│   │   ├── profile-header.tsx        # Name, age, mission banner
│   │   ├── mission-info-block.tsx    # Dates, companion block
│   │   ├── medical-info-block.tsx    # Allergies, blood type, emergency contact
│   │   ├── consultation-history.tsx  # List of past consultations
│   │   └── missionary-form.tsx       # New + edit form (client component)
│   ├── consultations/
│   │   ├── allergy-alert.tsx         # Red warning banner
│   │   ├── vital-signs-fields.tsx    # BP, temp, HR, SpO2, weight
│   │   └── consultation-form.tsx     # Full form (client component)
│   └── agenda/
│       ├── week-strip.tsx            # Mobile week selector
│       ├── mini-calendar.tsx         # Desktop month calendar
│       ├── day-timeline.tsx          # Appointment list for selected day
│       ├── appointment-card.tsx      # Single appointment row
│       └── appointment-form.tsx      # New appointment modal (client component)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   └── server.ts                 # Server Supabase client (uses cookies)
│   ├── actions/
│   │   ├── missionaries.ts           # Server Actions: create, update missionary
│   │   ├── consultations.ts          # Server Actions: create consultation
│   │   └── appointments.ts           # Server Actions: create, update appointment
│   ├── queries/
│   │   ├── dashboard.ts              # Dashboard data queries
│   │   ├── missionaries.ts           # Missionary list + profile queries
│   │   ├── consultations.ts          # Consultation history query
│   │   └── agenda.ts                 # Agenda queries
│   ├── types.ts                      # All TypeScript interfaces and enums
│   └── utils.ts                      # Pure helpers: health status, age, dates
├── supabase/migrations/
│   ├── 001_create_missions.sql
│   ├── 002_create_missionaries.sql
│   ├── 003_create_appointments.sql
│   └── 004_create_consultations.sql
├── middleware.ts                     # Auth guard — redirects unauthenticated users
├── vitest.config.ts
└── .env.local                        # NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `vitest.config.ts`
- Create: `.env.local`
- Create: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/juanquezada/Desktop/Consultorio
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir=no \
  --import-alias="@/*" \
  --no-git
```

When prompted, accept all defaults.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
})
```

Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add inside `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Create .env.local**

Create `.env.local` (fill in real values in Task 3):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 6: Set global CSS dark theme**

Replace `app/globals.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base: #1e1e2e;
  --bg-surface: #181825;
  --bg-overlay: #313244;
  --border: #45475a;
  --text: #cdd6f4;
  --text-muted: rgba(205, 214, 244, 0.5);
}

body {
  background-color: var(--bg-base);
  color: var(--text);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}

* { box-sizing: border-box; }
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: server running at http://localhost:3000 with no errors.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 project with Supabase and Vitest"
```

---

## Task 2: TypeScript Types + Utility Functions

**Files:**
- Create: `lib/types.ts`
- Create: `lib/utils.ts`
- Create: `lib/utils.test.ts`

- [ ] **Step 1: Write failing tests for utility functions**

Create `lib/utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getMissionaryHealthStatus, formatAge, formatDate } from './utils'

describe('getMissionaryHealthStatus', () => {
  it('returns saudavel when allergies is null and no consultation', () => {
    expect(getMissionaryHealthStatus({ allergies: null }, null)).toBe('saudavel')
  })

  it('returns saudavel when allergies is empty string', () => {
    expect(getMissionaryHealthStatus({ allergies: '' }, null)).toBe('saudavel')
  })

  it('returns alergia when allergies is set, regardless of consultation status', () => {
    expect(getMissionaryHealthStatus({ allergies: 'Penicilina' }, null)).toBe('alergia')
    expect(getMissionaryHealthStatus({ allergies: 'Penicilina' }, { status: 'follow_up' })).toBe('alergia')
    expect(getMissionaryHealthStatus({ allergies: 'Penicilina' }, { status: 'resolved' })).toBe('alergia')
  })

  it('returns acompanhamento when last consultation is follow_up and no allergies', () => {
    expect(getMissionaryHealthStatus({ allergies: null }, { status: 'follow_up' })).toBe('acompanhamento')
  })

  it('returns saudavel when last consultation is resolved and no allergies', () => {
    expect(getMissionaryHealthStatus({ allergies: null }, { status: 'resolved' })).toBe('saudavel')
  })

  it('returns saudavel when last consultation is referral and no allergies', () => {
    expect(getMissionaryHealthStatus({ allergies: null }, { status: 'referral' })).toBe('saudavel')
  })
})

describe('formatAge', () => {
  it('calculates age correctly', () => {
    const today = new Date()
    const birthYear = today.getFullYear() - 22
    const birthdate = `${birthYear}-01-01`
    expect(formatAge(birthdate)).toBe(22)
  })
})

describe('formatDate', () => {
  it('formats a date string to dd/MM/yyyy', () => {
    expect(formatDate('2025-06-04')).toBe('04/06/2025')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test:run
```

Expected: FAIL — `getMissionaryHealthStatus`, `formatAge`, `formatDate` not defined.

- [ ] **Step 3: Create types**

Create `lib/types.ts`:
```typescript
export type MissionaryStatus = 'active' | 'transferred' | 'released' | 'medical_leave'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type ConsultationStatus = 'resolved' | 'follow_up' | 'referral'
export type HealthStatus = 'saudavel' | 'acompanhamento' | 'alergia'

export interface Mission {
  id: string
  name: string
  short_name: string
  color: string
  created_at: string
}

export interface Missionary {
  id: string
  full_name: string
  preferred_name: string
  birthdate: string
  country_of_origin: string
  mission_id: string
  current_area: string | null
  companion_name: string | null
  mission_start_date: string | null
  mission_expected_end: string | null
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  blood_type: string | null
  allergies: string | null
  chronic_conditions: string | null
  notes: string | null
  status: MissionaryStatus
  created_at: string
  mission?: Mission
}

export interface Appointment {
  id: string
  missionary_id: string
  scheduled_at: string
  reason: string | null
  status: AppointmentStatus
  notes: string | null
  created_at: string
  missionary?: Pick<Missionary, 'id' | 'preferred_name' | 'mission_id'> & { mission?: Pick<Mission, 'short_name' | 'color'> }
}

export interface Consultation {
  id: string
  missionary_id: string
  appointment_id: string | null
  consulted_at: string
  chief_complaint: string | null
  vital_bp: string | null
  vital_temp: number | null
  vital_hr: number | null
  vital_spo2: number | null
  vital_weight: number | null
  clinical_notes: string | null
  diagnosis: string | null
  cid10: string | null
  treatment: string | null
  follow_up_date: string | null
  status: ConsultationStatus
  created_at: string
}
```

- [ ] **Step 4: Implement utility functions**

Create `lib/utils.ts`:
```typescript
import { ConsultationStatus, HealthStatus } from './types'

export function getMissionaryHealthStatus(
  missionary: { allergies: string | null },
  lastConsultation: { status: ConsultationStatus } | null
): HealthStatus {
  if (missionary.allergies && missionary.allergies.trim().length > 0) return 'alergia'
  if (lastConsultation?.status === 'follow_up') return 'acompanhamento'
  return 'saudavel'
}

export function formatAge(birthdate: string): number {
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function startOfDay(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
}

export function endOfDay(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
}

export function startOfWeek(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return startOfDay(d)
}

export function endOfWeek(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() + (6 - d.getDay()))
  return endOfDay(d)
}

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  saudavel: 'Saudável',
  acompanhamento: 'Acompanhamento',
  alergia: 'Alergia',
}

export const HEALTH_STATUS_COLORS: Record<HealthStatus, string> = {
  saudavel: 'bg-emerald-500/20 text-emerald-400',
  acompanhamento: 'bg-amber-500/20 text-amber-400',
  alergia: 'bg-red-500/20 text-red-400',
}

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Realizado',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
}

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-slate-500/20 text-slate-300',
  confirmed: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-violet-500/20 text-violet-400',
  cancelled: 'bg-red-500/20 text-red-400',
  no_show: 'bg-red-500/20 text-red-400',
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npm run test:run
```

Expected: 8 tests passing.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/utils.ts lib/utils.test.ts vitest.config.ts vitest.setup.ts
git commit -m "feat: add TypeScript types and utility functions with tests"
```

---

## Task 3: Supabase Setup + Database Migrations

**Files:**
- Create: `supabase/migrations/001_create_missions.sql`
- Create: `supabase/migrations/002_create_missionaries.sql`
- Create: `supabase/migrations/003_create_appointments.sql`
- Create: `supabase/migrations/004_create_consultations.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project. Choose a name (e.g. `consultorio`), set a strong database password, select region closest to Brazil (South America). Save the password.

After creation, go to **Project Settings → API** and copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Update `.env.local` with those values.

- [ ] **Step 2: Write missions migration**

Create `supabase/migrations/001_create_missions.sql`:
```sql
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
```

- [ ] **Step 3: Write missionaries migration**

Create `supabase/migrations/002_create_missionaries.sql`:
```sql
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
```

- [ ] **Step 4: Write appointments migration**

Create `supabase/migrations/003_create_appointments.sql`:
```sql
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
```

- [ ] **Step 5: Write consultations migration**

Create `supabase/migrations/004_create_consultations.sql`:
```sql
create type consultation_status as enum ('resolved', 'follow_up', 'referral');

create table consultations (
  id uuid primary key default gen_random_uuid(),
  missionary_id uuid not null references missionaries(id) on delete cascade,
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

create index consultations_missionary_id_idx on consultations(missionary_id);
create index consultations_consulted_at_idx on consultations(consulted_at);

alter table consultations enable row level security;
create policy "authenticated full access" on consultations
  for all to authenticated using (true) with check (true);
```

- [ ] **Step 6: Run migrations in Supabase**

In the Supabase dashboard → **SQL Editor**, paste and run each migration file **in order** (001 → 002 → 003 → 004).

Expected: tables `missions`, `missionaries`, `appointments`, `consultations` created. `missions` table has 3 rows (SP Norte, SP Sul, SP Leste).

- [ ] **Step 7: Create Supabase browser client**

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 8: Create Supabase server client**

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add supabase/ lib/supabase/ .env.local
git commit -m "feat: add Supabase migrations, RLS policies, and client helpers"
```

---

## Task 4: Auth Middleware + Login Page

**Files:**
- Create: `middleware.ts`
- Create: `app/login/page.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create auth middleware**

Create `middleware.ts` at project root:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 2: Create login page**

Create `app/login/page.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚕️</div>
          <h1 className="text-2xl font-bold">Consultório</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Área restrita ao médico</p>
        </div>
        <form
          onSubmit={handleLogin}
          className="rounded-xl p-6 flex flex-col gap-4"
          style={{ background: 'var(--bg-overlay)' }}
        >
          <div>
            <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'var(--bg-base)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'var(--bg-base)', color: 'var(--text)' }}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors mt-1"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create doctor account in Supabase**

In Supabase dashboard → **Authentication → Users → Add user**. Enter the doctor's email and a strong password. This creates the single authorized account.

- [ ] **Step 4: Create root redirect**

Replace `app/page.tsx`:
```tsx
import { redirect } from 'next/navigation'
export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 5: Verify auth flow**

```bash
npm run dev
```

Open http://localhost:3000 — should redirect to `/login`. Enter correct credentials — should redirect to `/dashboard` (404 for now, that's fine). Enter wrong credentials — should show error message.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts app/login/page.tsx app/page.tsx
git commit -m "feat: add auth middleware and login page"
```

---

## Task 5: App Shell (Layout + Navigation)

**Files:**
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/bottom-nav.tsx`
- Create: `components/layout/app-shell.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create sidebar**

Create `components/layout/sidebar.tsx`:
```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📋' },
  { href: '/missionaries', label: 'Missionários', icon: '👤' },
  { href: '/agenda', label: 'Agenda', icon: '📅' },
  { href: '/consultas/nova', label: 'Nova Consulta', icon: '📝' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside
      className="hidden md:flex flex-col w-52 h-screen sticky top-0 border-r p-4 flex-shrink-0"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="font-bold text-violet-400 mb-6 text-base flex items-center gap-2">
        <span>⚕️</span> Consultório
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: active ? '#a78bfa' : 'var(--text-muted)',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create bottom navigation**

Create `components/layout/bottom-nav.tsx`:
```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Início', icon: '📋' },
  { href: '/missionaries', label: 'Missionários', icon: '👤' },
  { href: '/agenda', label: 'Agenda', icon: '📅' },
  { href: '/consultas/nova', label: 'Consulta', icon: '📝' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-50"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors"
            style={{ color: active ? '#a78bfa' : 'var(--text-muted)' }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Create app shell**

Create `components/layout/app-shell.tsx`:
```tsx
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0 min-w-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Update root layout**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Consultório',
  description: 'Sistema médico para missionários',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={geist.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: add app shell with responsive sidebar and bottom navigation"
```

---

## Task 6: Dashboard Page

**Files:**
- Create: `lib/queries/dashboard.ts`
- Create: `components/dashboard/stats-row.tsx`
- Create: `components/dashboard/todays-appointments.tsx`
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard queries**

Create `lib/queries/dashboard.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from '@/lib/utils'

export async function getDashboardData() {
  const supabase = await createClient()
  const today = new Date()

  const [
    { count: todayCount },
    { count: missionaryCount },
    { count: weekCount },
    { count: missionCount },
    { data: todayAppointments },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', startOfDay(today))
      .lte('scheduled_at', endOfDay(today)),
    supabase
      .from('missionaries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', startOfWeek(today))
      .lte('scheduled_at', endOfWeek(today)),
    supabase
      .from('missions')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('id, scheduled_at, reason, status, missionary:missionaries(id, preferred_name, mission:missions(short_name, color))')
      .gte('scheduled_at', startOfDay(today))
      .lte('scheduled_at', endOfDay(today))
      .order('scheduled_at'),
  ])

  return {
    stats: {
      today: todayCount ?? 0,
      missionaries: missionaryCount ?? 0,
      week: weekCount ?? 0,
      missions: missionCount ?? 0,
    },
    todayAppointments: todayAppointments ?? [],
  }
}
```

- [ ] **Step 2: Create stats row component**

Create `components/dashboard/stats-row.tsx`:
```tsx
interface Props {
  today: number
  missionaries: number
  week: number
  missions: number
}

export function StatsRow({ today, missionaries, week, missions }: Props) {
  const stats = [
    { label: 'Hoje', value: today, color: '#a78bfa' },
    { label: 'Missionários', value: missionaries, color: '#34d399' },
    { label: 'Esta semana', value: week, color: '#fbbf24' },
    { label: 'Missões', value: missions, color: '#22d3ee' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create today's appointments component**

Create `components/dashboard/todays-appointments.tsx`:
```tsx
import Link from 'next/link'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/utils'

interface Appointment {
  id: string
  scheduled_at: string
  reason: string | null
  status: string
  missionary: { id: string; preferred_name: string; mission: { short_name: string; color: string } | null } | null
}

export function TodaysAppointments({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
        Nenhuma consulta agendada para hoje.
      </div>
    )
  }
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
      <div className="px-4 py-3 text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
        Consultas de Hoje
      </div>
      {appointments.map(appt => {
        const time = new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const missionColor = appt.missionary?.mission?.color ?? '#7c3aed'
        return (
          <Link
            key={appt.id}
            href={appt.missionary ? `/missionaries/${appt.missionary.id}` : '#'}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: missionColor }} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{appt.missionary?.preferred_name ?? '—'}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {appt.missionary?.mission?.short_name} · {appt.reason ?? 'Consulta'}
              </div>
            </div>
            <div className="text-xs font-semibold flex-shrink-0" style={{ color: missionColor }}>{time}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${APPOINTMENT_STATUS_COLORS[appt.status] ?? ''}`}>
              {APPOINTMENT_STATUS_LABELS[appt.status] ?? appt.status}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create dashboard page**

Create `app/dashboard/page.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'
import { StatsRow } from '@/components/dashboard/stats-row'
import { TodaysAppointments } from '@/components/dashboard/todays-appointments'
import { getDashboardData } from '@/lib/queries/dashboard'
import Link from 'next/link'

export default async function DashboardPage() {
  const { stats, todayAppointments } = await getDashboardData()
  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'
  const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{greeting} 👋</h1>
            <p className="text-sm capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>{dateStr}</p>
          </div>
          <Link
            href="/consultas/nova"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Nova Consulta
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <StatsRow {...stats} />
          <TodaysAppointments appointments={todayAppointments as any} />
        </div>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 5: Verify dashboard loads**

```bash
npm run dev
```

Log in and navigate to http://localhost:3000/dashboard. Expected: dashboard with 4 stat cards and the appointment list (empty initially).

- [ ] **Step 6: Commit**

```bash
git add lib/queries/dashboard.ts components/dashboard/ app/dashboard/page.tsx
git commit -m "feat: add dashboard with stats and today's appointments"
```

---

## Task 7: Missionaries List + Profile

**Files:**
- Create: `lib/queries/missionaries.ts`
- Create: `components/missionaries/health-status-badge.tsx`
- Create: `components/missionaries/missionary-card.tsx`
- Create: `components/missionaries/mission-filter.tsx`
- Create: `components/missionaries/profile-header.tsx`
- Create: `components/missionaries/mission-info-block.tsx`
- Create: `components/missionaries/medical-info-block.tsx`
- Create: `components/missionaries/consultation-history.tsx`
- Create: `app/missionaries/page.tsx`
- Create: `app/missionaries/[id]/page.tsx`

- [ ] **Step 1: Create missionary queries**

Create `lib/queries/missionaries.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getMissionaries(missionId?: string, search?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('missionaries')
    .select(`
      id, preferred_name, full_name, birthdate, country_of_origin,
      mission_id, allergies, status,
      mission:missions(id, short_name, color),
      last_consultation:consultations(status)
    `)
    .eq('status', 'active')
    .order('preferred_name')
    .limit(1, { foreignTable: 'last_consultation' })

  if (missionId) query = query.eq('mission_id', missionId)
  if (search) query = query.ilike('preferred_name', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getMissionaryById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('missionaries')
    .select('*, mission:missions(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getMissions() {
  const supabase = await createClient()
  const { data } = await supabase.from('missions').select('*').order('short_name')
  return data ?? []
}

export async function getConsultationHistory(missionaryId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('consultations')
    .select('id, consulted_at, chief_complaint, diagnosis, cid10, treatment, status, follow_up_date')
    .eq('missionary_id', missionaryId)
    .order('consulted_at', { ascending: false })
  return data ?? []
}
```

- [ ] **Step 2: Create health status badge**

Create `components/missionaries/health-status-badge.tsx`:
```tsx
import { getMissionaryHealthStatus, HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS } from '@/lib/utils'
import { ConsultationStatus } from '@/lib/types'

interface Props {
  allergies: string | null
  lastConsultationStatus?: ConsultationStatus | null
}

export function HealthStatusBadge({ allergies, lastConsultationStatus }: Props) {
  const status = getMissionaryHealthStatus(
    { allergies },
    lastConsultationStatus ? { status: lastConsultationStatus } : null
  )
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${HEALTH_STATUS_COLORS[status]}`}>
      {HEALTH_STATUS_LABELS[status]}
    </span>
  )
}
```

- [ ] **Step 3: Create missionary card**

Create `components/missionaries/missionary-card.tsx`:
```tsx
import Link from 'next/link'
import { formatAge } from '@/lib/utils'
import { HealthStatusBadge } from './health-status-badge'

interface Props {
  missionary: {
    id: string
    preferred_name: string
    birthdate: string
    country_of_origin: string
    allergies: string | null
    mission: { short_name: string; color: string } | null
    last_consultation?: { status: string }[] | null
  }
}

export function MissionaryCard({ missionary: m }: Props) {
  const lastStatus = m.last_consultation?.[0]?.status as any ?? null
  return (
    <Link
      href={`/missionaries/${m.id}`}
      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
    >
      <div>
        <div className="font-semibold text-sm">{m.preferred_name}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatAge(m.birthdate)} anos · {m.country_of_origin} · {m.mission?.short_name ?? '—'}
        </div>
      </div>
      <HealthStatusBadge allergies={m.allergies} lastConsultationStatus={lastStatus} />
    </Link>
  )
}
```

- [ ] **Step 4: Create mission filter**

Create `components/missionaries/mission-filter.tsx`:
```tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mission } from '@/lib/types'

export function MissionFilter({ missions }: { missions: Mission[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const current = params.get('mission') ?? ''

  function select(id: string) {
    const next = new URLSearchParams(params)
    if (id) next.set('mission', id)
    else next.delete('mission')
    router.push(`/missionaries?${next.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => select('')}
        className="text-xs px-3 py-1.5 rounded-full transition-colors"
        style={{
          background: !current ? '#7c3aed' : 'var(--bg-overlay)',
          color: !current ? 'white' : 'var(--text-muted)',
        }}
      >
        Todos
      </button>
      {missions.map(m => (
        <button
          key={m.id}
          onClick={() => select(m.id)}
          className="text-xs px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: current === m.id ? m.color : 'var(--bg-overlay)',
            color: current === m.id ? 'white' : 'var(--text-muted)',
          }}
        >
          {m.short_name}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Create missionaries list page**

Create `app/missionaries/page.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'
import { MissionaryCard } from '@/components/missionaries/missionary-card'
import { MissionFilter } from '@/components/missionaries/mission-filter'
import { getMissionaries, getMissions } from '@/lib/queries/missionaries'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function MissionariesPage({
  searchParams,
}: {
  searchParams: Promise<{ mission?: string; q?: string }>
}) {
  const { mission, q } = await searchParams
  const [missionaries, missions] = await Promise.all([
    getMissionaries(mission, q),
    getMissions(),
  ])

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold">Missionários</h1>
          <Link
            href="/missionaries/new"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Novo
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <Suspense>
            <MissionFilter missions={missions} />
          </Suspense>
          <div className="flex flex-col gap-2">
            {missionaries.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Nenhum missionário encontrado.
              </p>
            ) : (
              missionaries.map((m: any) => <MissionaryCard key={m.id} missionary={m} />)
            )}
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {missionaries.length} missionário{missionaries.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 6: Create profile components**

Create `components/missionaries/profile-header.tsx`:
```tsx
import { Missionary } from '@/lib/types'
import { formatAge } from '@/lib/utils'
import Link from 'next/link'

export function ProfileHeader({ missionary: m }: { missionary: Missionary }) {
  const initials = m.preferred_name.split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div
      className="rounded-xl p-5 flex items-start justify-between gap-4"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          {initials}
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">{m.preferred_name}</h1>
          <p className="text-sm text-white/70 mt-0.5">
            {formatAge(m.birthdate)} anos · {m.country_of_origin}
          </p>
          <p className="text-sm text-white/70">
            📍 {m.mission?.short_name} · {m.current_area ?? 'Área não definida'}
          </p>
        </div>
      </div>
      <Link
        href={`/consultas/nova?missionaryId=${m.id}`}
        className="text-sm font-semibold px-4 py-2 rounded-lg flex-shrink-0 transition-colors"
        style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
      >
        + Consulta
      </Link>
    </div>
  )
}
```

Create `components/missionaries/mission-info-block.tsx`:
```tsx
import { Missionary } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export function MissionInfoBlock({ missionary: m }: { missionary: Missionary }) {
  const rows = [
    { label: 'Missão', value: m.mission?.name },
    { label: 'Área atual', value: m.current_area },
    { label: 'Companheiro', value: m.companion_name },
    { label: 'Chegada', value: m.mission_start_date ? formatDate(m.mission_start_date) : null },
    { label: 'Término previsto', value: m.mission_expected_end ? formatDate(m.mission_expected_end) : null },
  ]
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
      <h3 className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Missão</h3>
      <div className="flex flex-col gap-2">
        {rows.map(r => r.value && (
          <div key={r.label} className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
            <span className="font-medium text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Create `components/missionaries/medical-info-block.tsx`:
```tsx
import { Missionary } from '@/lib/types'

export function MedicalInfoBlock({ missionary: m }: { missionary: Missionary }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
      <h3 className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Info Médica</h3>
      <div className="flex flex-col gap-2 text-sm">
        {m.blood_type && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Tipo sanguíneo</span>
            <span className="font-medium">{m.blood_type}</span>
          </div>
        )}
        {m.allergies && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Alergias</span>
            <span className="font-medium text-red-400">{m.allergies}</span>
          </div>
        )}
        {m.chronic_conditions && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Condições</span>
            <span className="font-medium text-right max-w-[60%]">{m.chronic_conditions}</span>
          </div>
        )}
        {m.emergency_contact_name && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Contato emergência</span>
            <span className="font-medium text-right">
              {m.emergency_contact_name}
              {m.emergency_contact_phone && ` · ${m.emergency_contact_phone}`}
            </span>
          </div>
        )}
        {!m.blood_type && !m.allergies && !m.chronic_conditions && !m.emergency_contact_name && (
          <p style={{ color: 'var(--text-muted)' }}>Nenhuma info médica registrada.</p>
        )}
      </div>
    </div>
  )
}
```

Create `components/missionaries/consultation-history.tsx`:
```tsx
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ConsultationStatus } from '@/lib/types'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  resolved: 'Resolvido',
  follow_up: 'Acompanhamento',
  referral: 'Encaminhamento',
}

interface Consultation {
  id: string
  consulted_at: string
  chief_complaint: string | null
  diagnosis: string | null
  cid10: string | null
  treatment: string | null
  status: ConsultationStatus
  follow_up_date: string | null
}

export function ConsultationHistory({ consultations, missionaryId }: { consultations: Consultation[]; missionaryId: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
      <div
        className="px-4 py-3 flex justify-between items-center text-xs uppercase tracking-wide"
        style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
      >
        <span>Histórico de Consultas</span>
        <Link href={`/consultas/nova?missionaryId=${missionaryId}`} className="text-violet-400 hover:text-violet-300 normal-case font-normal text-xs">
          + Nova
        </Link>
      </div>
      {consultations.length === 0 ? (
        <p className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Sem consultas registradas.</p>
      ) : (
        consultations.map((c, i) => (
          <div
            key={c.id}
            className="px-4 py-3 text-sm"
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
          </div>
        ))
      )}
    </div>
  )
}
```

- [ ] **Step 7: Create missionary profile page**

Create `app/missionaries/[id]/page.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'
import { ProfileHeader } from '@/components/missionaries/profile-header'
import { MissionInfoBlock } from '@/components/missionaries/mission-info-block'
import { MedicalInfoBlock } from '@/components/missionaries/medical-info-block'
import { ConsultationHistory } from '@/components/missionaries/consultation-history'
import { getMissionaryById, getConsultationHistory } from '@/lib/queries/missionaries'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function MissionaryProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [missionary, consultations] = await Promise.all([
    getMissionaryById(id).catch(() => null),
    getConsultationHistory(id),
  ])

  if (!missionary) notFound()

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/missionaries" className="hover:text-white transition-colors">Missionários</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{missionary.preferred_name}</span>
          <Link href={`/missionaries/${id}/edit`} className="ml-auto text-violet-400 hover:text-violet-300 text-xs">Editar</Link>
        </div>
        <div className="flex flex-col gap-4">
          <ProfileHeader missionary={missionary as any} />
          <div className="grid md:grid-cols-2 gap-4">
            <MissionInfoBlock missionary={missionary as any} />
            <MedicalInfoBlock missionary={missionary as any} />
          </div>
          <ConsultationHistory consultations={consultations as any} missionaryId={id} />
        </div>
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 8: Verify list and profile load**

```bash
npm run dev
```

Add a missionary manually in Supabase Table Editor, then navigate to `/missionaries`. Clicking the card should open the profile. Expected: no TypeScript errors, data renders correctly.

- [ ] **Step 9: Commit**

```bash
git add lib/queries/missionaries.ts components/missionaries/ app/missionaries/
git commit -m "feat: add missionaries list and profile pages"
```

---

## Task 8: New/Edit Missionary Form

**Files:**
- Create: `lib/actions/missionaries.ts`
- Create: `components/missionaries/missionary-form.tsx`
- Create: `app/missionaries/new/page.tsx`
- Create: `app/missionaries/[id]/edit/page.tsx`

- [ ] **Step 1: Create missionary server actions**

Create `lib/actions/missionaries.ts`:
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createMissionary(formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('missionaries')
    .insert({
      full_name: formData.get('full_name') as string,
      preferred_name: formData.get('preferred_name') as string,
      birthdate: formData.get('birthdate') as string,
      country_of_origin: (formData.get('country_of_origin') as string) || 'Brasil',
      mission_id: formData.get('mission_id') as string,
      current_area: formData.get('current_area') as string || null,
      companion_name: formData.get('companion_name') as string || null,
      mission_start_date: formData.get('mission_start_date') as string || null,
      mission_expected_end: formData.get('mission_expected_end') as string || null,
      phone: formData.get('phone') as string || null,
      emergency_contact_name: formData.get('emergency_contact_name') as string || null,
      emergency_contact_phone: formData.get('emergency_contact_phone') as string || null,
      blood_type: formData.get('blood_type') as string || null,
      allergies: formData.get('allergies') as string || null,
      chronic_conditions: formData.get('chronic_conditions') as string || null,
      notes: formData.get('notes') as string || null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  redirect(`/missionaries/${data.id}`)
}

export async function updateMissionary(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('missionaries')
    .update({
      full_name: formData.get('full_name') as string,
      preferred_name: formData.get('preferred_name') as string,
      birthdate: formData.get('birthdate') as string,
      country_of_origin: (formData.get('country_of_origin') as string) || 'Brasil',
      mission_id: formData.get('mission_id') as string,
      current_area: formData.get('current_area') as string || null,
      companion_name: formData.get('companion_name') as string || null,
      mission_start_date: formData.get('mission_start_date') as string || null,
      mission_expected_end: formData.get('mission_expected_end') as string || null,
      phone: formData.get('phone') as string || null,
      emergency_contact_name: formData.get('emergency_contact_name') as string || null,
      emergency_contact_phone: formData.get('emergency_contact_phone') as string || null,
      blood_type: formData.get('blood_type') as string || null,
      allergies: formData.get('allergies') as string || null,
      chronic_conditions: formData.get('chronic_conditions') as string || null,
      notes: formData.get('notes') as string || null,
      status: formData.get('status') as string || 'active',
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  redirect(`/missionaries/${id}`)
}
```

- [ ] **Step 2: Create missionary form component**

Create `components/missionaries/missionary-form.tsx`:
```tsx
'use client'
import { Mission, Missionary } from '@/lib/types'

interface Props {
  missions: Mission[]
  missionary?: Missionary
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function MissionaryForm({ missions, missionary: m, action, submitLabel }: Props) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Dados Pessoais</h3>
        <Field label="Nome completo" name="full_name" required defaultValue={m?.full_name} />
        <Field label="Nome preferido (ex: Elder Silva)" name="preferred_name" required defaultValue={m?.preferred_name} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data de nascimento" name="birthdate" type="date" required defaultValue={m?.birthdate} />
          <Field label="País de origem" name="country_of_origin" defaultValue={m?.country_of_origin ?? 'Brasil'} />
        </div>
        <Field label="Telefone" name="phone" type="tel" defaultValue={m?.phone ?? ''} />
      </section>

      <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Missão</h3>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Missão *</label>
          <select
            name="mission_id"
            required
            defaultValue={m?.mission_id ?? ''}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">Selecionar...</option>
            {missions.map(miss => (
              <option key={miss.id} value={miss.id}>{miss.name}</option>
            ))}
          </select>
        </div>
        <Field label="Área atual" name="current_area" defaultValue={m?.current_area ?? ''} />
        <Field label="Nome do companheiro" name="companion_name" defaultValue={m?.companion_name ?? ''} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data de chegada" name="mission_start_date" type="date" defaultValue={m?.mission_start_date ?? ''} />
          <Field label="Término previsto" name="mission_expected_end" type="date" defaultValue={m?.mission_expected_end ?? ''} />
        </div>
        {m && (
          <div>
            <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Status</label>
            <select
              name="status"
              defaultValue={m.status}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              <option value="active">Ativo</option>
              <option value="transferred">Transferido</option>
              <option value="released">Liberado</option>
              <option value="medical_leave">Licença médica</option>
            </select>
          </div>
        )}
      </section>

      <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Info Médica</h3>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Tipo sanguíneo</label>
          <select
            name="blood_type"
            defaultValue={m?.blood_type ?? ''}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">Desconhecido</option>
            {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Field label="Alergias" name="allergies" defaultValue={m?.allergies ?? ''} placeholder="Ex: Penicilina, Dipirona" />
        <Field label="Condições crônicas" name="chronic_conditions" defaultValue={m?.chronic_conditions ?? ''} textarea />
        <Field label="Contato de emergência (nome)" name="emergency_contact_name" defaultValue={m?.emergency_contact_name ?? ''} />
        <Field label="Contato de emergência (telefone)" name="emergency_contact_phone" type="tel" defaultValue={m?.emergency_contact_phone ?? ''} />
        <Field label="Observações gerais" name="notes" defaultValue={m?.notes ?? ''} textarea />
      </section>

      <button
        type="submit"
        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  )
}

function Field({
  label, name, required, defaultValue, type = 'text', placeholder, textarea
}: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  type?: string
  placeholder?: string
  textarea?: boolean
}) {
  const sharedStyle = {
    background: 'var(--bg-base)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  }
  const sharedClass = 'w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500'
  return (
    <div>
      <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
        {label}{required && ' *'}
      </label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={3} className={sharedClass} style={sharedStyle} />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} className={sharedClass} style={sharedStyle} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create new missionary page**

Create `app/missionaries/new/page.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'
import { MissionaryForm } from '@/components/missionaries/missionary-form'
import { getMissions } from '@/lib/queries/missionaries'
import { createMissionary } from '@/lib/actions/missionaries'
import Link from 'next/link'

export default async function NewMissionaryPage() {
  const missions = await getMissions()
  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/missionaries" className="hover:text-white transition-colors">Missionários</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Novo</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Novo Missionário</h1>
        <MissionaryForm missions={missions} action={createMissionary} submitLabel="Cadastrar Missionário" />
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 4: Create edit missionary page**

Create `app/missionaries/[id]/edit/page.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'
import { MissionaryForm } from '@/components/missionaries/missionary-form'
import { getMissionaryById, getMissions } from '@/lib/queries/missionaries'
import { updateMissionary } from '@/lib/actions/missionaries'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditMissionaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [missionary, missions] = await Promise.all([
    getMissionaryById(id).catch(() => null),
    getMissions(),
  ])
  if (!missionary) notFound()

  const action = updateMissionary.bind(null, id)

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/missionaries" className="hover:text-white transition-colors">Missionários</Link>
          <span>›</span>
          <Link href={`/missionaries/${id}`} className="hover:text-white transition-colors">{missionary.preferred_name}</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Editar</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Editar Missionário</h1>
        <MissionaryForm missions={missions} missionary={missionary as any} action={action} submitLabel="Salvar Alterações" />
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 5: Test new missionary flow**

```bash
npm run dev
```

Navigate to `/missionaries/new`, fill in the form, submit. Expected: redirected to the new missionary's profile page with all data showing correctly.

- [ ] **Step 6: Commit**

```bash
git add lib/actions/missionaries.ts components/missionaries/missionary-form.tsx app/missionaries/new/ app/missionaries/[id]/edit/
git commit -m "feat: add new and edit missionary forms"
```

---

## Task 9: Consultation Form

**Files:**
- Create: `lib/actions/consultations.ts`
- Create: `components/consultations/allergy-alert.tsx`
- Create: `components/consultations/vital-signs-fields.tsx`
- Create: `components/consultations/consultation-form.tsx`
- Create: `app/consultas/nova/page.tsx`

- [ ] **Step 1: Create consultation server action**

Create `lib/actions/consultations.ts`:
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createConsultation(formData: FormData) {
  const supabase = await createClient()
  const missionaryId = formData.get('missionary_id') as string

  const { error } = await supabase.from('consultations').insert({
    missionary_id: missionaryId,
    appointment_id: formData.get('appointment_id') as string || null,
    consulted_at: formData.get('consulted_at') as string,
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
  })

  if (error) throw new Error(error.message)
  redirect(`/missionaries/${missionaryId}`)
}
```

- [ ] **Step 2: Create allergy alert component**

Create `components/consultations/allergy-alert.tsx`:
```tsx
export function AllergyAlert({ allergies }: { allergies: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-4 border border-red-500/30 bg-red-500/10">
      <span className="text-xl flex-shrink-0">⚠️</span>
      <div>
        <div className="font-semibold text-red-400 text-sm">Alergia registrada</div>
        <div className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>{allergies}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create vital signs fields**

Create `components/consultations/vital-signs-fields.tsx`:
```tsx
export function VitalSignsFields() {
  const fields = [
    { name: 'vital_bp', label: 'Pressão arterial', placeholder: '120/80', unit: 'mmHg' },
    { name: 'vital_temp', label: 'Temperatura', placeholder: '36.5', unit: '°C', step: '0.1' },
    { name: 'vital_hr', label: 'Freq. cardíaca', placeholder: '75', unit: 'bpm' },
    { name: 'vital_spo2', label: 'SpO2', placeholder: '98', unit: '%' },
    { name: 'vital_weight', label: 'Peso', placeholder: '70', unit: 'kg', step: '0.1' },
  ]
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        Sinais Vitais <span className="normal-case ml-1 opacity-50">(opcional)</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map(f => (
          <div key={f.name} className="rounded-lg p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
            <div className="flex items-center gap-1.5">
              <input
                name={f.name}
                type={f.step ? 'number' : 'text'}
                step={f.step}
                placeholder={f.placeholder}
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: 'var(--text)' }}
              />
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{f.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create consultation form component**

Create `components/consultations/consultation-form.tsx`:
```tsx
'use client'
import { AllergyAlert } from './allergy-alert'
import { VitalSignsFields } from './vital-signs-fields'
import { Mission, Missionary } from '@/lib/types'
import { useState } from 'react'

interface Props {
  missionaries: (Pick<Missionary, 'id' | 'preferred_name' | 'allergies'> & { mission: Pick<Mission, 'short_name'> | null })[]
  preselectedMissionaryId?: string
  action: (formData: FormData) => Promise<void>
}

export function ConsultationForm({ missionaries, preselectedMissionaryId, action }: Props) {
  const [selectedId, setSelectedId] = useState(preselectedMissionaryId ?? '')
  const selected = missionaries.find(m => m.id === selectedId)
  const now = new Date()
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="missionary_id" value={selectedId} />

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Missionário *</label>
          <select
            required
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">Selecionar missionário...</option>
            {missionaries.map(m => (
              <option key={m.id} value={m.id}>
                {m.preferred_name} · {m.mission?.short_name}
              </option>
            ))}
          </select>
        </div>

        {selected?.allergies && <AllergyAlert allergies={selected.allergies} />}

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Data e hora *</label>
          <input
            name="consulted_at"
            type="datetime-local"
            required
            defaultValue={localNow}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
        <VitalSignsFields />
      </div>

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <TextArea label="Queixa principal" name="chief_complaint" placeholder="Descreva a queixa do missionário..." />
        <TextArea label="Anotações clínicas" name="clinical_notes" placeholder="Exame físico, observações..." />
      </div>

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <TextArea label="Diagnóstico" name="diagnosis" placeholder="Ex: Lombalgia aguda" />
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>CID-10 (opcional)</label>
          <input
            name="cid10"
            type="text"
            placeholder="Ex: M54.5"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        <TextArea label="Tratamento / Medicação" name="treatment" placeholder="Ex: Ibuprofeno 400mg 8/8h por 5 dias..." />
      </div>

      <div className="rounded-xl p-4 grid grid-cols-2 gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Data de retorno</label>
          <input
            name="follow_up_date"
            type="date"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Status</label>
          <select
            name="status"
            defaultValue="resolved"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="resolved">Resolvido</option>
            <option value="follow_up">Acompanhamento</option>
            <option value="referral">Encaminhamento</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!selectedId}
        className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Salvar Consulta
      </button>
    </form>
  )
}

function TextArea({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
      />
    </div>
  )
}
```

- [ ] **Step 5: Create consultation page**

Create `app/consultas/nova/page.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'
import { ConsultationForm } from '@/components/consultations/consultation-form'
import { createClient } from '@/lib/supabase/server'
import { createConsultation } from '@/lib/actions/consultations'
import Link from 'next/link'

async function getMissionariesForForm() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('missionaries')
    .select('id, preferred_name, allergies, mission:missions(short_name)')
    .eq('status', 'active')
    .order('preferred_name')
  return data ?? []
}

export default async function NovaConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{ missionaryId?: string }>
}) {
  const { missionaryId } = await searchParams
  const missionaries = await getMissionariesForForm()

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Nova Consulta</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Nova Consulta</h1>
        <ConsultationForm
          missionaries={missionaries as any}
          preselectedMissionaryId={missionaryId}
          action={createConsultation}
        />
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 6: Test consultation flow**

```bash
npm run dev
```

Navigate to `/consultas/nova`, select a missionary that has allergies set. Expected: red allergy alert appears. Fill in the form and submit. Expected: redirected to missionary profile with new consultation in history.

- [ ] **Step 7: Commit**

```bash
git add lib/actions/consultations.ts components/consultations/ app/consultas/
git commit -m "feat: add consultation form with allergy alert and vital signs"
```

---

## Task 10: Agenda Page + Appointment Form

**Files:**
- Create: `lib/queries/agenda.ts`
- Create: `lib/actions/appointments.ts`
- Create: `components/agenda/appointment-card.tsx`
- Create: `components/agenda/day-timeline.tsx`
- Create: `components/agenda/appointment-form.tsx`
- Create: `app/agenda/page.tsx`

- [ ] **Step 1: Create agenda queries**

Create `lib/queries/agenda.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay } from '@/lib/utils'

export async function getAppointmentsForDay(date: Date) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('appointments')
    .select('id, scheduled_at, reason, status, notes, missionary:missionaries(id, preferred_name, mission:missions(short_name, color))')
    .gte('scheduled_at', startOfDay(date))
    .lte('scheduled_at', endOfDay(date))
    .order('scheduled_at')
  return data ?? []
}

export async function getAppointmentDatesInMonth(year: number, month: number) {
  const supabase = await createClient()
  const start = new Date(year, month, 1).toISOString()
  const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
  const { data } = await supabase
    .from('appointments')
    .select('scheduled_at')
    .gte('scheduled_at', start)
    .lte('scheduled_at', end)
  return (data ?? []).map(a => a.scheduled_at.split('T')[0])
}
```

- [ ] **Step 2: Create appointment server action**

Create `lib/actions/appointments.ts`:
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('appointments').insert({
    missionary_id: formData.get('missionary_id') as string,
    scheduled_at: formData.get('scheduled_at') as string,
    reason: formData.get('reason') as string || null,
    status: 'scheduled',
    notes: formData.get('notes') as string || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
  revalidatePath('/dashboard')
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
  revalidatePath('/dashboard')
}
```

- [ ] **Step 3: Create appointment card**

Create `components/agenda/appointment-card.tsx`:
```tsx
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  appointment: {
    id: string
    scheduled_at: string
    reason: string | null
    status: string
    missionary: { id: string; preferred_name: string; mission: { short_name: string; color: string } | null } | null
  }
}

export function AppointmentCard({ appointment: a }: Props) {
  const time = new Date(a.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const missionColor = a.missionary?.mission?.color ?? '#7c3aed'

  return (
    <div className="flex gap-3 items-stretch">
      <div className="text-xs font-semibold w-12 flex-shrink-0 pt-3 text-right" style={{ color: missionColor }}>{time}</div>
      <div className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ background: missionColor }} />
      <div
        className="flex-1 flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 min-w-0"
        style={{ background: 'var(--bg-overlay)' }}
      >
        <div className="min-w-0">
          {a.missionary ? (
            <Link href={`/missionaries/${a.missionary.id}`} className="font-semibold text-sm hover:text-violet-400 transition-colors block truncate">
              {a.missionary.preferred_name}
            </Link>
          ) : (
            <div className="font-semibold text-sm">—</div>
          )}
          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {a.missionary?.mission?.short_name} · {a.reason ?? 'Consulta'}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${APPOINTMENT_STATUS_COLORS[a.status] ?? ''}`}>
          {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create day timeline**

Create `components/agenda/day-timeline.tsx`:
```tsx
import { AppointmentCard } from './appointment-card'

interface Appointment {
  id: string
  scheduled_at: string
  reason: string | null
  status: string
  missionary: { id: string; preferred_name: string; mission: { short_name: string; color: string } | null } | null
}

export function DayTimeline({ appointments, dateLabel }: { appointments: Appointment[]; dateLabel: string }) {
  return (
    <div>
      <div className="mb-3">
        <div className="font-semibold capitalize">{dateLabel}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {appointments.length === 0 ? 'Sem consultas agendadas' : `${appointments.length} consulta${appointments.length !== 1 ? 's' : ''}`}
        </div>
      </div>
      {appointments.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center text-sm"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
        >
          Nenhuma consulta para este dia.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {appointments.map(a => <AppointmentCard key={a.id} appointment={a as any} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create appointment form**

Create `components/agenda/appointment-form.tsx`:
```tsx
'use client'
import { Mission, Missionary } from '@/lib/types'
import { createAppointment } from '@/lib/actions/appointments'
import { useState } from 'react'

interface Props {
  missionaries: (Pick<Missionary, 'id' | 'preferred_name'> & { mission: Pick<Mission, 'short_name'> | null })[]
  defaultDate?: string
}

export function AppointmentForm({ missionaries, defaultDate }: Props) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await createAppointment(formData)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        + Agendar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex justify-between items-center">
              <h2 className="font-bold">Novo Agendamento</h2>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form action={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Missionário *</label>
                <select
                  name="missionary_id"
                  required
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  style={{ background: 'var(--bg-overlay)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <option value="">Selecionar...</option>
                  {missionaries.map(m => (
                    <option key={m.id} value={m.id}>{m.preferred_name} · {m.mission?.short_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Data e hora *</label>
                <input
                  name="scheduled_at"
                  type="datetime-local"
                  required
                  defaultValue={defaultDate}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  style={{ background: 'var(--bg-overlay)', color: 'var(--text)', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Motivo</label>
                <input
                  name="reason"
                  type="text"
                  placeholder="Ex: Retorno, consulta de rotina..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  style={{ background: 'var(--bg-overlay)', color: 'var(--text)', border: '1px solid var(--border)' }}
                />
              </div>
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-1"
              >
                Agendar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 6: Create agenda page**

Create `app/agenda/page.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'
import { DayTimeline } from '@/components/agenda/day-timeline'
import { AppointmentForm } from '@/components/agenda/appointment-form'
import { getAppointmentsForDay } from '@/lib/queries/agenda'
import { createClient } from '@/lib/supabase/server'

async function getMissionariesForForm() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('missionaries')
    .select('id, preferred_name, mission:missions(short_name)')
    .eq('status', 'active')
    .order('preferred_name')
  return data ?? []
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const selectedDate = date ? new Date(date + 'T12:00:00') : new Date()

  const [appointments, missionaries] = await Promise.all([
    getAppointmentsForDay(selectedDate),
    getMissionariesForForm(),
  ])

  const dateLabel = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const selectedStr = selectedDate.toISOString().split('T')[0]
  const isToday = todayStr === selectedStr

  function navDate(offset: number): string {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold">Agenda</h1>
          <AppointmentForm missionaries={missionaries as any} />
        </div>

        <div className="flex items-center justify-between mb-5 rounded-xl p-3" style={{ background: 'var(--bg-overlay)' }}>
          <a href={`/agenda?date=${navDate(-1)}`} className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
            ‹ Anterior
          </a>
          <div className="text-center">
            {isToday && <div className="text-xs text-violet-400 font-semibold mb-0.5">HOJE</div>}
            <div className="text-sm font-semibold capitalize">{dateLabel.split(',')[0]}, {dateLabel.split(',')[1]}</div>
          </div>
          <a href={`/agenda?date=${navDate(1)}`} className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
            Próximo ›
          </a>
        </div>

        <DayTimeline appointments={appointments as any} dateLabel={dateLabel} />
      </div>
    </AppShell>
  )
}
```

- [ ] **Step 7: Test full app flow**

```bash
npm run dev
```

Run through the golden path:
1. Log in at `/login`
2. Dashboard shows today's stats
3. Create a missionary at `/missionaries/new`
4. View profile at `/missionaries/[id]`
5. Schedule an appointment at `/agenda` (click "+ Agendar")
6. Dashboard now shows 1 appointment today
7. Register a consultation at `/consultas/nova?missionaryId=[id]`
8. Profile shows the consultation in history

- [ ] **Step 8: Run all tests**

```bash
npm run test:run
```

Expected: 8 tests pass, 0 fail.

- [ ] **Step 9: Commit**

```bash
git add lib/queries/agenda.ts lib/actions/appointments.ts components/agenda/ app/agenda/
git commit -m "feat: add agenda page with day view and appointment scheduling"
```

---

## Task 11: Deploy to Vercel

**Files:**
- No new files — deployment config only

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/consultorio.git
git push -u origin main
```

- [ ] **Step 2: Deploy on Vercel**

Go to https://vercel.com → New Project → Import from GitHub. Select the `consultorio` repo. Framework preset: **Next.js** (auto-detected).

- [ ] **Step 3: Add environment variables**

In Vercel project settings → **Environment Variables**, add:
- `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key

Mark both as available in **Production**, **Preview**, and **Development**.

- [ ] **Step 4: Trigger deploy**

Click **Deploy**. Expected: build succeeds, app available at `https://consultorio-<hash>.vercel.app`.

- [ ] **Step 5: Verify production**

Open the Vercel URL in mobile browser. Test login, create a missionary, schedule an appointment, register a consultation. Expected: everything works identically to local dev.

- [ ] **Step 6: Final commit**

```bash
git tag v1.0.0-mvp
git push origin v1.0.0-mvp
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Dashboard ✓ · Missionaries list ✓ · Missionary profile ✓ · New/Edit missionary ✓ · Consultation form with allergy alert ✓ · Agenda ✓ · Auth ✓ · Responsive layout ✓ · Free stack ✓
- [x] **Placeholders:** None — all steps contain actual code
- [x] **Type consistency:** `Missionary`, `Mission`, `Appointment`, `Consultation`, `HealthStatus` defined in Task 2 and used consistently in all later tasks. `getMissionaryHealthStatus` defined in `lib/utils.ts` and imported in `health-status-badge.tsx`.
- [x] **Missing:** No V2 features included (receipts, reports, multi-user access — all correctly deferred per spec)
