import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay } from '@/lib/utils'

export async function getAppointmentsForDay(date: Date) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('appointments')
    .select('id, scheduled_at, reason, status, notes, missionary:missionaries(id, preferred_name, mission:missions(short_name, color))')
    .gte('scheduled_at', startOfDay(date))
    .lte('scheduled_at', endOfDay(date))
    .order('scheduled_at')
  return data ?? []
}

export async function getAppointmentDatesInMonth(year: number, month: number) {
  const supabase = await createClient()
  const start = new Date(year, month, 1).toISOString()
  const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
  const { data } = await supabase
    .from('appointments')
    .select('scheduled_at')
    .gte('scheduled_at', start)
    .lte('scheduled_at', end)
  return (data ?? []).map(a => a.scheduled_at.split('T')[0])
}
