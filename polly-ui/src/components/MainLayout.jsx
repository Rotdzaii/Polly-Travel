import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-app-bg text-app-text transition-colors duration-500">
      <main>
        <Outlet />
      </main>
    </div>
  )
}
