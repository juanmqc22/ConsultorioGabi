'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  patients: { id: string; preferred_name: string }[]
}

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 4 }, (_, i) => currentYear - i)

export function ReportFilterForm({ patients }: Props) {
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
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Mês
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
            Ano
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
            <option value="resolved">Resolvido</option>
            <option value="follow_up">Acompanhamento</option>
            <option value="referral">Encaminhamento</option>
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Paciente
          </label>
          <select
            value={searchParams.get('patientId') ?? ''}
            onChange={e => updateParam('patientId', e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">Todos</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.preferred_name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
