'use client'
import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import 'react-day-picker/style.css'

interface Props {
  name: string
  label: string
  required?: boolean
  defaultValue?: string // ISO datetime string
}

export function DateTimePicker({ name, label, required, defaultValue }: Props) {
  const init = defaultValue ? new Date(defaultValue) : new Date()
  const [selected, setSelected] = useState<Date>(init)
  const [hour, setHour] = useState(String(init.getHours()).padStart(2, '0'))
  const [minute, setMinute] = useState(String(init.getMinutes()).padStart(2, '0'))
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const isoValue = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}T${hour}:${minute}:00`

  const formatted = `${selected.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} ${hour}:${minute}`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
        {label}{required && ' *'}
      </label>
      <input type="hidden" name={name} value={isoValue} />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full rounded-lg px-3 py-2.5 text-sm text-left flex justify-between items-center outline-none focus:ring-2 focus:ring-violet-500"
        style={{
          background: 'var(--bg-base)',
          color: 'var(--text)',
          border: `1px solid ${open ? '#7c3aed' : 'var(--border)'}`,
        }}
      >
        <span>{formatted}</span>
        <span style={{ opacity: 0.5, fontSize: '1rem' }}>📅</span>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 rounded-xl shadow-2xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', minWidth: '280px' }}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={date => date && setSelected(date)}
            locale={es}
            weekStartsOn={1}
          />
          <div
            className="flex items-center gap-2 px-4 pb-3 pt-2"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Hora:</span>
            <select
              value={hour}
              onChange={e => setHour(e.target.value)}
              className="rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-violet-500"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ color: 'var(--text-muted)' }}>:</span>
            <select
              value={minute}
              onChange={e => setMinute(e.target.value)}
              className="rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-violet-500"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              {['00', '15', '30', '45'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: '#7c3aed', color: 'white' }}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
