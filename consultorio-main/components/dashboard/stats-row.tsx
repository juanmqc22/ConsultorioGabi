interface Props {
  today: number
  missionaries: number
  week: number
  missions: number
}

export function StatsRow({ today, missionaries, week, missions }: Props) {
  const stats = [
    { label: 'Hoy', value: today, color: '#a78bfa' },
    { label: 'Misioneros', value: missionaries, color: '#34d399' },
    { label: 'Esta semana', value: week, color: '#fbbf24' },
    { label: 'Misiones', value: missions, color: '#22d3ee' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
