import { Suspense } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { getPatientsForSelect } from '@/lib/queries/patients'
import { getConsultationsByFilters } from '@/lib/queries/consultations'
import { ReportFilterForm } from '@/components/relatorios/report-filter-form'
import { ExportPeriodPdfButton } from '@/components/pdf/export-period-button'
import { formatDate } from '@/lib/utils'
import { ConsultationStatus, ConsultationFilterResult } from '@/lib/types'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  resolved: 'Resolvido',
  follow_up: 'Acompanhamento',
  referral: 'Encaminhamento',
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
    month?: string
    year?: string
    status?: string
    patientId?: string
  }>
}) {
  const params = await searchParams
  const patients = await getPatientsForSelect()

  const month = parseInt(params.month ?? String(new Date().getMonth() + 1))
  const year = parseInt(params.year ?? String(new Date().getFullYear()))
  const status = (params.status ?? 'all') as ConsultationStatus | 'all'
  const patientId = params.patientId ?? ''

  const consultations = await getConsultationsByFilters({
    month,
    year,
    status,
    patientId: patientId || undefined,
  })

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <h1 className="text-xl font-bold mb-5">Relatórios</h1>

        <div className="flex flex-col gap-4">
          <Suspense fallback={null}>
            <ReportFilterForm patients={patients} />
          </Suspense>

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
                      <th className="px-4 py-2 text-left font-normal">Paciente</th>
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
                        <td className="px-4 py-2.5">{c.patient?.preferred_name ?? '—'}</td>
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

          <ExportPeriodPdfButton
            data={{
              month,
              year,
              consultations,
            }}
          />
        </div>
      </div>
    </AppShell>
  )
}
