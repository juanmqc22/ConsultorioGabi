'use client'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { toDateStr } from '@/lib/utils'
import 'react-day-picker/style.css'

interface Props {
  selectedDate: Date
  datesWithAppointments: string[]
}

export function AgendaCalendar({ selectedDate, datesWithAppointments }: Props) {
  const router = useRouter()

  const appointmentDates = datesWithAppointments.map(d => new Date(d + 'T12:00:00'))

  return (
    <div className="rounded-xl p-2" style={{ background: 'var(--bg-overlay)' }}>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={date => {
          if (date) router.push(`/agenda?date=${toDateStr(date)}`)
        }}
        locale={es}
        weekStartsOn={1}
        modifiers={{ hasAppointment: appointmentDates }}
        modifiersClassNames={{ hasAppointment: 'rdp-has-appt' }}
        style={{ width: '100%', margin: 0 }}
      />
    </div>
  )
}
