import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  appointment: {
    id: string
    scheduled_at: string
    reason: string | null
    status: string
    patient: { id: string; preferred_name: string } | null
  }
}

export function AppointmentCard({ appointment: a }: Props) {
  const time = new Date(a.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex gap-3 items-stretch">
      <div className="text-xs font-semibold w-12 flex-shrink-0 pt-3 text-right" style={{ color: 'var(--text-muted)' }}>{time}</div>
      <div className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ background: 'var(--border)' }} />
      <div
        className="flex-1 flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 min-w-0"
        style={{ background: 'var(--bg-overlay)' }}
      >
        <div className="min-w-0">
          {a.patient ? (
            <Link href={`/pacientes/${a.patient.id}`} className="font-semibold text-sm hover:text-violet-400 transition-colors block truncate">
              {a.patient.preferred_name}
            </Link>
          ) : (
            <div className="font-semibold text-sm">—</div>
          )}
          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {a.reason ?? 'Consulta'}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${APPOINTMENT_STATUS_COLORS[a.status as keyof typeof APPOINTMENT_STATUS_COLORS] ?? ''}`}>
          {APPOINTMENT_STATUS_LABELS[a.status as keyof typeof APPOINTMENT_STATUS_LABELS] ?? a.status}
        </span>
      </div>
    </div>
  )
}
