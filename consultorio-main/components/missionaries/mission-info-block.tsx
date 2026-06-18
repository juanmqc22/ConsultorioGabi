import { Missionary } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export function MissionInfoBlock({ missionary: m }: { missionary: Missionary }) {
  const rows = [
    { label: 'Misión', value: m.mission?.name },
    { label: 'Área actual', value: m.current_area },
    { label: 'Compañero', value: m.companion_name },
    { label: 'Llegada', value: m.mission_start_date ? formatDate(m.mission_start_date) : null },
    { label: 'Fin previsto', value: m.mission_expected_end ? formatDate(m.mission_expected_end) : null },
  ]
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
      <h3 className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Misión</h3>
      <div className="flex flex-col gap-2">
        {rows.map(r => r.value && (
          <div key={r.label} className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
            <span className="font-medium text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
