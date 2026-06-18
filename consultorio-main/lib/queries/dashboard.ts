import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from '@/lib/utils'

export async function getDashboardData() {
  const supabase = await createClient()
  const today = new Date()

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const [
    { count: todayCount },
    { count: patientCount },
    { count: weekCount },
    { count: monthConsultationsCount },
    { data: todayAppointments },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', startOfDay(today))
      .lte('scheduled_at', endOfDay(today)),
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', startOfWeek(today))
      .lte('scheduled_at', endOfWeek(today)),
    supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .gte('consulted_at', monthStart)
      .lte('consulted_at', monthEnd),
    supabase
      .from('appointments')
      .select('id, scheduled_at, reason, status, patient:patients(id, preferred_name)')
      .gte('scheduled_at', startOfDay(today))
      .lte('scheduled_at', endOfDay(today))
      .order('scheduled_at'),
  ])

  return {
    stats: {
      today: todayCount ?? 0,
      patients: patientCount ?? 0,
      week: weekCount ?? 0,
      monthConsultations: monthConsultationsCount ?? 0,
    },
    todayAppointments: todayAppointments ?? [],
  }
}
