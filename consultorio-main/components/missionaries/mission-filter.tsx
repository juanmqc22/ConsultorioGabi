'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mission } from '@/lib/types'

export function MissionFilter({ missions }: { missions: Mission[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const current = params.get('mission') ?? ''

  function select(id: string) {
    const next = new URLSearchParams(params)
    if (id) next.set('mission', id)
    else next.delete('mission')
    router.push(`/missionaries?${next.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => select('')}
        className="text-xs px-3 py-1.5 rounded-full transition-colors"
        style={{
          background: !current ? '#7c3aed' : 'var(--bg-overlay)',
          color: !current ? 'white' : 'var(--text-muted)',
        }}
      >
        Todos
      </button>
      {missions.map(m => (
        <button
          key={m.id}
          onClick={() => select(m.id)}
          className="text-xs px-3 py-1.5 rounded-full transition-colors"
          style={{
            background: current === m.id ? m.color : 'var(--bg-overlay)',
            color: current === m.id ? 'white' : 'var(--text-muted)',
          }}
        >
          {m.short_name}
        </button>
      ))}
    </div>
  )
}
