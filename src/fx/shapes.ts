export interface Point {
  x: number
  y: number
}

/** Evenly spaced points on a heart outline centred on (cx, cy); `size` is the full width in px. */
export function heartPoints(count: number, cx: number, cy: number, size: number): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    pts.push({ x: cx + (x / 32) * size, y: cy + ((y + 2.5) / 32) * size })
  }
  return pts
}
