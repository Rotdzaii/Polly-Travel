import { useState, useEffect, useRef } from 'react'
import { Rocket } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { CorrelationIdDisplay } from '../components/CorrelationIdDisplay'
import { ProgressStepper } from '../components/ProgressStepper'
import { ThemeToggle } from '../components/ThemeToggle'
import { TransactionLogs } from '../components/TransactionLogs'

const API_BASE_URL = 'http://localhost:5143'
const STAGE_NAMES = ['Medical Clearance', 'Lunar Hotel Reservation', 'Space Transportation', 'Final Confirmation']

const initialStageState = {
  0: 'idle',
  1: 'idle',
  2: 'idle',
  3: 'idle',
}

export default function BookingStatusPage() {
  const [searchParams] = useSearchParams()
  const [stageStates, setStageStates] = useState(initialStageState)
  const [logs, setLogs] = useState([])
  const [failedStage, setFailedStage] = useState(null)
  const [correlationId, setCorrelationId] = useState('')
  const [isBookingInProgress, setIsBookingInProgress] = useState(false)
  const pollingIntervalRef = useRef(null)
  const lastStatusRef = useRef('')
  const failureStageRef = useRef(null)
  const terminalAlertShownRef = useRef(false)
  const autoTrackedCorrelationIdRef = useRef('')

  const addLog = (message) => {
    const now = new Date()
    const timestamp = now.toLocaleTimeString('en-US', { hour12: false })
    setLogs((prev) => [...prev.slice(-49), { timestamp, message }])
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const applyStatus = (status, reason = '') => {
    const previousStatus = lastStatusRef.current
    const statusChanged = previousStatus !== status
    if (!statusChanged) {
      return
    }

    if (status === 'Initial') {
      setStageStates({ ...initialStageState, 0: 'processing' })
      setFailedStage(null)
      setIsBookingInProgress(true)
    }

    if (status === 'MedicalCleared') {
      setStageStates({ ...initialStageState, 0: 'success', 1: 'processing' })
      setFailedStage(null)
      setIsBookingInProgress(true)
      addLog('[System] Biometric verification completed.')
    }

    if (status === 'HotelReserved') {
      setStageStates({ ...initialStageState, 0: 'success', 1: 'success', 2: 'processing' })
      setFailedStage(null)
      setIsBookingInProgress(true)
      addLog('[System] Lunar Habitat secured.')
    }

    if (status === 'Compensating') {
      let failedIndex = 0
      if (previousStatus === 'MedicalCleared') {
        failedIndex = 1
      }
      if (previousStatus === 'HotelReserved') {
        failedIndex = 2
      }

      failureStageRef.current = failedIndex
      const failedStageName = STAGE_NAMES[failedIndex]
      addLog(`[SAGA ALERT] Failure detected at ${failedStageName}. Initiating compensation flow...`)
      if (reason) {
        addLog(`[Reason] ${reason}`)
      }

      if (failedIndex === 2) {
        setStageStates({ ...initialStageState, 0: 'success', 1: 'compensating', 2: 'failed' })
      } else if (failedIndex === 1) {
        setStageStates({ ...initialStageState, 0: 'compensating', 1: 'failed' })
      } else {
        setStageStates({ ...initialStageState, 0: 'failed' })
      }

      setIsBookingInProgress(true)
      setFailedStage(failedIndex)
      addLog('System is rolling back completed steps to preserve consistency.')
    }

    if (status === 'Failed') {
      const failedIndex = failureStageRef.current
      if (failedIndex === 2) {
        setStageStates({ ...initialStageState, 0: 'cancelled', 1: 'cancelled', 2: 'failed' })
      } else if (failedIndex === 1) {
        setStageStates({ ...initialStageState, 0: 'cancelled', 1: 'failed' })
      } else {
        setStageStates({ ...initialStageState, 0: 'failed' })
      }

      setIsBookingInProgress(false)
      setFailedStage(failedIndex)
      addLog('Compensation completed. Prior successful steps were safely reverted.')
      if (reason) {
        addLog(`[Reason] ${reason}`)
      }
    }

    if (status === 'Success') {
      setStageStates({ 0: 'success', 1: 'success', 2: 'success', 3: 'success' })
      setIsBookingInProgress(false)
      setFailedStage(null)
      addLog('[System] Mission booking committed successfully ✓')
      if (!terminalAlertShownRef.current) {
        terminalAlertShownRef.current = true
        window.alert('Chuc mung hanh khach. Hanh trinh da duoc dat thanh cong!')
      }
    }

    if (status === 'Cancelled') {
      setStageStates({ 0: 'cancelled', 1: 'cancelled', 2: 'cancelled', 3: 'cancelled' })
      setIsBookingInProgress(false)
      setFailedStage(0)
      addLog('[System] Transaction safely reverted. No partial booking remains.')
      if (reason) {
        addLog(`[Reason] ${reason}`)
      }
      if (!terminalAlertShownRef.current) {
        terminalAlertShownRef.current = true
        const cancellationMessage = reason || 'Rat tiec, giao dich da bi huy sau qua trinh bu dap de bao toan du lieu.'
        window.alert(cancellationMessage)
      }
    }

    lastStatusRef.current = status
  }

  const fetchBookingStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          addLog(`[Error] Polling failed: booking id ${id} not found (404).`)
          stopPolling()
          setIsBookingInProgress(false)
          return
        }

        if (response.status >= 500) {
          addLog(`[Error] Polling failed: backend service error (${response.status}).`)
          return
        }

        addLog(`[Error] Polling failed with unexpected status (${response.status}).`)
        return
      }

      const payload = await response.json()
      applyStatus(payload.status, payload.message || '')

      if (payload.status === 'Success' || payload.status === 'Cancelled' || payload.status === 'Failed') {
        stopPolling()
      }
    } catch (error) {
      addLog(`[Error] Polling failed due to connection issue: ${error.message}`)
    }
  }

  const startTrackingBooking = async (id) => {
    if (!id) {
      return
    }

    stopPolling()
    lastStatusRef.current = ''
    failureStageRef.current = null
    terminalAlertShownRef.current = false
    setCorrelationId(id)
    setIsBookingInProgress(true)
    setStageStates({ ...initialStageState, 0: 'processing' })
    setFailedStage(null)
    addLog(`[System] Tracking booking status. CorrelationId: ${id}`)

    await fetchBookingStatus(id)
    pollingIntervalRef.current = setInterval(() => {
      fetchBookingStatus(id)
    }, 2000)
  }

  const startBooking = async () => {
    if (isBookingInProgress) {
      return
    }

    try {
      terminalAlertShownRef.current = false
      stopPolling()
      lastStatusRef.current = ''
      failureStageRef.current = null

      addLog('🚀 Starting distributed booking transaction...')
      setIsBookingInProgress(true)
      setStageStates({ ...initialStageState, 0: 'processing' })
      setFailedStage(null)
      setCorrelationId('')

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Lunar Traveler',
          medicalPackageCode: 'MED-STANDARD',
          hotelCode: 'LUNAR-HOTEL-A',
          nights: 3,
          flightCode: 'FLIGHT-001',
          seatClass: 'Economy',
        }),
      })

      if (!response.ok) {
        if (response.status === 500) {
          addLog('[Error] Booking request failed: backend service error (500).')
        } else {
          addLog(`[Error] Booking request failed (${response.status}).`)
        }
        setIsBookingInProgress(false)
        return
      }

      const payload = await response.json()
      const id = payload.correlationId
      addLog(`[System] Booking request accepted. CorrelationId: ${id}`)
      await startTrackingBooking(id)
    } catch (error) {
      addLog(`[Error] Booking request failed due to connection issue: ${error.message}`)
      setIsBookingInProgress(false)
    }
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  useEffect(() => {
    const correlationIdFromQuery = searchParams.get('correlationId') || searchParams.get('bookingId') || ''
    if (!correlationIdFromQuery || autoTrackedCorrelationIdRef.current === correlationIdFromQuery) {
      return
    }

    autoTrackedCorrelationIdRef.current = correlationIdFromQuery
    void startTrackingBooking(correlationIdFromQuery)
  }, [searchParams])

  const getBookButtonLabel = () => {
    if (isBookingInProgress) {
      return 'Booking In Progress...'
    }

    return correlationId ? 'Book Again' : 'Book'
  }

  return (
    <div className="min-h-screen relative bg-app-bg text-app-text transition-colors duration-500">
      <div className="space-overlay absolute inset-0 pointer-events-none"></div>
      <div className="nebula-effect top-[-8rem] right-[-7rem] h-[26rem] w-[26rem]"></div>
      <div className="nebula-effect bottom-[-9rem] left-[-8rem] h-[24rem] w-[24rem]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:px-8 md:py-8">
        <header className="sticky top-0 z-50 bg-app-bg/80 backdrop-blur-md mb-6 md:mb-8 border-b border-app-border/60">
          <div className="flex justify-between items-center gap-4 py-3">
            <div className="flex items-center gap-3">
              <Rocket className="w-7 h-7 neon-cyan" />
              <h1 className="text-2xl md:text-3xl font-bold neon-cyan tracking-[0.18em]">LUNAR POLLY</h1>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={startBooking}
                disabled={isBookingInProgress}
                className="px-4 py-2 rounded-md border border-cyan-400/60 text-cyan-300 font-mono text-xs hover:bg-cyan-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {getBookButtonLabel()}
              </button>
              <div className="flex items-center text-xs font-mono text-app-muted">
              </div>
            </div>
          </div>
          <p className="text-app-muted pb-3">Distributed Transaction Tracker</p>
        </header>

        <main className="pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8 overflow-y-auto">
              <CorrelationIdDisplay correlationId={correlationId} />
              <ProgressStepper stageStates={stageStates} failedStage={failedStage} />
            </div>
            <div className="lg:col-span-1">
              <TransactionLogs logs={logs} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}