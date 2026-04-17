import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function MainLayout({ role, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-500">
      {role && (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link to={role === 'admin' ? '/admin' : '/booking'} className="text-lg font-bold text-slate-900">
                Lunar Polly
              </Link>

              <nav className="flex items-center gap-2">
                {role === 'passenger' && (
                  <>
                    <Link to="/booking" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      Booking
                    </Link>
                    <Link to="/status" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      Tracking
                    </Link>
                  </>
                )}

                {role === 'admin' && (
                  <Link to="/admin" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                {role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  )
}
