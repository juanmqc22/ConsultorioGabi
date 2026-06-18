import { AppShell } from '@/components/layout/app-shell'
import { ConsultationForm } from '@/components/consultations/consultation-form'
import { createClient } from '@/lib/supabase/server'
import { createConsultation } from '@/lib/actions/consultations'
import Link from 'next/link'

async function getMissionariesForForm() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('missionaries')
    .select('id, preferred_name, allergies, mission:missions(short_name)')
    .eq('status', 'active')
    .order('preferred_name')
  return data ?? []
}

export default async function NovaConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{ missionaryId?: string }>
}) {
  const { missionaryId } = await searchParams
  const missionaries = await getMissionariesForForm()

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/dashboard" className="hover:text-white transition-colors">Inicio</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Nueva Consulta</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Nueva Consulta</h1>
        <ConsultationForm
          missionaries={missionaries as any}
          preselectedMissionaryId={missionaryId}
          action={createConsultation}
        />
      </div>
    </AppShell>
  )
}
