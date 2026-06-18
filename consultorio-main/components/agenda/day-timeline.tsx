import { AppointmentCard } from './appointment-card'

interface Appointment {
  id: string
  scheduled_at: string
  reason: string | null
  status: string
  missionary: { id: string; preferred_name: string; mission: { short_name: string; color: string } | null } | null
}

export function DayTimeline({ appointments, dateLabel }: { appointments: Appointment[]; dateLabel: string }) {
  return (
    <div>
      <div className="mb-3">
        <div className="font-semibold capitalize">{dateLabel}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {appointments.length === 0 ? 'Sin citas agendadas' : `${appointments.length} cita${appointments.length !== 1 ? 's' : ''}`}
        </div>
      </div>
      {appointments.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center text-sm"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
        >
          No hay citas para este día.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {appointments.map(a => <AppointmentCard key={a.id} appointment={a} />)}
        </div>
      )}
    </div>
  )
}
