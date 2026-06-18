import { getMissionaryHealthStatus, HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS } from '@/lib/utils'
import { ConsultationStatus } from '@/lib/types'

interface Props {
  allergies: string | null
  lastConsultationStatus?: ConsultationStatus | null
}

export function HealthStatusBadge({ allergies, lastConsultationStatus }: Props) {
  const status = getMissionaryHealthStatus(
    { allergies },
    lastConsultationStatus ? { status: lastConsultationStatus } : null
  )
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${HEALTH_STATUS_COLORS[status]}`}>
      {HEALTH_STATUS_LABELS[status]}
    </span>
  )
}
