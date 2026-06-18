import { AppShell } from '@/components/layout/app-shell'
import { PatientForm } from '@/components/pacientes/patient-form'
import { createPatient } from '@/lib/actions/patients'
import Link from 'next/link'

export default async function NewPatientPage() {
  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/pacientes" className="hover:text-white transition-colors">Pacientes</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Novo</span>
        </div>
        <h1 className="text-xl font-bold mb-5">Novo Paciente</h1>
        <PatientForm action={createPatient} submitLabel="Cadastrar Paciente" />
      </div>
    </AppShell>
  )
}
