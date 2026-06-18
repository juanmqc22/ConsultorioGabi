import { AppShell } from '@/components/layout/app-shell'
import { PatientForm } from '@/components/pacientes/patient-form'
import { getPatientById } from '@/lib/queries/patients'
import { updatePatient } from '@/lib/actions/patients'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patient = await getPatientById(id).catch(() => null)
  if (!patient) notFound()

  const action = updatePatient.bind(null, id)

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/pacientes" className="hover:text-white transition-colors">Pacientes</Link>
          <span>›</span>
          <Link href={`/pacientes/${id}`} className="hover:text-white transition-colors">{patient.preferred_name}</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Editar</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Editar Paciente</h1>
        <PatientForm patient={patient as any} action={action} submitLabel="Salvar Alterações" />
      </div>
    </AppShell>
  )
}
