import { AppShell } from '@/components/layout/app-shell'
import { ProfileHeader } from '@/components/missionaries/profile-header'
import { MissionInfoBlock } from '@/components/missionaries/mission-info-block'
import { MedicalInfoBlock } from '@/components/missionaries/medical-info-block'
import { ConsultationHistory } from '@/components/missionaries/consultation-history'
import { DeleteMissionaryButton } from '@/components/missionaries/delete-missionary-button'
import { ExportMissionaryPdfButton } from '@/components/pdf/export-missionary-button'
import { getMissionaryById, getConsultationHistory } from '@/lib/queries/missionaries'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function MissionaryProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [missionary, consultations] = await Promise.all([
    getMissionaryById(id).catch(() => null),
    getConsultationHistory(id),
  ])

  if (!missionary) notFound()

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl">
        <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/missionaries" className="hover:text-white transition-colors">Misioneros</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{missionary.preferred_name}</span>
          <div className="ml-auto flex items-center gap-2">
            <ExportMissionaryPdfButton
              data={{
                missionary: missionary as any,
                consultations: consultations as any,
              }}
            />
            <Link href={`/missionaries/${id}/edit`} className="text-violet-400 hover:text-violet-300 text-xs">Editar</Link>
            <DeleteMissionaryButton id={id} name={missionary.preferred_name} />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <ProfileHeader missionary={missionary as any} />
          <div className="grid md:grid-cols-2 gap-4">
            <MissionInfoBlock missionary={missionary as any} />
            <MedicalInfoBlock missionary={missionary as any} />
          </div>
          <ConsultationHistory consultations={consultations as any} missionaryId={id} />
        </div>
      </div>
    </AppShell>
  )
}
