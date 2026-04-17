const IMAGE_NOT_FOUND_URL = '/public/assets/hotels/the-reverie-saigon.jpg'
const REQUEST_TIMEOUT_MS = 15000

const AIRLINE_RENAME_MAP = {
  'pacific airlines': 'Cathay Pacific',
  'vietravel airlines': 'Emirates',
}

function toArray(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.results)) {
    return payload.results
  }

  if (Array.isArray(payload?.records)) {
    return payload.records
  }

  return []
}

function pickString(source, keys, fallback = '') {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

function pickIdString(source, keys, fallback = '') {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }

  return fallback
}

function pickNumber(source, keys, fallback = 0) {
  for (const key of keys) {
    const value = Number(source?.[key])
    if (!Number.isNaN(value) && Number.isFinite(value)) {
      return value
    }
  }

  return fallback
}

function pickArray(source, keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (Array.isArray(value)) {
      return value
    }
  }

  return []
}

function normalizeImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return IMAGE_NOT_FOUND_URL
  }

  const trimmed = url.trim()
  const isAbsoluteHttp = /^https?:\/\//i.test(trimmed)
  const isRootRelative = trimmed.startsWith('/')
  return isAbsoluteHttp || isRootRelative ? trimmed : IMAGE_NOT_FOUND_URL
}

function normalizeAirlineName(name) {
  const normalized = (name || '').trim().toLowerCase()
  if (AIRLINE_RENAME_MAP[normalized]) {
    return AIRLINE_RENAME_MAP[normalized]
  }

  return name || 'Unknown Airline'
}

function toTitleCase(text) {
  return text
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function deriveHotelNameFromImageUrl(imageUrl, fallbackName, index) {
  if (typeof imageUrl !== 'string' || !imageUrl) {
    return fallbackName || `Hotel ${index + 1}`
  }

  try {
    const parsedUrl = new URL(imageUrl, 'http://localhost')
    const textParam = parsedUrl.searchParams.get('text')
    if (textParam) {
      const decodedText = decodeURIComponent(textParam.replace(/\+/g, ' ')).trim()
      return decodedText || fallbackName || `Hotel ${index + 1}`
    }

    const lastSegment = decodeURIComponent(parsedUrl.pathname.split('/').pop() || '')
    const noExtension = lastSegment.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    const withoutSizePrefix = noExtension.replace(/^\d+px-/, '')
    const normalized = withoutSizePrefix.replace(/[_-]+/g, ' ').trim()

    if (!normalized) {
      return fallbackName || `Hotel ${index + 1}`
    }

    return toTitleCase(normalized)
  } catch {
    return fallbackName || `Hotel ${index + 1}`
  }
}

function normalizeAmenities(rawItem) {
  const amenitiesArray = pickArray(rawItem, ['amenities', 'features', 'services'])
  if (amenitiesArray.length > 0) {
    return amenitiesArray
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  }

  const amenitiesText = pickString(rawItem, ['amenities', 'features', 'services'], '')
  if (amenitiesText) {
    return amenitiesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return ['Free WiFi', 'Gym', 'Restaurant']
}

function normalizeFlight(rawItem, index) {
  const rawName = pickString(rawItem, ['airline', 'airlineName', 'name', 'title', 'carrier', 'brand'], `Airline ${index + 1}`)

  return {
    id: pickIdString(rawItem, ['id', 'airlineId', 'flightId', 'code'], `${index + 1}`),
    airline: normalizeAirlineName(rawName),
    flightCode: pickString(rawItem, ['flightCode', 'code', 'airlineCode', 'flightNo', 'flight_number'], `FL-${String(index + 1).padStart(3, '0')}`),
    departure: pickString(rawItem, ['departure', 'from', 'origin', 'fromCity', 'departureCity', 'originCity'], 'Ho Chi Minh City (SGN)'),
    arrival: pickString(rawItem, ['arrival', 'to', 'destination', 'toCity', 'arrivalCity', 'destinationCity'], 'Ha Noi (HAN)'),
    departureTime: pickString(rawItem, ['departureTime', 'departAt', 'timeFrom', 'startTime'], '08:00 AM'),
    arrivalTime: pickString(rawItem, ['arrivalTime', 'arriveAt', 'timeTo', 'endTime'], '10:00 AM'),
    duration: pickString(rawItem, ['duration', 'flightDuration'], '2h 00m'),
    price: pickNumber(rawItem, ['price', 'ticketPrice', 'basePrice', 'fare'], 120),
    seats: pickNumber(rawItem, ['seats', 'availableSeats', 'available', 'remainingSeats'], 12),
    imageUrl: normalizeImageUrl(pickString(rawItem, ['imageUrl', 'image', 'image_url', 'logoUrl', 'photoUrl'], '')),
  }
}

function normalizeHospital(rawItem, index) {
  return {
    id: pickIdString(rawItem, ['id', 'hospitalId', 'medicalId', 'code'], `${index + 1}`),
    name: pickString(rawItem, ['name', 'hospitalName', 'title', 'displayName'], `Hospital ${index + 1}`),
    location: pickString(rawItem, ['location', 'address', 'city', 'district'], 'Ho Chi Minh City'),
    rating: pickNumber(rawItem, ['rating'], 4.5),
    reviews: pickNumber(rawItem, ['reviews', 'reviewCount'], 100),
    appointmentTime: pickString(rawItem, ['appointmentTime', 'schedule', 'openingTime', 'availableTime'], '09:00 AM'),
    doctorName: pickString(rawItem, ['doctorName', 'doctor', 'contactPerson', 'physician'], 'Dr. Nguyen'),
    price: pickNumber(rawItem, ['price', 'fee', 'consultationFee', 'packagePrice'], 45),
    imageUrl: normalizeImageUrl(pickString(rawItem, ['imageUrl', 'image', 'image_url', 'photoUrl'], '')),
  }
}

function normalizeHotel(rawItem, index) {
  const fallbackName = pickString(rawItem, ['name', 'hotelName', 'title', 'displayName'], `Hotel ${index + 1}`)
  const imageUrl = normalizeImageUrl(pickString(rawItem, ['imageUrl', 'image', 'image_url', 'photoUrl'], ''))

  return {
    id: pickIdString(rawItem, ['id', 'hotelId', 'accommodationId', 'code'], `${index + 1}`),
    // Rename all hotels by extracting a name from image URL as requested.
    name: deriveHotelNameFromImageUrl(imageUrl, fallbackName, index),
    location: pickString(rawItem, ['location', 'address', 'city', 'cityName'], 'Ho Chi Minh City'),
    rating: pickNumber(rawItem, ['rating'], 4.5),
    reviews: pickNumber(rawItem, ['reviews', 'reviewCount'], 120),
    roomType: pickString(rawItem, ['roomType', 'type', 'roomCategory'], 'Deluxe Room'),
    price: pickNumber(rawItem, ['price', 'nightlyPrice', 'roomPrice', 'pricePerNight'], 150),
    amenities: normalizeAmenities(rawItem),
    imageUrl,
  }
}

async function fetchJson(url) {
  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: abortController.signal,
    })

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) at ${url}`)
    }

    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchWizardMetadata(apiBaseUrl) {
  const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl

  const [airlinesPayload, hotelsPayload, hospitalsPayload] = await Promise.all([
    fetchJson(`${baseUrl}/api/metadata/airlines`),
    fetchJson(`${baseUrl}/api/metadata/hotels`),
    fetchJson(`${baseUrl}/api/metadata/hospitals`),
  ])

  return {
    flights: toArray(airlinesPayload).map(normalizeFlight),
    hotels: toArray(hotelsPayload).map(normalizeHotel),
    hospitals: toArray(hospitalsPayload).map(normalizeHospital),
  }
}

export { IMAGE_NOT_FOUND_URL }
