import { Navigate, useNavigate } from 'react-router-dom'
import { LogIn, Shield, User } from 'lucide-react'

export default function Login({ onLogin, currentRole }) {
  const navigate = useNavigate()

  if (currentRole === 'passenger') {
    return <Navigate to="/booking" replace />
  }

  if (currentRole === 'admin') {
    return <Navigate to="/admin" replace />
  }

  const handleLogin = (role) => {
    onLogin(role)
    navigate(role === 'admin' ? '/admin' : '/booking', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto mt-16 w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Đăng nhập hệ thống</h1>
          <p className="mt-2 text-slate-600">
            Chọn vai trò để truy cập đúng khu vực chức năng.
          </p>
        </div>

        <div className="grid gap-4">
          <button
            type="button"
            onClick={() => handleLogin('passenger')}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Đăng nhập với tư cách Hành khách (Passenger)</p>
                <p className="text-sm text-slate-600">Truy cập luồng Booking nhiều bước.</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleLogin('admin')}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Đăng nhập với tư cách Admin</p>
                <p className="text-sm text-slate-600">Theo dõi danh sách hồ sơ đang Pending.</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
