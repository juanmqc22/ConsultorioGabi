'use client'
import { useState } from 'react'
import { deleteMissionary } from '@/lib/actions/missionaries'

export function DeleteMissionaryButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteMissionary(id)
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
        Eliminar
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
            <h2 className="text-center font-bold text-base">¿Eliminar misionero?</h2>
            <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Se eliminarán permanentemente{' '}
              <strong style={{ color: 'var(--text)' }}>{name}</strong>{' '}
              y todas sus consultas y citas. Esta acción no se puede deshacer.
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
                {loading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
