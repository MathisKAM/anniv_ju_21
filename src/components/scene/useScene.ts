import { useEffect, useMemo, useRef } from 'react'
import { prefersReducedMotion } from '../../fx/env'

const ABORT = Symbol('abort')

/** Helpers shared by the scene mini-games: unmount-safe timers and the reduced-motion flag. */
export function useScene() {
  const reduced = useRef(prefersReducedMotion()).current
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  return useMemo(() => {
    // A sleeping step rejects once unmounted, so a pending sequence never touches the next screen.
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        window.setTimeout(() => (alive.current ? res() : rej(ABORT)), reduced ? Math.min(ms, 450) : ms)
      })
    const run = async (fn: () => Promise<void>) => {
      try {
        await fn()
        return true
      } catch (e) {
        if (e !== ABORT) throw e
        return false
      }
    }
    return { reduced, alive, wait, run }
  }, [reduced])
}
