'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚕️</div>
          <h1 className="text-2xl font-bold">Consultório</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Acesso exclusivo da médica</p>
        </div>
        <form
          onSubmit={handleLogin}
          className="rounded-xl p-6 flex flex-col gap-4"
          style={{ background: 'var(--bg-overlay)' }}
        >
          <div>
            <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'var(--bg-base)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'var(--bg-base)', color: 'var(--text)' }}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors mt-1"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
