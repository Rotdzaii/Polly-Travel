import { AlertCircle, Calendar, MapPin } from 'lucide-react'
import { hotels } from '../wizard-data'
import { HotelCard } from './HotelCard'

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

export function Step3Hotel({ selectedHotelId, onHotelSelect, checkInDate, checkOutDate }) {
  const nights = calculateNights(checkInDate, checkOutDate)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Hotel Accommodation</h2>
        <p className="mt-1 text-slate-600">Pick your hotel for the destination stay.</p>
      </div>

      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Stay Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-4 w-4 text-cyan-700" />
              Check-in
            </p>
            <p className="font-semibold text-slate-900">{formatDate(checkInDate)}</p>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-4 w-4 text-cyan-700" />
              Check-out
            </p>
            <p className="font-semibold text-slate-900">{formatDate(checkOutDate)}</p>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-4 w-4 text-cyan-700" />
              Duration
            </p>
            <p className="font-semibold text-slate-900">
              {nights} night{nights !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
        <p className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Prices below are shown for your selected number of nights.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-900">Available Hotels</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              isSelected={selectedHotelId === hotel.id}
              onSelect={() => onHotelSelect(hotel.id)}
              nights={nights > 0 ? nights : 1}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
