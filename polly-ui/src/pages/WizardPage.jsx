import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Step1Flight } from '../wizard/components/Step1Flight'
import { Step2HealthCheck } from '../wizard/components/Step2HealthCheck'
import { Step3Hotel } from '../wizard/components/Step3Hotel'
import { Step4Review } from '../wizard/components/Step4Review'
import { fetchWizardMetadata } from '../wizard/wizard-data'

const API_BASE_URL = 'http://localhost:5143'
const API_ENDPOINT = `${API_BASE_URL}/api/applications`

const STEPS = [
  { id: 1, title: 'Flight Selection', description: 'Choose your flight' },
  { id: 2, title: 'Health Check', description: 'Medical clearance' },
  { id: 3, title: 'Hotel Booking', description: 'Accommodation' },
  { id: 4, title: 'Review and Submit', description: 'Confirm booking' },
]

function calculateNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    return 1
  }

  const checkIn = new Date(`${checkInDate}T00:00:00`)
  const checkOut = new Date(`${checkOutDate}T00:00:00`)
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return nights > 0 ? nights : 1
}

export default function WizardPage() {
  const navigate = useNavigate()
  const [flights, setFlights] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [hotels, setHotels] = useState([])
  const [isMetadataLoading, setIsMetadataLoading] = useState(true)
  const [metadataError, setMetadataError] = useState('')

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFlightId, setSelectedFlightId] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState(null)
  const [selectedHotelId, setSelectedHotelId] = useState(null)
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [applicationRef, setApplicationRef] = useState('')

  useEffect(() => {
    const today = new Date()
    const travelDate = today.toISOString().split('T')[0]

    const checkIn = new Date(today)
    checkIn.setDate(checkIn.getDate() + 1)

    const checkOut = new Date(today)
    checkOut.setDate(checkOut.getDate() + 3)

    setSelectedDate(travelDate)
    setCheckInDate(checkIn.toISOString().split('T')[0])
    setCheckOutDate(checkOut.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    let isActive = true

    async function loadMetadata() {
      setIsMetadataLoading(true)
      setMetadataError('')

      try {
        const metadata = await fetchWizardMetadata(API_BASE_URL)
        if (!isActive) {
          return
        }

        setFlights(metadata.flights)
        setHospitals(metadata.hospitals)
        setHotels(metadata.hotels)
      } catch (error) {
        if (!isActive) {
          return
        }

        const message = error?.message || 'Khong the tai du lieu metadata tu Backend.'
        setMetadataError(message)
      } finally {
        if (isActive) {
          setIsMetadataLoading(false)
        }
      }
    }

    loadMetadata()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (selectedFlightId && !flights.some((item) => item.id === selectedFlightId)) {
      setSelectedFlightId(null)
    }
  }, [flights, selectedFlightId])

  useEffect(() => {
    if (selectedHospitalId && !hospitals.some((item) => item.id === selectedHospitalId)) {
      setSelectedHospitalId(null)
    }
  }, [hospitals, selectedHospitalId])

  useEffect(() => {
    if (selectedHotelId && !hotels.some((item) => item.id === selectedHotelId)) {
      setSelectedHotelId(null)
    }
  }, [hotels, selectedHotelId])

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return selectedFlightId !== null && selectedDate !== ''
      case 2:
        return selectedHospitalId !== null
      case 3:
        return selectedHotelId !== null
      case 4:
        return true
      default:
        return false
    }
  }, [currentStep, selectedDate, selectedFlightId, selectedHospitalId, selectedHotelId])

  const handleNext = () => {
    if (canProceed && currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const resetWizard = () => {
    setShowSuccess(false)
    setCurrentStep(1)
    setSelectedFlightId(null)
    setSelectedHospitalId(null)
    setSelectedHotelId(null)
    setSubmitError('')
    setApplicationRef('')
  }

  const handleSubmit = async () => {
    const selectedFlight = flights.find((flight) => flight.id === selectedFlightId)
    const selectedHospital = hospitals.find((hospital) => hospital.id === selectedHospitalId)
    const selectedHotel = hotels.find((hotel) => hotel.id === selectedHotelId)

    if (!selectedFlight || !selectedHospital || !selectedHotel) {
      setSubmitError('Please complete all previous steps before submitting.')
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    const payload = {
      customerName: 'Flight Eligibility Applicant',
      medicalPackageCode: `HOSP-${selectedHospital.id}`,
      hotelCode: `HOTEL-${selectedHotel.id}`,
      nights: calculateNights(checkInDate, checkOutDate),
      flightCode: selectedFlight.flightCode,
      seatClass: 'Economy',
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const isJson = (response.headers.get('content-type') || '').includes('application/json')
      const body = isJson ? await response.json() : await response.text()

      if (!response.ok) {
        const details = typeof body === 'string' ? body : JSON.stringify(body)
        throw new Error(`Request failed (${response.status}): ${details}`)
      }

      const correlationId = body?.correlationId || body?.bookingId
      if (correlationId) {
        navigate(`/status?correlationId=${encodeURIComponent(correlationId)}`)
        return
      }

      setApplicationRef(correlationId || `APP-${Date.now()}`)
      setShowSuccess(true)
    } catch (error) {
      const message = error?.message || 'Unable to submit your application.'
      const normalizedMessage = message.toLowerCase()
      const isBackendConnectionError =
        normalizedMessage.includes('err_connection_refused')
        || normalizedMessage.includes('failed to fetch')
        || normalizedMessage.includes('networkerror')

      if (isBackendConnectionError) {
        const backendErrorMessage = 'Lỗi kết nối Backend. Vui lòng kiểm tra xem Backend (cổng 5143) đã được chạy chưa!'
        window.alert(backendErrorMessage)
        setSubmitError(backendErrorMessage)
      } else {
        setSubmitError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 p-4">
        <div className="mx-auto mt-20 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Application Submitted</h1>
          <p className="mb-6 text-slate-600">
            We have received your request and started processing the booking workflow.
          </p>
          <div className="mb-6 rounded-lg bg-cyan-50 p-4 text-left">
            <p className="text-xs text-slate-500">Application Reference</p>
            <p className="font-mono text-lg font-bold text-cyan-800">{applicationRef}</p>
          </div>
          <button
            type="button"
            onClick={resetWizard}
            className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white hover:bg-cyan-700"
          >
            Start New Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-blue-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Flight Eligibility Application</h1>
          <p className="mt-2 text-slate-600">Complete your request in 4 simple steps.</p>
        </header>

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                    currentStep >= step.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-1 flex-1 rounded transition ${
                      currentStep > step.id ? 'bg-cyan-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.id} className="text-center">
                <p className="text-xs font-semibold text-slate-800">{step.title}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl sm:p-8">
          {currentStep === 1 && (
            <Step1Flight
              selectedFlightId={selectedFlightId}
              onFlightSelect={setSelectedFlightId}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              flights={flights}
              isLoading={isMetadataLoading}
              loadError={metadataError}
            />
          )}

          {currentStep === 2 && (
            <Step2HealthCheck
              selectedHospitalId={selectedHospitalId}
              onHospitalSelect={setSelectedHospitalId}
              appointmentDate={selectedDate}
              hospitals={hospitals}
              isLoading={isMetadataLoading}
              loadError={metadataError}
            />
          )}

          {currentStep === 3 && (
            <Step3Hotel
              selectedHotelId={selectedHotelId}
              onHotelSelect={setSelectedHotelId}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              hotels={hotels}
              isLoading={isMetadataLoading}
              loadError={metadataError}
            />
          )}

          {currentStep === 4 && (
            <Step4Review
              flights={flights}
              hospitals={hospitals}
              hotels={hotels}
              flightId={selectedFlightId}
              hospitalId={selectedHospitalId}
              hotelId={selectedHotelId}
              selectedDate={selectedDate}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </section>

        {currentStep !== 4 && (
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
