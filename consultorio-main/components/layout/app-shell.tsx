import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0 min-w-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
