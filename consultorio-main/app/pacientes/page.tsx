import { AppShell } from '@/components/layout/app-shell'
import { PatientCard } from '@/components/pacientes/patient-card'
import { getPatients } from '@/lib/queries/patients'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const patients = await getPatients(q)

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold">Pacientes</h1>
          <Link
            href="/pacientes/new"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Novo
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <Suspense>
            <form method="get" className="flex gap-2">
              <input
                name="q"
                type="search"
                defaultValue={q ?? ''}
                placeholder="Buscar paciente..."
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                style={{ background: 'var(--bg-overlay)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </form>
          </Suspense>
          <div className="flex flex-col gap-2">
            {patients.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Nenhum paciente encontrado.
              </p>
            ) : (
              patients.map((p: any) => <PatientCard key={p.id} patient={p} />)
            )}
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {patients.length} paciente{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </AppShell>
  )
}
