import { Clock, MapPin, Star, User } from 'lucide-react'

export function HospitalCard({ hospital, isSelected, onSelect }) {
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
      <div className="h-36 w-full overflow-hidden">
        <img src={hospital.image} alt={hospital.name} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-3 p-4 md:p-5">
        <div>
          <h3 className="font-semibold text-slate-900">{hospital.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            {hospital.location}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-900">{hospital.rating}</span>
          <span className="text-slate-500">({hospital.reviews} reviews)</span>
        </div>

        <div className="space-y-2 border-b border-slate-200 pb-4 text-sm">
          <p className="flex items-center gap-2 text-slate-700">
            <Clock className="h-4 w-4 text-cyan-700" />
            {hospital.appointmentTime}
          </p>
          <p className="flex items-center gap-2 text-slate-700">
            <User className="h-4 w-4 text-cyan-700" />
            {hospital.doctorName}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <span className="text-xs text-slate-500">Consultation fee</span>
          <p className="text-xl font-bold text-cyan-700">${hospital.price}</p>
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
