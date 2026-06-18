'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold mb-2">Algo salió mal</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Ocurrió un error inesperado. Intente nuevamente o vuelva al inicio.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
