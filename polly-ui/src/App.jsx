import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import BookingStatusPage from './pages/BookingStatusPage'
import WizardPage from './pages/WizardPage'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'

const ROLE_STORAGE_KEY = 'polly-ui-role'

function ProtectedRoute({ role, allowedRoles, children }) {
	if (!role) {
		return <Navigate to="/login" replace />
	}

	if (!allowedRoles.includes(role)) {
		return <Navigate to={role === 'admin' ? '/admin' : '/booking'} replace />
	}

	return children
}

function App() {
	const [role, setRole] = useState(() => localStorage.getItem(ROLE_STORAGE_KEY) || '')

	useEffect(() => {
		if (role) {
			localStorage.setItem(ROLE_STORAGE_KEY, role)
			return
		}

		localStorage.removeItem(ROLE_STORAGE_KEY)
	}, [role])

	const defaultPath = useMemo(() => {
		if (role === 'admin') {
			return '/admin'
		}

		if (role === 'passenger') {
			return '/booking'
		}

		return '/login'
	}, [role])

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login onLogin={setRole} currentRole={role} />} />

				<Route element={<MainLayout role={role} onLogout={() => setRole('')} />}>
					<Route path="/" element={<Navigate to={defaultPath} replace />} />

					<Route
						path="/booking"
						element={(
							<ProtectedRoute role={role} allowedRoles={['passenger']}>
								<WizardPage />
							</ProtectedRoute>
						)}
					/>

					<Route
						path="/status"
						element={(
							<ProtectedRoute role={role} allowedRoles={['passenger']}>
								<BookingStatusPage />
							</ProtectedRoute>
						)}
					/>

					<Route
						path="/admin"
						element={(
							<ProtectedRoute role={role} allowedRoles={['admin']}>
								<AdminDashboard />
							</ProtectedRoute>
						)}
					/>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
