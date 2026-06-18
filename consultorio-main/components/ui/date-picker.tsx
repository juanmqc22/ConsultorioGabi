'use client'
import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import 'react-day-picker/style.css'

interface Props {
  name: string
  label: string
  required?: boolean
  defaultValue?: string // YYYY-MM-DD
  yearRange?: { from: number; to: number }
}

export function DatePicker({ name, label, required, defaultValue, yearRange }: Props) {
  const [selected, setSelected] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue + 'T12:00:00') : undefined
  )
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const isoValue = selected
    ? `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`
    : ''

  const formatted = selected
    ? selected.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

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
          color: selected ? 'var(--text)' : 'var(--text-muted)',
          border: `1px solid ${open ? '#7c3aed' : 'var(--border)'}`,
        }}
      >
        <span>{formatted || 'Seleccionar fecha...'}</span>
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
            onSelect={date => { setSelected(date); setOpen(false) }}
            locale={es}
            weekStartsOn={1}
            captionLayout={yearRange ? 'dropdown' : 'label'}
            startMonth={yearRange ? new Date(yearRange.from, 0) : undefined}
            endMonth={yearRange ? new Date(yearRange.to, 11) : undefined}
          />
        </div>
      )}
    </div>
  )
}
