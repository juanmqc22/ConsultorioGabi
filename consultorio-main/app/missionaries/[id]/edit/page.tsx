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
          <Link href="/missionaries" className="hover:text-white transition-colors">Misioneros</Link>
          <span>›</span>
          <Link href={`/missionaries/${id}`} className="hover:text-white transition-colors">{missionary.preferred_name}</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Editar</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Editar Misionero</h1>
        <MissionaryForm missions={missions} missionary={missionary as any} action={action} submitLabel="Guardar Cambios" />
      </div>
    </AppShell>
  )
}
