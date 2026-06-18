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

export function ConsultationHistory({ consultations, patientId }: { consultations: Consultation[]; patientId: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
      <div
        className="px-4 py-3 flex justify-between items-center text-xs uppercase tracking-wide"
        style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
      >
        <span>Histórico de Consultas</span>
        <Link href={`/consultas/nova?patientId=${patientId}`} className="text-violet-400 hover:text-violet-300 normal-case font-normal text-xs">
          + Nova
        </Link>
      </div>
      {consultations.length === 0 ? (
        <p className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Sem consultas registradas.</p>
      ) : (
        consultations.map((c, i) => (
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
        ))
      )}
    </div>
  )
}
