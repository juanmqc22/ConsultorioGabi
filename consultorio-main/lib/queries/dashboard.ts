import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from '@/lib/utils'

export async function getDashboardData() {
  const supabase = await createClient()
  const today = new Date()

  const [
    { count: todayCount },
    { count: missionaryCount },
    { count: weekCount },
    { count: missionCount },
    { data: todayAppointments },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', startOfDay(today))
      .lte('scheduled_at', endOfDay(today)),
    supabase
      .from('missionaries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', startOfWeek(today))
      .lte('scheduled_at', endOfWeek(today)),
    supabase
      .from('missions')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('id, scheduled_at, reason, status, missionary:missionaries(id, preferred_name, mission:missions(short_name, color))')
      .gte('scheduled_at', startOfDay(today))
      .lte('scheduled_at', endOfDay(today))
      .order('scheduled_at'),
  ])

  return {
    stats: {
      today: todayCount ?? 0,
      missionaries: missionaryCount ?? 0,
      week: weekCount ?? 0,
      missions: missionCount ?? 0,
    },
    todayAppointments: todayAppointments ?? [],
  }
}
