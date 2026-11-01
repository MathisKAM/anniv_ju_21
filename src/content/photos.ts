import photo1 from '../assets/photos/photoNous1.jpeg'
import photo2 from '../assets/photos/photoNous2.jpeg'
import photo3 from '../assets/photos/photoNous3.jpeg'
import photo4 from '../assets/photos/photoNous4.jpeg'

/** Our four photos (resized copies of photoNous1 … photoNous4), imported so the bundler always serves the right URL. */
const PHOTOS = { 1: photo1, 2: photo2, 3: photo3, 4: photo4 } as const

export function nousPhoto(n: 1 | 2 | 3 | 4): string {
  return PHOTOS[n]
}
