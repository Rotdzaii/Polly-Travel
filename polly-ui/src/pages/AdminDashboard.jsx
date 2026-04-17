import { useMemo, useState } from 'react'
import { ClipboardList, XCircle } from 'lucide-react'

const pendingApplications = [
  { id: 'APP-2401', passenger: 'Nguyen Van A', submittedAt: '2026-04-16 08:20', stage: 'Medical Clearance', status: 'Pending' },
  { id: 'APP-2402', passenger: 'Tran Thi B', submittedAt: '2026-04-16 08:45', stage: 'Hotel Reservation', status: 'Pending' },
  { id: 'APP-2403', passenger: 'Le Van C', submittedAt: '2026-04-16 09:10', stage: 'Space Flight Booking', status: 'Pending' },
  { id: 'APP-2404', passenger: 'Pham Thi D', submittedAt: '2026-04-16 09:22', stage: 'Medical Clearance', status: 'Pending' },
  { id: 'APP-2405', passenger: 'Hoang Van E', submittedAt: '2026-04-16 09:40', stage: 'Hotel Reservation', status: 'Pending' },
]

export default function AdminDashboard() {
  const [applications, setApplications] = useState(pendingApplications)

  const pendingCount = useMemo(
    () => applications.filter((item) => item.status === 'Pending').length,
    [applications],
  )

  const handleReject = (id) => {
    setApplications((prev) => prev.map((item) => {
      if (item.id !== id || item.status !== 'Pending') {
        return item
      }

      return {
        ...item,
        stage: 'Rejected by Admin',
        status: 'Rejected',
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600">Danh sách hồ sơ đang chờ xử lý (Pending).</p>
              <p className="text-sm text-amber-700">Pending hiện tại: {pendingCount}</p>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Mã hồ sơ</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Hành khách</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Thời gian gửi</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Bước hiện tại</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Trạng thái</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {applications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono text-sm text-slate-800">{item.id}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{item.passenger}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{item.submittedAt}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{item.stage}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleReject(item.id)}
                        disabled={item.status !== 'Pending'}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          item.status !== 'Pending'
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
