import Link from 'next/link'
import { formatAge } from '@/lib/utils'
import { HealthStatusBadge } from './health-status-badge'

interface Props {
  patient: {
    id: string
    preferred_name: string
    birthdate: string
    phone: string | null
    email: string | null
    allergies: string | null
    last_consultation?: { status: string }[] | null
  }
}

export function PatientCard({ patient: p }: Props) {
  const lastStatus = p.last_consultation?.[0]?.status as any ?? null
  return (
    <Link
      href={`/pacientes/${p.id}`}
      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
    >
      <div>
        <div className="font-semibold text-sm">{p.preferred_name}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatAge(p.birthdate)} anos{p.phone ? ` · ${p.phone}` : ''}{p.email ? ` · ${p.email}` : ''}
        </div>
      </div>
      <HealthStatusBadge allergies={p.allergies} lastConsultationStatus={lastStatus} />
    </Link>
  )
}
