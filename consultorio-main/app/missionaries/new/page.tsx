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
          <Link href="/missionaries" className="hover:text-white transition-colors">Misioneros</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Nuevo</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Nuevo Misionero</h1>
        <MissionaryForm missions={missions} action={createMissionary} submitLabel="Registrar Misionero" />
      </div>
    </AppShell>
  )
}
