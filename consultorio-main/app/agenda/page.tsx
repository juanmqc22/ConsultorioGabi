import { AppShell } from '@/components/layout/app-shell'
import { DayTimeline } from '@/components/agenda/day-timeline'
import { AppointmentForm } from '@/components/agenda/appointment-form'
import { AgendaCalendar } from '@/components/agenda/agenda-calendar'
import { getAppointmentsForDay, getAppointmentDatesInMonth } from '@/lib/queries/agenda'
import { createClient } from '@/lib/supabase/server'
import { toDateStr } from '@/lib/utils'

async function getPatientsForForm() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patients')
    .select('id, preferred_name')
    .eq('status', 'active')
    .order('preferred_name')
  return data ?? []
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const selectedDate = date ? new Date(date + 'T12:00:00') : new Date()

  const [appointments, patients, datesWithAppointments] = await Promise.all([
    getAppointmentsForDay(selectedDate),
    getPatientsForForm(),
    getAppointmentDatesInMonth(selectedDate.getFullYear(), selectedDate.getMonth()),
  ])

  const dateLabel = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold">Agenda</h1>
          <AppointmentForm patients={patients as any} />
        </div>

        <div className="mb-5">
          <AgendaCalendar
            selectedDate={selectedDate}
            datesWithAppointments={datesWithAppointments}
          />
        </div>

        <DayTimeline appointments={appointments as any} dateLabel={dateLabel} />
      </div>
    </AppShell>
  )
}
