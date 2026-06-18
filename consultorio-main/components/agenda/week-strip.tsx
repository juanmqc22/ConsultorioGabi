'use client'
import Link from 'next/link'
import { getWeekDays, toDateStr } from '@/lib/utils'

interface Props {
  selectedDate: Date
  datesWithAppointments: string[]
}

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function WeekStrip({ selectedDate, datesWithAppointments }: Props) {
  const weekDays = getWeekDays(selectedDate)
  const selectedStr = toDateStr(selectedDate)
  const todayStr = toDateStr(new Date())

  const monthYear = selectedDate.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })

  const prevWeekDate = new Date(weekDays[0])
  prevWeekDate.setDate(prevWeekDate.getDate() - 1)

  const nextWeekDate = new Date(weekDays[6])
  nextWeekDate.setDate(nextWeekDate.getDate() + 1)

  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg-overlay)' }}>
      <div className="flex justify-between items-center mb-3">
        <Link
          href={`/agenda?date=${toDateStr(prevWeekDate)}`}
          className="px-2 py-1 rounded-lg text-sm hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          ‹
        </Link>
        <span className="text-sm font-semibold capitalize">{monthYear}</span>
        <Link
          href={`/agenda?date=${toDateStr(nextWeekDate)}`}
          className="px-2 py-1 rounded-lg text-sm hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          ›
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-xs pb-1" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>{d}</div>
        ))}
        {weekDays.map(day => {
          const str = toDateStr(day)
          const isSelected = str === selectedStr
          const isToday = str === todayStr
          const hasAppt = datesWithAppointments.includes(str)
          return (
            <Link
              key={str}
              href={`/agenda?date=${str}`}
              className="flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: isSelected ? 'white' : isToday ? '#a78bfa' : 'var(--text)' }}
            >
              <span
                className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium"
                style={{ background: isSelected ? '#7c3aed' : 'transparent' }}
              >
                {day.getDate()}
              </span>
              {hasAppt && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: isSelected ? 'white' : '#7c3aed' }}
                />
              )}
              {!hasAppt && <div className="w-1 h-1" />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
