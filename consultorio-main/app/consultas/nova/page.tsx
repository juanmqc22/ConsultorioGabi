import { AppShell } from '@/components/layout/app-shell'
import { ConsultationForm } from '@/components/consultations/consultation-form'
import { createClient } from '@/lib/supabase/server'
import { createConsultation } from '@/lib/actions/consultations'
import Link from 'next/link'

async function getPatientsForForm() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patients')
    .select('id, preferred_name, allergies')
    .eq('status', 'active')
    .order('preferred_name')
  return data ?? []
}

export default async function NovaConsultaPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>
}) {
  const { patientId } = await searchParams
  const patients = await getPatientsForForm()

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/dashboard" className="hover:text-white transition-colors">Início</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Nova Consulta</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Nova Consulta</h1>
        <ConsultationForm
          patients={patients as any}
          preselectedPatientId={patientId}
          action={createConsultation}
        />
      </div>
    </AppShell>
  )
}
