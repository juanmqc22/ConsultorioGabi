import { Suspense } from 'react'
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
          <Suspense fallback={null}>
            <ReportFilterForm
              missions={missions}
              missionaries={missionaries}
              currentMissionId={missionId}
            />
          </Suspense>

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
