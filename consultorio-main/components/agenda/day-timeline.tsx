import { AppointmentCard } from './appointment-card'

interface Appointment {
  id: string
  scheduled_at: string
  reason: string | null
  status: string
  patient: { id: string; preferred_name: string } | null
}

export function DayTimeline({ appointments, dateLabel }: { appointments: Appointment[]; dateLabel: string }) {
  return (
    <div>
      <div className="mb-3">
        <div className="font-semibold capitalize">{dateLabel}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {appointments.length === 0 ? 'Nenhuma consulta agendada' : `${appointments.length} consulta${appointments.length !== 1 ? 's' : ''}`}
        </div>
      </div>
      {appointments.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center text-sm"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
        >
          Nenhuma consulta para este dia.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {appointments.map(a => <AppointmentCard key={a.id} appointment={a} />)}
        </div>
      )}
    </div>
  )
}
