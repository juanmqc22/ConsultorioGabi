'use client'
import { Patient } from '@/lib/types'
import { createAppointment } from '@/lib/actions/appointments'
import { useState } from 'react'
import { DateTimePicker } from '@/components/ui/datetime-picker'

interface Props {
  patients: Pick<Patient, 'id' | 'preferred_name'>[]
}

export function AppointmentForm({ patients }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    try {
      setError(null)
      await createAppointment(formData)
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao agendar. Tente novamente.')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        + Agendar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}>
          <div className="w-full rounded-2xl p-6 flex flex-col gap-5" style={{ background: 'var(--bg-surface)', maxHeight: 'calc(100svh - 2rem)', overflowY: 'auto', width: 'min(90vw, 600px)' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Nova Consulta</h2>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <form action={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Paciente *</label>
                <select
                  name="patient_id"
                  required
                  className="w-full rounded-lg px-3 py-3 text-base outline-none focus:ring-2 focus:ring-violet-500"
                  style={{ background: 'var(--bg-overlay)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <option value="">Selecionar...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.preferred_name}</option>
                  ))}
                </select>
              </div>
              <DateTimePicker name="scheduled_at" label="Data e hora" required />
              <div>
                <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Motivo</label>
                <input
                  name="reason"
                  type="text"
                  placeholder="Ex: Acompanhamento, consulta de rotina..."
                  className="w-full rounded-lg px-3 py-3 text-base outline-none focus:ring-2 focus:ring-violet-500"
                  style={{ background: 'var(--bg-overlay)', color: 'var(--text)', border: '1px solid var(--border)' }}
                />
              </div>
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-1"
              >
                Agendar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
