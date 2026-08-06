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
          <Link to="/" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            Dashboard
          </Link>
          <span className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 cursor-not-allowed opacity-60">
            Network Scanner (próximamente)
          </span>
          <Link to="/ssl" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            SSL Monitor
          </Link>
          <Link to="/dns" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            DNS Analyzer
          </Link>
          <Link to="/whois" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            WHOIS
          </Link>
          <Link to="/hash" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            Hash de Archivos
          </Link>
          <Link to="/password" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            Password Checker
          </Link>
          <Link to="/jwt" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            JWT Inspector
          </Link>
          <Link to="/ia" className="block px-2 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40">
            Asistente IA
          </Link>
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
