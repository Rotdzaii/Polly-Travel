import { Dumbbell, MapPin, Star, UtensilsCrossed, Wifi } from 'lucide-react'

const amenityIcons = {
  'Free WiFi': <Wifi className="h-4 w-4" />,
  Gym: <Dumbbell className="h-4 w-4" />,
  Restaurant: <UtensilsCrossed className="h-4 w-4" />,
}

export function HotelCard({ hotel, isSelected, onSelect, nights }) {
  const totalPrice = hotel.price * nights

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
        <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-3 p-4 md:p-5">
        <div>
          <h3 className="font-semibold text-slate-900">{hotel.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            {hotel.location}
          </p>
        </div>

        <span className="inline-block rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-700">
          {hotel.roomType}
        </span>

        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-900">{hotel.rating}</span>
          <span className="text-slate-500">({hotel.reviews} reviews)</span>
        </div>

        <div className="border-b border-slate-200 pb-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600"
              >
                {amenityIcons[amenity] || <span>•</span>}
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="px-2 py-1 text-xs text-slate-500">+{hotel.amenities.length - 3} more</span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">Price per night</p>
            <p className="font-semibold text-slate-900">${hotel.price}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">
              {nights} night{nights !== 1 ? 's' : ''}
            </p>
            <p className="text-xl font-bold text-cyan-700">${totalPrice}</p>
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
