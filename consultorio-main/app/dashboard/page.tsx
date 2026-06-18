import { AppShell } from '@/components/layout/app-shell'
import { StatsRow } from '@/components/dashboard/stats-row'
import { TodaysAppointments } from '@/components/dashboard/todays-appointments'
import { getDashboardData } from '@/lib/queries/dashboard'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const displayName = (user?.user_metadata?.display_name as string) ?? 'Dr. Quezada'

  const { stats, todayAppointments } = await getDashboardData()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const greetingText = displayName ? `${greeting}, ${displayName}` : greeting

  const dateStr = new Date().toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{greetingText} 👋</h1>
            <p className="text-sm capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>{dateStr}</p>
          </div>
          <Link
            href="/consultas/nova"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Nova consulta
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <StatsRow {...stats} />
          <TodaysAppointments appointments={todayAppointments as any} />
        </div>
      </div>
    </AppShell>
  )
}
