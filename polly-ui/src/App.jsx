import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import BookingStatusPage from './pages/BookingStatusPage'
import WizardPage from './pages/WizardPage'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<MainLayout />}>
					<Route path="/" element={<WizardPage />} />
					<Route path="/status" element={<BookingStatusPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
