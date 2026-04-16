import { CheckCircle, DollarSign, Hotel, Plane, Stethoscope } from 'lucide-react'
import { flights, hospitals, hotels } from '../wizard-data'

function calculateNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    return 0
  }

  const checkIn = new Date(`${checkInDate}T00:00:00`)
  const checkOut = new Date(`${checkOutDate}T00:00:00`)
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr) {
  if (!dateStr) {
    return ''
  }

  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function Step4Review({
  flightId,
  hospitalId,
  hotelId,
  selectedDate,
  checkInDate,
  checkOutDate,
  onSubmit,
  isSubmitting,
  submitError,
}) {
  const selectedFlight = flights.find((flight) => flight.id === flightId)
  const selectedHospital = hospitals.find((hospital) => hospital.id === hospitalId)
  const selectedHotel = hotels.find((hotel) => hotel.id === hotelId)

  const nights = calculateNights(checkInDate, checkOutDate)
  const flightCost = selectedFlight?.price ?? 0
  const hospitalCost = selectedHospital?.price ?? 0
  const hotelCost = (selectedHotel?.price ?? 0) * nights
  const totalCost = flightCost + hospitalCost + hotelCost

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Review Your Booking</h2>
        <p className="mt-1 text-slate-600">Confirm all details before submitting.</p>
      </div>

      {selectedFlight && (
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Plane className="h-5 w-5 text-cyan-700" />
            <h3 className="font-semibold text-slate-900">Flight</h3>
          </div>
          <p className="text-sm text-slate-700">{selectedFlight.airline} ({selectedFlight.flightCode})</p>
          <p className="text-sm text-slate-700">{selectedFlight.departure} → {selectedFlight.arrival}</p>
          <p className="text-sm text-slate-700">Departure: {selectedFlight.departureTime} on {formatDate(selectedDate)}</p>
        </section>
      )}

      {selectedHospital && (
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-cyan-700" />
            <h3 className="font-semibold text-slate-900">Health Check</h3>
          </div>
          <p className="text-sm text-slate-700">{selectedHospital.name}</p>
          <p className="text-sm text-slate-700">Doctor: {selectedHospital.doctorName}</p>
          <p className="text-sm text-slate-700">Appointment: {formatDate(selectedDate)} at {selectedHospital.appointmentTime}</p>
        </section>
      )}

      {selectedHotel && (
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Hotel className="h-5 w-5 text-cyan-700" />
            <h3 className="font-semibold text-slate-900">Hotel</h3>
          </div>
          <p className="text-sm text-slate-700">{selectedHotel.name}</p>
          <p className="text-sm text-slate-700">{formatDate(checkInDate)} to {formatDate(checkOutDate)}</p>
          <p className="text-sm text-slate-700">
            {nights} night{nights !== 1 ? 's' : ''}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-cyan-700" />
          <h3 className="font-semibold text-slate-900">Cost Summary</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Flight</span>
            <span>${flightCost}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Health Check</span>
            <span>${hospitalCost}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>
              Hotel ({nights} night{nights !== 1 ? 's' : ''})
            </span>
            <span>${hotelCost}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-cyan-200 pt-4">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="text-2xl font-bold text-cyan-700">${totalCost}</span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          By submitting, you confirm the provided information is correct.
        </p>
      </section>

      {submitError && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {submitError}
        </section>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition ${
          isSubmitting
            ? 'cursor-not-allowed bg-slate-400'
            : 'bg-cyan-600 hover:bg-cyan-700 active:scale-[0.99]'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </div>
  )
}
