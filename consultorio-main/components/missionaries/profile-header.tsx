import { Missionary } from '@/lib/types'
import { formatAge } from '@/lib/utils'
import Link from 'next/link'

export function ProfileHeader({ missionary: m }: { missionary: Missionary }) {
  const initials = m.preferred_name.split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div
      className="rounded-xl p-5 flex items-start justify-between gap-4"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          {initials}
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">{m.preferred_name}</h1>
          <p className="text-sm text-white/70 mt-0.5">
            {formatAge(m.birthdate)} anos · {m.country_of_origin}
          </p>
          <p className="text-sm text-white/70">
            📍 {m.mission?.short_name} · {m.current_area ?? 'Área no definida'}
          </p>
        </div>
      </div>
      <Link
        href={`/consultas/nova?missionaryId=${m.id}`}
        className="text-sm font-semibold px-4 py-2 rounded-lg flex-shrink-0 transition-colors"
        style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
      >
        + Consulta
      </Link>
    </div>
  )
}
