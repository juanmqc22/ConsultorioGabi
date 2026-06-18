import Link from 'next/link'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/utils'

interface Appointment {
  id: string
  scheduled_at: string
  reason: string | null
  status: string
  patient: { id: string; preferred_name: string } | null
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
        return (
          <Link
            key={appt.id}
            href={appt.patient ? `/pacientes/${appt.patient.id}` : '#'}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: '#7c3aed' }} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{appt.patient?.preferred_name ?? '—'}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {appt.reason ?? 'Consulta'}
              </div>
            </div>
            <div className="text-xs font-semibold flex-shrink-0" style={{ color: '#a78bfa' }}>{time}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${APPOINTMENT_STATUS_COLORS[appt.status as keyof typeof APPOINTMENT_STATUS_COLORS] ?? ''}`}>
              {APPOINTMENT_STATUS_LABELS[appt.status as keyof typeof APPOINTMENT_STATUS_LABELS] ?? appt.status}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
