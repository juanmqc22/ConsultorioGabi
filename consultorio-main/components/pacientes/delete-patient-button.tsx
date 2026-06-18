'use client'
import { useState } from 'react'
import { deletePatient } from '@/lib/actions/patients'

export function DeletePatientButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await deletePatient(id)
    } catch {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: 'rgba(239,68,68,0.12)',
          color: '#ef4444',
          border: '1px solid rgba(239,68,68,0.3)',
        }}
      >
        Excluir
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="text-center text-3xl">⚠️</div>
            <h2 className="text-center font-bold text-base">Excluir paciente?</h2>
            <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Serão excluídos permanentemente{' '}
              <strong style={{ color: 'var(--text)' }}>{name}</strong>{' '}
              e todas as suas consultas e agendamentos. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg py-2.5 text-sm transition-colors"
                style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: '#ef4444', color: 'white' }}
              >
                {loading ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
