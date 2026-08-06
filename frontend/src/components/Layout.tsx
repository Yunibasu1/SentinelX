import { Link, Outlet } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-slate-800 bg-ink-900">
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-sky-500 text-sm font-bold text-white">
            S
          </span>
          <span className="text-lg font-semibold text-white">SentinelX</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
          <span className="block px-2 py-2 rounded-lg bg-slate-800/60 text-white font-medium">
            Dashboard
          </span>
          <span className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 cursor-not-allowed opacity-60">
            Network Scanner (próximamente)
          </span>
          <span className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 cursor-not-allowed opacity-60">
            SSL Monitor (próximamente)
          </span>
          <Link to="/dns" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            DNS Analyzer
          </Link>
          <span className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 cursor-not-allowed opacity-60">
            Reportes (próximamente)
          </span>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="text-sm font-medium text-white">{user?.full_name}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-red-500/50 hover:text-red-400"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
