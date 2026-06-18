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
