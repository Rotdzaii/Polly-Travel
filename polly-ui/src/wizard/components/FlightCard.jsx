import { Clock, Plane } from 'lucide-react'

export function FlightCard({ flight, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full overflow-hidden rounded-2xl border text-left transition ${
        isSelected
          ? 'border-cyan-500 bg-cyan-50/70 shadow-lg shadow-cyan-100'
          : 'border-slate-200 bg-white/80 hover:border-cyan-300 hover:shadow-md'
      }`}
    >
      <div className="flex flex-col md:flex-row">
        <div className="h-40 w-full overflow-hidden md:h-auto md:w-52">
          <img src={flight.image} alt={flight.airline} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plane className="h-4 w-4 text-cyan-700" />
            <h3 className="font-semibold text-slate-900">{flight.airline}</h3>
            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700">
              {flight.flightCode}
            </span>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Departure</p>
              <p className="text-sm font-semibold text-slate-900">{flight.departureTime}</p>
              <p className="text-xs text-slate-500">{flight.departure}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs text-slate-500">Duration</p>
              <Clock className="my-1 h-4 w-4 text-slate-500" />
              <p className="text-xs font-medium text-slate-800">{flight.duration}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Arrival</p>
              <p className="text-sm font-semibold text-slate-900">{flight.arrivalTime}</p>
              <p className="text-xs text-slate-500">{flight.arrival}</p>
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-slate-200 pt-4">
            <div>
              <p className="text-xs text-slate-500">Available seats</p>
              <p className="font-semibold text-slate-900">{flight.seats}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Price per person</p>
              <p className="text-2xl font-bold text-cyan-700">${flight.price}</p>
            </div>
          </div>
        </div>
      </div>
      {isSelected && (
        <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-sm font-bold text-white">
          ✓
        </span>
      )}
    </button>
  )
}
