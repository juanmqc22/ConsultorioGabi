import Link from 'next/link'
import { formatAge } from '@/lib/utils'
import { HealthStatusBadge } from './health-status-badge'

interface Props {
  missionary: {
    id: string
    preferred_name: string
    birthdate: string
    country_of_origin: string
    allergies: string | null
    mission: { short_name: string; color: string } | null
    last_consultation?: { status: string }[] | null
  }
}

export function MissionaryCard({ missionary: m }: Props) {
  const lastStatus = m.last_consultation?.[0]?.status as any ?? null
  return (
    <Link
      href={`/missionaries/${m.id}`}
      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
    >
      <div>
        <div className="font-semibold text-sm">{m.preferred_name}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatAge(m.birthdate)} años · {m.country_of_origin} · {m.mission?.short_name ?? '—'}
        </div>
      </div>
      <HealthStatusBadge allergies={m.allergies} lastConsultationStatus={lastStatus} />
    </Link>
  )
}
