'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Início', icon: '📋' },
  { href: '/pacientes', label: 'Pacientes', icon: '👤' },
  { href: '/agenda', label: 'Agenda', icon: '📅' },
  { href: '/consultas/nova', label: 'Consulta', icon: '📝' },
  { href: '/relatorios', label: 'Relatórios', icon: '📊' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-50"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors"
            style={{ color: active ? '#a78bfa' : 'var(--text-muted)' }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
