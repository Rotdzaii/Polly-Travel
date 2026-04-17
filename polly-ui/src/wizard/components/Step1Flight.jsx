import { AlertCircle, Calendar } from 'lucide-react'
import { FlightCard } from './FlightCard'

function getUpcomingDates() {
  const dates = []
  const today = new Date()

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }

  return dates
}

function formatDateLabel(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

export function Step1Flight({
  selectedFlightId,
  onFlightSelect,
  selectedDate,
  onDateChange,
  flights,
  isLoading,
  loadError,
}) {
  const upcomingDates = getUpcomingDates()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Select Your Flight</h2>
        <p className="mt-1 text-slate-600">Choose a flight that works best for your trip.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6">
        <div className="mb-4 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-cyan-700" />
          <h3 className="font-semibold text-slate-900">Travel Date</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {upcomingDates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => onDateChange(date)}
              className={`rounded-lg border p-3 text-center text-sm transition ${
                selectedDate === date
                  ? 'border-cyan-600 bg-cyan-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50'
              }`}
            >
              {formatDateLabel(date)}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
        <p className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Flights are loaded from backend metadata endpoint.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-900">Available Flights</h3>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            Loading airline metadata...
          </div>
        )}

        {!isLoading && loadError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && flights.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            No flights available from backend.
          </div>
        )}

        {!isLoading && !loadError && flights.length > 0 && (
          <div className="grid gap-4">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isSelected={selectedFlightId === flight.id}
                onSelect={() => onFlightSelect(flight.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
