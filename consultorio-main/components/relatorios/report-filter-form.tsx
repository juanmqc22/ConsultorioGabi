'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Mission } from '@/lib/types'

interface Props {
  missions: Mission[]
  missionaries: { id: string; preferred_name: string }[]
  currentMissionId: string
}

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 4 }, (_, i) => currentYear - i)

export function ReportFilterForm({ missions, missionaries, currentMissionId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset missionary when mission changes
      if (key === 'missionId') params.delete('missionaryId')
      router.push(`/relatorios?${params.toString()}`)
    },
    [router, searchParams]
  )

  const selectClass =
    'w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500'
  const selectStyle = {
    background: 'var(--bg-base)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  }

  return (
    <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
      <h2 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Filtros
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Missão *
          </label>
          <select
            value={searchParams.get('missionId') ?? ''}
            onChange={e => updateParam('missionId', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">Selecionar missão...</option>
            {missions.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Mês *
          </label>
          <select
            value={searchParams.get('month') ?? String(new Date().getMonth() + 1)}
            onChange={e => updateParam('month', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Ano *
          </label>
          <select
            value={searchParams.get('year') ?? String(currentYear)}
            onChange={e => updateParam('year', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Status
          </label>
          <select
            value={searchParams.get('status') ?? 'all'}
            onChange={e => updateParam('status', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="all">Todos</option>
            <option value="resolved">Resuelto</option>
            <option value="follow_up">Seguimiento</option>
            <option value="referral">Derivación</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Misionero
          </label>
          <select
            value={searchParams.get('missionaryId') ?? ''}
            onChange={e => updateParam('missionaryId', e.target.value)}
            disabled={!currentMissionId}
            className={selectClass}
            style={{ ...selectStyle, opacity: !currentMissionId ? 0.5 : 1 }}
          >
            <option value="">Todos</option>
            {missionaries.map(m => (
              <option key={m.id} value={m.id}>{m.preferred_name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
