import { AppShell } from '@/components/layout/app-shell'
import { ProfileHeader } from '@/components/pacientes/profile-header'
import { MedicalInfoBlock } from '@/components/pacientes/medical-info-block'
import { ConsultationHistory } from '@/components/pacientes/consultation-history'
import { DeletePatientButton } from '@/components/pacientes/delete-patient-button'
import { ExportPatientPdfButton } from '@/components/pdf/export-patient-button'
import { getPatientById, getConsultationHistory } from '@/lib/queries/patients'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [patient, consultations] = await Promise.all([
    getPatientById(id).catch(() => null),
    getConsultationHistory(id),
  ])

  if (!patient) notFound()

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/pacientes" className="hover:text-white transition-colors">Pacientes</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{patient.preferred_name}</span>
          <div className="ml-auto flex items-center gap-2">
            <ExportPatientPdfButton
              data={{
                patient: patient as any,
                consultations: consultations as any,
              }}
            />
            <Link href={`/pacientes/${id}/edit`} className="text-violet-400 hover:text-violet-300 text-xs">Editar</Link>
            <DeletePatientButton id={id} name={patient.preferred_name} />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <ProfileHeader patient={patient as any} />
          <MedicalInfoBlock patient={patient as any} />
          <ConsultationHistory consultations={consultations as any} patientId={id} />
        </div>
      </div>
    </AppShell>
  )
}
