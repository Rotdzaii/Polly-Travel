export const IMAGE_NOT_FOUND_URL = '/public/assets/hotels/the-reverie-saigon.jpg'

export function handleImageError(event) {
  const image = event.currentTarget

  if (image.dataset.fallbackApplied === 'true') {
    return
  }

  image.dataset.fallbackApplied = 'true'
  image.src = IMAGE_NOT_FOUND_URL
}
