/** Small seeded PRNG so painted skies are identical from one visit to the next. */
export function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(x: number, y: number, s: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1274126177)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

/** Smooth value noise in [0, 1]. */
export function vnoise(x: number, y: number, s: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi, s)
  const b = hash(xi + 1, yi, s)
  const c = hash(xi, yi + 1, s)
  const d = hash(xi + 1, yi + 1, s)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

/** Fractal noise: soft clouds, in [0, 1]. */
export function fbm(x: number, y: number, s: number, octaves = 5) {
  let amp = 0.5
  let f = 1
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise(x * f, y * f, s + i * 17)
    norm += amp
    amp *= 0.5
    f *= 2.02
  }
  return sum / norm
}

/** Ridged noise: thin filaments, in [0, 1]. */
export function ridged(x: number, y: number, s: number, octaves = 4) {
  let amp = 0.5
  let f = 1
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(2 * vnoise(x * f, y * f, s + i * 31) - 1)
    sum += amp * n * n
    norm += amp
    amp *= 0.5
    f *= 2.1
  }
  return sum / norm
}
