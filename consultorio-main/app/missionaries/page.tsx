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
          <h1 className="text-xl font-bold">Misioneros</h1>
          <Link
            href="/missionaries/new"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Nuevo
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <Suspense>
            <MissionFilter missions={missions} />
          </Suspense>
          <div className="flex flex-col gap-2">
            {missionaries.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No se encontraron misioneros.
              </p>
            ) : (
              missionaries.map((m: any) => <MissionaryCard key={m.id} missionary={m} />)
            )}
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {missionaries.length} misionero{missionaries.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </AppShell>
  )
}
