'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: '📋' },
  { href: '/missionaries', label: 'Misioneros', icon: '👤' },
  { href: '/agenda', label: 'Agenda', icon: '📅' },
  { href: '/consultas/nova', label: 'Nueva Consulta', icon: '📝' },
  { href: '/relatorios', label: 'Relatórios', icon: '📊' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside
      className="hidden md:flex flex-col w-52 h-screen sticky top-0 border-r p-4 flex-shrink-0"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="font-bold text-violet-400 mb-6 text-base flex items-center gap-2">
        <span>⚕️</span> Consultorio
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: active ? '#a78bfa' : 'var(--text-muted)',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
